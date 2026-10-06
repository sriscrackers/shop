import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
	page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
	header: {
		marginBottom: 16,
		borderBottom: 2,
		borderColor: "#1a1a40",
		paddingBottom: 8,
	},
	shopName: { fontSize: 18, fontWeight: 700, color: "#1a1a40" },
	muted: { color: "#555", marginTop: 2 },
	billRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginVertical: 12,
	},
	sectionTitle: { fontSize: 11, fontWeight: 700, marginBottom: 4 },
	table: { marginTop: 8 },
	tr: {
		flexDirection: "row",
		borderBottom: 1,
		borderColor: "#ddd",
		paddingVertical: 4,
	},
	th: {
		fontWeight: 700,
		backgroundColor: "#1a1a40",
		color: "#fff",
		paddingVertical: 6,
	},
	cCode: { width: "8%", paddingHorizontal: 4 },
	cName: { width: "38%", paddingHorizontal: 4 },
	cQty: { width: "12%", textAlign: "right", paddingHorizontal: 4 },
	cPrice: { width: "21%", textAlign: "right", paddingHorizontal: 4 },
	cTotal: { width: "21%", textAlign: "right", paddingHorizontal: 4 },
	totals: { marginTop: 12, alignSelf: "flex-end", width: "50%" },
	totalRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 2,
	},
	grandTotal: {
		fontWeight: 700,
		fontSize: 12,
		borderTop: 1,
		borderColor: "#1a1a40",
		paddingTop: 4,
		marginTop: 4,
	},
});

export interface OrderBillItem {
	productCode: string;
	productName: string;
	unit: string;
	discountPrice: string;
	quantity: number;
	lineTotal: string;
}

export interface OrderBillData {
	billNumber: string;
	createdAt: Date;
	customerName: string;
	customerWhatsapp: string;
	customerAddress: string;
	customerState: string;
	netTotal: string;
	youSave: string;
	grandTotal: string;
	items: OrderBillItem[];
	shop: { name: string; address: string | null };
}

export function OrderBillDocument({ data }: { data: OrderBillData }) {
	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.header}>
					<Text style={styles.shopName}>{data.shop.name}</Text>
					{data.shop.address ? (
						<Text style={styles.muted}>{data.shop.address}</Text>
					) : null}
				</View>

				<View style={styles.billRow}>
					<View>
						<Text style={styles.sectionTitle}>Bill To</Text>
						<Text>{data.customerName}</Text>
						<Text>{data.customerWhatsapp}</Text>
						<Text>{data.customerAddress}</Text>
						<Text>{data.customerState}</Text>
					</View>
					<View>
						<Text style={styles.sectionTitle}>Bill No: {data.billNumber}</Text>
						<Text style={styles.muted}>
							Date: {data.createdAt.toLocaleDateString("en-IN")}
						</Text>
					</View>
				</View>

				<View style={styles.table}>
					<View style={[styles.tr, styles.th]}>
						<Text style={styles.cCode}>Code</Text>
						<Text style={styles.cName}>Product</Text>
						<Text style={styles.cQty}>Qty</Text>
						<Text style={styles.cPrice}>Price</Text>
						<Text style={styles.cTotal}>Total</Text>
					</View>
					{data.items.map((item) => (
						<View key={item.productCode} style={styles.tr}>
							<Text style={styles.cCode}>{item.productCode}</Text>
							<Text style={styles.cName}>
								{item.productName} ({item.unit})
							</Text>
							<Text style={styles.cQty}>{item.quantity}</Text>
							<Text style={styles.cPrice}>Rs. {item.discountPrice}</Text>
							<Text style={styles.cTotal}>Rs. {item.lineTotal}</Text>
						</View>
					))}
				</View>

				<View style={styles.totals}>
					<View style={styles.totalRow}>
						<Text>Net Total</Text>
						<Text>Rs. {data.netTotal}</Text>
					</View>
					<View style={styles.totalRow}>
						<Text>You Save</Text>
						<Text>- Rs. {data.youSave}</Text>
					</View>
					<View style={[styles.totalRow, styles.grandTotal]}>
						<Text>Grand Total</Text>
						<Text>Rs. {data.grandTotal}</Text>
					</View>
				</View>
			</Page>
		</Document>
	);
}