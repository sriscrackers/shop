import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { upiAccount } from "@/server/db/schema";

const upiAccountInput = z.object({
	label: z.string().min(1).max(60),
	upiId: z.string().max(80).optional(),
	phoneNumber: z.string().min(10).max(15),
	sortOrder: z.number().int().default(0),
	isActive: z.boolean().default(true),
});

export const upiAccountRouter = createTRPCRouter({
	list: publicProcedure.query(({ ctx }) =>
		ctx.db
			.select()
			.from(upiAccount)
			.where(eq(upiAccount.isActive, true))
			.orderBy(asc(upiAccount.sortOrder)),
	),

	adminList: protectedProcedure.query(({ ctx }) =>
		ctx.db.select().from(upiAccount).orderBy(asc(upiAccount.sortOrder)),
	),

	create: protectedProcedure
		.input(upiAccountInput)
		.mutation(({ ctx, input }) =>
			ctx.db.insert(upiAccount).values(input).returning(),
		),

	update: protectedProcedure
		.input(upiAccountInput.partial().extend({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { id, ...rest } = input;
			const [updated] = await ctx.db
				.update(upiAccount)
				.set(rest)
				.where(eq(upiAccount.id, id))
				.returning();
			if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
			return updated;
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db.delete(upiAccount).where(eq(upiAccount.id, input.id));
			return { success: true };
		}),
});