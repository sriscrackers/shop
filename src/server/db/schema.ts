import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	numeric,
	pgEnum,
	pgSequence,
	pgTableCreator,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `cracker_${name}`);

// ---------------- better-auth tables ----------------

export const user = createTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const session = createTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = createTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", {
		withTimezone: true,
	}),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
		withTimezone: true,
	}),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const verification = createTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ---------------- enums & sequences ----------------

export const orderStatusEnum = pgEnum("order_status", [
	"pending",
	"contacted",
	"confirmed",
	"cancelled",
]);

export const guestSessionStatusEnum = pgEnum("guest_session_status", [
	"active",
	"submitted",
]);

export const orderBillSeq = pgSequence("cracker_order_bill_seq", {
	startWith: 1001,
	increment: 1,
});

// ---------------- catalog ----------------

// src/server/db/schema.ts — patch category:
export const category = createTable("category", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	discountLabel: text("discount_label"),
	imageUrl: text("image_url"),
	sortOrder: integer("sort_order").notNull().default(0),
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const product = createTable(
	"product",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		categoryId: text("category_id")
			.notNull()
			.references(() => category.id, { onDelete: "cascade" }),

		code: text("product_code").notNull(), // was: integer("product_code").notNull()
		name: text("name").notNull(),
		unit: text("unit").notNull().default("PKT"),
		imageUrl: text("image_url"),
		mrpPrice: numeric("mrp_price", { precision: 10, scale: 2 }).notNull(),
		discountPrice: numeric("discount_price", {
			precision: 10,
			scale: 2,
		}).notNull(),
		sortOrder: integer("sort_order").notNull().default(0),
		isActive: boolean("is_active").notNull().default(true),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [index("product_category_idx").on(t.categoryId)],
);

// ---------------- guest cart ----------------

export const guestSession = createTable("guest_session", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	status: guestSessionStatusEnum("status").notNull().default("active"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	lastActiveAt: timestamp("last_active_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const cartItem = createTable(
	"cart_item",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		guestSessionId: text("guest_session_id")
			.notNull()
			.references(() => guestSession.id, { onDelete: "cascade" }),
		productId: text("product_id")
			.notNull()
			.references(() => product.id, { onDelete: "cascade" }),
		quantity: integer("quantity").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		index("cart_item_session_idx").on(t.guestSessionId),
		uniqueIndex("cart_item_session_product_uq").on(
			t.guestSessionId,
			t.productId,
		),
	],
);

// ---------------- orders / bills ----------------

export const order = createTable("order", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	billNumber: text("bill_number").notNull().unique(),
	guestSessionId: text("guest_session_id").references(() => guestSession.id, {
		onDelete: "set null",
	}),
	customerName: text("customer_name").notNull(),
	customerWhatsapp: text("customer_whatsapp").notNull(),
	customerAddress: text("customer_address").notNull(),
	customerState: text("customer_state").notNull(),
	netTotal: numeric("net_total", { precision: 10, scale: 2 }).notNull(),
	youSave: numeric("you_save", { precision: 10, scale: 2 }).notNull(),
	grandTotal: numeric("grand_total", { precision: 10, scale: 2 }).notNull(),
	status: orderStatusEnum("status").notNull().default("pending"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const orderItem = createTable(
	"order_item",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		orderId: text("order_id")
			.notNull()
			.references(() => order.id, { onDelete: "cascade" }),
		productId: text("product_id").references(() => product.id, {
			onDelete: "set null",
		}),
		// snapshotted so historical bills stay accurate even if admin edits prices later
		productCode: text("product_code").notNull(),
		productName: text("product_name").notNull(),
		unit: text("unit").notNull(),
		mrpPrice: numeric("mrp_price", { precision: 10, scale: 2 }).notNull(),
		discountPrice: numeric("discount_price", {
			precision: 10,
			scale: 2,
		}).notNull(),
		quantity: integer("quantity").notNull(),
		lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
	},
	(t) => [index("order_item_order_idx").on(t.orderId)],
);

// ---------------- site config ----------------

export const bankAccount = createTable("bank_account", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	bankName: text("bank_name").notNull(),
	accountHolderName: text("account_holder_name").notNull(),
	accountNumber: text("account_number").notNull(),
	ifscCode: text("ifsc_code").notNull(),
	branchName: text("branch_name"),
	sortOrder: integer("sort_order").notNull().default(0),
	isActive: boolean("is_active").notNull().default(true),
});

export const upiAccount = createTable("upi_account", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	label: text("label").notNull(), // e.g. "Google Pay"
	upiId: text("upi_id"), // e.g. "9626965591@okicici" — optional, phone-only UPI is common
	phoneNumber: text("phone_number").notNull(), // e.g. "9626965591"
	sortOrder: integer("sort_order").notNull().default(0),
	isActive: boolean("is_active").notNull().default(true),
});

export const siteSetting = createTable("site_setting", {
	id: integer("id").primaryKey().default(1),
	shopName: text("shop_name").notNull().default("Sri's Crackers Shop"),
	shopAddress: text("shop_address"),
	contactEmail: text("contact_email"),
	announcementText: text("announcement_text"),
	minimumOrderAmount: numeric("minimum_order_amount", {
		precision: 10,
		scale: 2,
	})
		.notNull()
		.default("0"),
	whatsappNumber: text("whatsapp_number"),
	contactPhonePrimary: text("contact_phone_primary"),
	contactPhoneSecondary: text("contact_phone_secondary"),
	address: text("address"),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// ---------------- relations ----------------

export const categoryRelations = relations(category, ({ many }) => ({
	products: many(product),
}));

export const productRelations = relations(product, ({ one, many }) => ({
	category: one(category, {
		fields: [product.categoryId],
		references: [category.id],
	}),
	cartItems: many(cartItem),
}));

export const guestSessionRelations = relations(guestSession, ({ many }) => ({
	cartItems: many(cartItem),
	orders: many(order),
}));

export const cartItemRelations = relations(cartItem, ({ one }) => ({
	guestSession: one(guestSession, {
		fields: [cartItem.guestSessionId],
		references: [guestSession.id],
	}),
	product: one(product, {
		fields: [cartItem.productId],
		references: [product.id],
	}),
}));

export const orderRelations = relations(order, ({ one, many }) => ({
	guestSession: one(guestSession, {
		fields: [order.guestSessionId],
		references: [guestSession.id],
	}),
	items: many(orderItem),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
	order: one(order, { fields: [orderItem.orderId], references: [order.id] }),
	product: one(product, {
		fields: [orderItem.productId],
		references: [product.id],
	}),
}));

export const lead = createTable("lead", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
	mobile: text("mobile").notNull(),
	source: text("source"), // "home_popup" | "contact_page"
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});
