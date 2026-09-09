"use client";

import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

export interface CategoryOption {
	id: string;
	name: string;
}

interface CategoryFilterBarProps {
	categories: CategoryOption[];
	categoryId: string | null;
	onCategoryChange: (categoryId: string | null) => void;
	search: string;
	onSearchChange: (search: string) => void;
	onCartClick: () => void;
}

export function CategoryFilterBar({
	categories,
	categoryId,
	onCategoryChange,
	search,
	onSearchChange,
	onCartClick,
}: CategoryFilterBarProps) {
	const cart = useCart();
	const hasItems = cart.itemCount > 0;

	return (
		<div className="sticky top-[100px] z-20 flex flex-col gap-4 rounded-lg bg-[#14163A] p-4 text-white shadow-md sm:flex-row sm:items-center">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<Select
					onValueChange={(value) =>
						onCategoryChange(value === "all" ? null : value)
					}
					value={categoryId ?? "all"}
				>
					<SelectTrigger className="w-full bg-white text-[#14163A] sm:w-56">
						<SelectValue placeholder="Select category" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All categories</SelectItem>
						{categories.map((category) => (
							<SelectItem key={category.id} value={category.id}>
								{category.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Input
					className="w-full bg-white text-[#14163A] sm:w-64"
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="Search here…"
					value={search}
				/>
			</div>

			{/* Evenly spaced between the search box and the place order button */}
			<div className="flex flex-1 items-center justify-evenly">
				<Stat label="Net total" value={cart.netTotal} />
				<Stat accent label="You save" value={cart.youSave} />
				<Stat bold label="Total" value={cart.grandTotal} />
			</div>

			<button
				className={cn(
					"shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 font-semibold text-sm transition",
					hasItems
						? "bg-[#C8202F] text-white hover:bg-[#a81b27]"
						: "cursor-not-allowed bg-white/10 text-white/40",
				)}
				disabled={!hasItems}
				onClick={onCartClick}
				type="button"
			>
				Place Order{hasItems ? ` · ₹${cart.grandTotal.toFixed(2)}` : ""}
			</button>
		</div>
	);
}

function Stat({
	label,
	value,
	accent,
	bold,
}: {
	label: string;
	value: number;
	accent?: boolean;
	bold?: boolean;
}) {
	return (
		<div className="hidden flex-col leading-tight sm:flex">
			<span className="text-[11px] text-white/55 uppercase tracking-wide">
				{label}
			</span>
			<span
				className={cn(
					"text-base",
					bold ? "font-extrabold text-[#D9A640]" : "font-semibold",
					accent ? "text-emerald-400" : "text-white",
				)}
			>
				₹{value.toFixed(2)}
			</span>
		</div>
	);
}