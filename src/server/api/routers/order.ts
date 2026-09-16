import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import {
	createTRPCRouter,
	guestProcedure,
	protectedProcedure,
} from "@/server/api/trpc";
import { cartItem, order, orderItem, product } from "@/server/db/schema";

const checkoutInput = z.object({
	customerName: z.string().min(2).max(120),
	customerWhatsapp: z.string().min(8).max(20),
	customerAddress: z.string().min(5).max(500),
	customerState: z.string().min(2).max(100),
});

const statusEnum = z.enum(["pending", "contacted", "confirmed", "cancelled"]);

export const orderRouter = createTRPCRouter({
	// confirm step in the cart → generates the bill
	submit: guestProcedure
		.input(checkoutInput)
		.mutation(async ({ ctx, input }) => {
			const items = await ctx.db
				.select({
					productId: product.id,
					code: product.code,
					name: product.name,
					unit: product.unit,
					mrpPrice: product.mrpPrice,
					discountPrice: product.discountPrice,
					quantity: cartItem.quantity,
				})
				.from(cartItem)
				.innerJoin(product, eq(cartItem.productId, product.id))
				.where(eq(cartItem.guestSessionId, ctx.guestSession.id));

			if (items.length === 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Your cart is empty",
				});
			}

			const netTotal = items.reduce(
				(sum, i) => sum + Number(i.mrpPrice) * i.quantity,
				0,
			);
			const grandTotal = items.reduce(
				(sum, i) => sum + Number(i.discountPrice) * i.quantity,
				0,
			);
			const youSave = netTotal - grandTotal;

			const createdOrder = await ctx.db.transaction(async (tx) => {
				// atomic, race-safe bill numbering
				const seqResult = await tx.execute<{ nextval: number }>(
					sql`select nextval('cracker_order_bill_seq') as nextval`,
				);
				const seqRow = seqResult[0];

				if (!seqRow) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to generate bill number",
					});
				}

				const billNumber = `SS-EST-${String(seqRow.nextval).padStart(4, "0")}`;

				const [newOrder] = await tx
					.insert(order)
					.values({
						billNumber,
						guestSessionId: ctx.guestSession.id,
						customerName: input.customerName,
						customerWhatsapp: input.customerWhatsapp,
						customerAddress: input.customerAddress,
						customerState: input.customerState,
						netTotal: netTotal.toFixed(2),
						youSave: youSave.toFixed(2),
						grandTotal: grandTotal.toFixed(2),
					})
					.returning();

				if (!newOrder) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to create order",
					});
				}

				await tx.insert(orderItem).values(
					items.map((i) => ({
						orderId: newOrder.id,
						productId: i.productId,
						productCode: i.code,
						productName: i.name,
						unit: i.unit,
						mrpPrice: i.mrpPrice,
						discountPrice: i.discountPrice,
						quantity: i.quantity,
						lineTotal: (Number(i.discountPrice) * i.quantity).toFixed(2),
					})),
				);

				await tx
					.delete(cartItem)
					.where(eq(cartItem.guestSessionId, ctx.guestSession.id));

				return newOrder;
			});

			return { ...createdOrder, items };
		}),

	// lets the guest re-fetch their own just-placed bill (e.g. to re-download the PDF)
	getMyOrder: guestProcedure
		.input(z.object({ billNumber: z.string() }))
		.query(async ({ ctx, input }) => {
			const [found] = await ctx.db
				.select()
				.from(order)
				.where(eq(order.billNumber, input.billNumber))
				.limit(1);

			if (!found || found.guestSessionId !== ctx.guestSession.id) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const items = await ctx.db
				.select()
				.from(orderItem)
				.where(eq(orderItem.orderId, found.id));

			return { ...found, items };
		}),

	list: protectedProcedure
		.input(z.object({ status: statusEnum.optional() }))
		.query(async ({ ctx, input }) => {
			return ctx.db
				.select()
				.from(order)
				.where(input.status ? eq(order.status, input.status) : undefined)
				.orderBy(sql`${order.createdAt} desc`);
		}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const [found] = await ctx.db
				.select()
				.from(order)
				.where(eq(order.id, input.id))
				.limit(1);

			if (!found) throw new TRPCError({ code: "NOT_FOUND" });

			const items = await ctx.db
				.select()
				.from(orderItem)
				.where(eq(orderItem.orderId, found.id));

			return { ...found, items };
		}),

	updateStatus: protectedProcedure
		.input(z.object({ id: z.string(), status: statusEnum }))
		.mutation(async ({ ctx, input }) => {
			const [updated] = await ctx.db
				.update(order)
				.set({ status: input.status, updatedAt: new Date() })
				.where(eq(order.id, input.id))
				.returning();

			if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
			return updated;
		}),

	// permanently removes the order; orderItems cascade-delete via FK
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [deleted] = await ctx.db
				.delete(order)
				.where(eq(order.id, input.id))
				.returning();

			if (!deleted) throw new TRPCError({ code: "NOT_FOUND" });
			return { success: true };
		}),
});