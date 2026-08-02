"use client";

import { ShoppingCart } from "lucide-react";

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

			{/* Evenly spaced between the search box and the cart icon */}
			<div className="flex flex-1 items-center justify-evenly">
				<Stat label="Net total" value={cart.netTotal} />
				<Stat accent label="You save" value={cart.youSave} />
				<Stat bold label="Total" value={cart.grandTotal} />
			</div>

			<button
				aria-label="View cart"
				className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D9A640] text-[#14163A] transition hover:scale-105"
				onClick={onCartClick}
				type="button"
			>
				<ShoppingCart className="h-5 w-5" />
				{cart.itemCount > 0 ? (
					<span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C8202F] font-bold text-[11px] text-white">
						{cart.itemCount}
					</span>
				) : null}
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
