"use client";

import Image from "next/image";

import { Input } from "@/components/ui/input";

export interface PriceListItem {
	productId: string;
	code: string;
	name: string;
	unit: string;
	imageUrl: string | null;
	mrpPrice: string;
	discountPrice: string;
}

interface PriceListRowProps {
	item: PriceListItem;
	quantity: number;
	onQuantityChange: (quantity: number) => void;
}

export function PriceListRow({
	item,
	quantity,
	onQuantityChange,
}: PriceListRowProps) {
	const lineTotal = quantity * Number(item.discountPrice);

	return (
		<tr className="border-[#14163A]/8 border-b transition hover:bg-[#14163A]/[0.02]">
			<td className="px-4 py-3">
				<div className="h-12 w-12 overflow-hidden rounded-md border border-[#14163A]/10 bg-[#14163A]/5">
					{item.imageUrl ? (
						<Image
							alt={item.name}
							className="h-full w-full object-cover"
							height={48}
							src={item.imageUrl}
							width={48}
						/>
					) : null}
				</div>
			</td>
			<td className="px-4 py-3 font-medium text-[#14163A]/70">{item.code}</td>
			<td className="px-4 py-3 text-center">
				<p className="font-semibold text-[#14163A]">{item.name}</p>
				<p className="text-[#14163A]/55 text-xs">{item.unit}</p>
			</td>
			<td className="px-4 py-3 text-right text-[#14163A]/45 line-through">
				₹{item.mrpPrice}
			</td>
			<td className="px-4 py-3 text-right font-bold text-[#C8202F]">
				₹{item.discountPrice}
			</td>
			<td className="px-4 py-3">
				<Input
					className="h-9 text-center"
					inputMode="numeric"
					min={0}
					onChange={(e) => onQuantityChange(Number(e.target.value))}
					placeholder="0"
					type="number"
					value={quantity === 0 ? "" : quantity}
				/>
			</td>
			<td className="px-4 py-3 text-center font-bold text-[#14163A]">
				{lineTotal > 0 ? `₹${lineTotal.toFixed(2)}` : "—"}
			</td>
		</tr>
	);
}