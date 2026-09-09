"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { CartDialog } from "@/app/_components/estimate/cart-dialog";
import { CartSummaryBar } from "@/app/_components/estimate/cart-summary-bar";
import { CategoryFilterBar } from "@/app/_components/estimate/category-filter-bar";
import { CheckoutDialog } from "@/app/_components/estimate/checkout-dialog";
import { PriceListTable } from "@/app/_components/estimate/price-list-table";
import { api } from "@/trpc/react";

export default function EstimatePage() {
	const searchParams = useSearchParams();
	const [categoryId, setCategoryId] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [cartOpen, setCartOpen] = useState(false);
	const [checkoutOpen, setCheckoutOpen] = useState(false);

	const { data: categories = [] } = api.category.list.useQuery();
	const { data: settings } = api.settings.get.useQuery();

	useEffect(() => {
		const slug = searchParams.get("category");
		if (!slug || categories.length === 0) return;
		const match = categories.find((c) => c.slug === slug);
		if (match) setCategoryId(match.id);
	}, [searchParams, categories]);

	const minimumOrderAmount = Number(settings?.minimumOrderAmount ?? 0);

	return (
		<div
			className="mx-auto max-w-7xl space-y-4 px-4 py-8 pb-28 lg:pb-12"
			id="price-list"
		>
			<div className="text-center">
				<h1 className="font-extrabold text-2xl text-[#14163A] sm:text-3xl">
					Build your estimate
				</h1>
				<p className="mt-1 text-[#14163A]/60 text-sm">
					Minimum order amount:{" "}
					<span className="font-semibold text-[#C8202F]">
						₹{minimumOrderAmount.toFixed(2)}
					</span>
				</p>
			</div>

			<CategoryFilterBar
				categories={categories}
				categoryId={categoryId}
				onCartClick={() => setCartOpen(true)}
				onCategoryChange={setCategoryId}
				onSearchChange={setSearch}
				search={search}
			/>

			<PriceListTable categoryId={categoryId} search={search} />

			<CartSummaryBar
				minimumOrderAmount={minimumOrderAmount}
				onCheckout={() => setCartOpen(true)}
			/>

			<CartDialog
				minimumOrderAmount={minimumOrderAmount}
				onOpenChange={setCartOpen}
				onPlaceOrder={() => {
					setCartOpen(false);
					setCheckoutOpen(true);
				}}
				open={cartOpen}
			/>
			<CheckoutDialog onOpenChange={setCheckoutOpen} open={checkoutOpen} />
		</div>
	);
}