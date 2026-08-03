import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().url(),
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		BETTER_AUTH_SECRET: z.string().min(16),
		UPLOADTHING_TOKEN: z.string().optional(),
		// used only by the one-off seed script, never read at runtime
		INITIAL_ADMIN_EMAIL: z.string().email().optional(),
		INITIAL_ADMIN_PASSWORD: z.string().min(8).optional(),
		INITIAL_ADMIN_NAME: z.string().optional(),
	},
	client: {},
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		NODE_ENV: process.env.NODE_ENV,
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
		INITIAL_ADMIN_EMAIL: process.env.INITIAL_ADMIN_EMAIL,
		INITIAL_ADMIN_PASSWORD: process.env.INITIAL_ADMIN_PASSWORD,
		INITIAL_ADMIN_NAME: process.env.INITIAL_ADMIN_NAME,
	},
	emptyStringAsUndefined: true,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
