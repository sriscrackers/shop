import { eq } from "drizzle-orm";
import { z } from "zod";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { siteSetting } from "@/server/db/schema";

const settingsInput = z.object({
	shopName: z.string().min(1).max(150).optional(),
	shopAddress: z.string().max(500).optional(),
	announcementText: z.string().max(300).optional(),
	minimumOrderAmount: z.number().nonnegative().optional(),
	whatsappNumber: z.string().max(20).optional(),
	contactPhonePrimary: z.string().max(20).optional(),
	contactPhoneSecondary: z.string().max(20).optional(),
	address: z.string().max(500).optional(),
	contactEmail: z.string().email("Enter a valid email"),
});

async function getOrCreateSettings(db: typeof import("@/server/db").db) {
	const [existing] = await db
		.select()
		.from(siteSetting)
		.where(eq(siteSetting.id, 1))
		.limit(1);
	if (existing) return existing;

	const [created] = await db
		.insert(siteSetting)
		.values({ id: 1 })
		.onConflictDoNothing()
		.returning();
	if (created) return created;

	const [fallback] = await db
		.select()
		.from(siteSetting)
		.where(eq(siteSetting.id, 1))
		.limit(1);
	if (!fallback) throw new Error("Failed to establish site settings row");
	return fallback;
}

export const settingsRouter = createTRPCRouter({
	get: publicProcedure.query(({ ctx }) => getOrCreateSettings(ctx.db)),

	update: protectedProcedure
		.input(settingsInput)
		.mutation(async ({ ctx, input }) => {
			await getOrCreateSettings(ctx.db); // ensure row exists
			const { minimumOrderAmount, ...rest } = input;
			const [updated] = await ctx.db
				.update(siteSetting)
				.set({
					...rest,
					...(minimumOrderAmount !== undefined
						? { minimumOrderAmount: minimumOrderAmount.toFixed(2) }
						: {}),
					updatedAt: new Date(),
				})
				.where(eq(siteSetting.id, 1))
				.returning();
			return updated;
		}),
});