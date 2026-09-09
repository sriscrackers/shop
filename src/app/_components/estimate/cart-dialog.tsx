"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

interface CartDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onPlaceOrder: () => void;
	minimumOrderAmount?: number;
}

export function CartDialog({
	open,
	onOpenChange,
	onPlaceOrder,
	minimumOrderAmount = 0,
}: CartDialogProps) {
	const cart = useCart();
	const meetsMinimum = cart.grandTotal >= minimumOrderAmount;

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Your cart</DialogTitle>
					<DialogDescription>
						{cart.itemCount > 0
							? `${cart.itemCount} item(s) added — review before placing your order.`
							: "Your cart is empty."}
					</DialogDescription>
				</DialogHeader>

				{cart.items.length === 0 ? (
					<div className="flex flex-col items-center gap-2 py-10 text-center text-[#14163A]/50">
						<ShoppingBag className="h-10 w-10" />
						<p className="text-sm">Add some crackers to get started.</p>
					</div>
				) : (
					<ScrollArea className="max-h-80 pr-3">
						<div className="space-y-3">
							{cart.items.map((item) => (
								<div
									className="flex items-center gap-3 rounded-md border border-[#14163A]/10 p-3"
									key={item.productId}
								>
									{item.imageUrl ? (
										// biome-ignore lint: plain img is fine for cart thumbnails
										<img
											alt={item.name}
											className="h-12 w-12 shrink-0 rounded-md object-cover"
											src={item.imageUrl}
										/>
									) : (
										<div className="h-12 w-12 shrink-0 rounded-md bg-[#14163A]/5" />
									)}

									<div className="min-w-0 flex-1">
										<p className="truncate font-semibold text-[#14163A] text-sm">
											{item.name}
										</p>
										<p className="text-[#14163A]/55 text-xs">
											₹{Number(item.discountPrice).toFixed(2)} / {item.unit}
										</p>
									</div>

									<div className="flex items-center gap-1.5">
										<Button
											aria-label="Decrease quantity"
											className="h-7 w-7"
											onClick={() =>
												cart.setQuantity(item.productId, item.quantity - 1)
											}
											size="icon"
											variant="outline"
										>
											<Minus className="h-3.5 w-3.5" />
										</Button>
										<span className="w-6 text-center font-medium text-sm">
											{item.quantity}
										</span>
										<Button
											aria-label="Increase quantity"
											className="h-7 w-7"
											onClick={() =>
												cart.setQuantity(item.productId, item.quantity + 1, item)
											}
											size="icon"
											variant="outline"
										>
											<Plus className="h-3.5 w-3.5" />
										</Button>
									</div>

									<p className="w-16 shrink-0 text-right font-semibold text-[#14163A] text-sm">
										₹
										{(Number(item.discountPrice) * item.quantity).toFixed(2)}
									</p>

									<Button
										aria-label="Remove item"
										className="h-7 w-7 shrink-0"
										onClick={() => cart.setQuantity(item.productId, 0)}
										size="icon"
										variant="ghost"
									>
										<Trash2 className="h-4 w-4 text-[#C8202F]" />
									</Button>
								</div>
							))}
						</div>
					</ScrollArea>
				)}

				{cart.items.length > 0 ? (
					<div className="space-y-1 border-[#14163A]/10 border-t pt-3 text-sm">
						<div className="flex justify-between text-[#14163A]/60">
							<span>Net total</span>
							<span>₹{cart.netTotal.toFixed(2)}</span>
						</div>
						<div className="flex justify-between text-emerald-600">
							<span>You save</span>
							<span>₹{cart.youSave.toFixed(2)}</span>
						</div>
						<div className="flex justify-between font-bold text-[#14163A] text-base">
							<span>Grand total</span>
							<span>₹{cart.grandTotal.toFixed(2)}</span>
						</div>
						{!meetsMinimum ? (
							<p className="pt-1 font-medium text-[#C8202F] text-xs">
								Add ₹{(minimumOrderAmount - cart.grandTotal).toFixed(2)} more
								to reach the ₹{minimumOrderAmount.toFixed(2)} minimum
							</p>
						) : null}
					</div>
				) : null}

				<DialogFooter>
					<Button
						className={cn(
							"w-full font-semibold",
							meetsMinimum
								? "bg-[#C8202F] hover:bg-[#a81b27]"
								: "bg-[#14163A]/20 text-[#14163A]/50",
						)}
						disabled={cart.items.length === 0 || !meetsMinimum}
						onClick={onPlaceOrder}
					>
						Place Order
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}