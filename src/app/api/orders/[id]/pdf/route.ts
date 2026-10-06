import { renderToBuffer } from "@react-pdf/renderer";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { auth } from "@/server/better-auth";
import { db } from "@/server/db";
import { order, orderItem, siteSetting } from "@/server/db/schema";
import { GUEST_SESSION_COOKIE } from "@/server/guest-session";
import { OrderBillDocument } from "@/server/pdf/order-bill";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	const [found] = await db
		.select()
		.from(order)
		.where(eq(order.id, id))
		.limit(1);
	if (!found) return new Response("Not found", { status: 404 });

	const guestCookie = req.cookies.get(GUEST_SESSION_COOKIE)?.value;
	const session = await auth.api.getSession({ headers: req.headers });
	const isOwner = guestCookie && found.guestSessionId === guestCookie;
	const isAdmin = !!session?.user;

	if (!isOwner && !isAdmin) {
		return new Response("Forbidden", { status: 403 });
	}

	const [items, settingsRows] = await Promise.all([
		db.select().from(orderItem).where(eq(orderItem.orderId, id)),
		db.select().from(siteSetting).where(eq(siteSetting.id, 1)).limit(1),
	]);
	const settings = settingsRows[0];

	const pdfBuffer = await renderToBuffer(
		OrderBillDocument({
			data: {
				billNumber: found.billNumber,
				createdAt: found.createdAt,
				customerName: found.customerName,
				customerWhatsapp: found.customerWhatsapp,
				customerAddress: found.customerAddress,
				customerState: found.customerState,
				netTotal: found.netTotal,
				youSave: found.youSave,
				grandTotal: found.grandTotal,
				items: items.map((item) => ({
					...item,
					productCode: String(item.productCode),
				})),
				shop: {
					name: settings?.shopName ?? "Sri's Crackers Shop",
					address: settings?.shopAddress ?? null,
				},
			},
		}),
	);

	// Buffer<ArrayBufferLike> isn't directly assignable to BodyInit under
	// newer @types/node — wrap in a plain Uint8Array to satisfy the Response type.
	return new Response(new Uint8Array(pdfBuffer), {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="${found.billNumber}.pdf"`,
		},
	});
}