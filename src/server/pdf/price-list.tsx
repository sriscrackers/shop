import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
	page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
	header: {
		marginBottom: 16,
		borderBottom: 2,
		borderColor: "#14163A",
		paddingBottom: 8,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
	},
	shopName: { fontSize: 18, fontWeight: 700, color: "#14163A" },
	shopTagline: { color: "#555", marginTop: 2 },
	headerRight: { alignItems: "flex-end" },
	headerLabel: { fontSize: 9, color: "#555" },
	headerDate: { fontSize: 10, color: "#14163A", fontWeight: 700 },
	categoryHeader: {
		backgroundColor: "#D9A640",
		paddingVertical: 5,
		paddingHorizontal: 8,
		marginTop: 10,
		marginBottom: 2,
	},
	categoryText: {
		fontWeight: 700,
		fontSize: 10,
		color: "#14163A",
		textTransform: "uppercase",
	},
	table: { marginTop: 4 },
	tr: {
		flexDirection: "row",
		borderBottom: 1,
		borderColor: "#eee",
		paddingVertical: 4,
	},
	trAlt: { backgroundColor: "#f9f9f9" },
	th: {
		fontWeight: 700,
		backgroundColor: "#14163A",
		color: "#fff",
		paddingVertical: 6,
	},
	cCode: { width: "7%", paddingHorizontal: 4 },
	cName: { width: "34%", paddingHorizontal: 4 },
	cUnit: { width: "10%", paddingHorizontal: 4 },
	cMrp: { width: "15%", textAlign: "right", paddingHorizontal: 4 },
	cPrice: { width: "15%", textAlign: "right", paddingHorizontal: 4 },
	cQty: { width: "9%", textAlign: "right", paddingHorizontal: 4 },
	cTotal: { width: "10%", textAlign: "right", paddingHorizontal: 4 },
	mrpText: { color: "#888", textDecoration: "line-through" },
	discountText: { color: "#C8202F", fontWeight: 700 },
	footer: {
		marginTop: 20,
		paddingTop: 8,
		borderTop: 1,
		borderColor: "#ddd",
		fontSize: 9,
		color: "#555",
		flexDirection: "row",
		justifyContent: "space-between",
	},
});

export interface PriceListGroup {
	categoryName: string;
	discountLabel: string | null;
	items: {
		code: number | string;
		name: string;
		unit: string;
		mrpPrice: string;
		discountPrice: string;
	}[];
}

export interface PriceListDocumentData {
	shop: { name: string; address: string | null };
	groups: PriceListGroup[];
	generatedAt: Date;
}

export function PriceListDocument({ data }: { data: PriceListDocumentData }) {
	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Header */}
				<View style={styles.header}>
					<View>
						<Text style={styles.shopName}>{data.shop.name}</Text>
						{data.shop.address ? (
							<Text style={styles.shopTagline}>{data.shop.address}</Text>
						) : null}
					</View>
					<View style={styles.headerRight}>
						<Text style={styles.headerLabel}>Price List</Text>
						<Text style={styles.headerDate}>
							{data.generatedAt.toLocaleDateString("en-IN", {
								day: "2-digit",
								month: "short",
								year: "numeric",
							})}
						</Text>
					</View>
				</View>

				{/* Table header */}
				<View style={[styles.tr, styles.th]}>
					<Text style={styles.cCode}>Code</Text>
					<Text style={styles.cName}>Product</Text>
					<Text style={styles.cUnit}>Unit</Text>
					<Text style={styles.cMrp}>MRP</Text>
					<Text style={styles.cPrice}>Our Price</Text>
					<Text style={styles.cQty}>Qty</Text>
					<Text style={styles.cTotal}>Total</Text>
				</View>

				{/* Groups */}
				{data.groups.map((group) => (
					<View key={group.categoryName}>
						<View style={styles.categoryHeader}>
							<Text style={styles.categoryText}>
								{group.categoryName}
								{group.discountLabel ? ` (${group.discountLabel})` : ""}
							</Text>
						</View>
						{group.items.map((item, idx) => (
							<View
								key={String(item.code)}
								style={[styles.tr, idx % 2 !== 0 ? styles.trAlt : {}]}
							>
								<Text style={styles.cCode}>{String(item.code)}</Text>
								<Text style={styles.cName}>{item.name}</Text>
								<Text style={styles.cUnit}>{item.unit}</Text>
								<Text style={[styles.cMrp, styles.mrpText]}>
									₹{item.mrpPrice}
								</Text>
								<Text style={[styles.cPrice, styles.discountText]}>
									₹{item.discountPrice}
								</Text>
								<Text style={styles.cQty}></Text>
								<Text style={styles.cTotal}></Text>
							</View>
						))}
					</View>
				))}

				{/* Footer */}
				<View style={styles.footer}>
					<Text>{data.shop.name} — All prices are inclusive of taxes.</Text>
					<Text>
						Generated on{" "}
						{data.generatedAt.toLocaleString("en-IN", {
							day: "2-digit",
							month: "short",
							year: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</Text>
				</View>
			</Page>
		</Document>
	);
}