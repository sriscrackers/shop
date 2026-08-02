"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Download } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/use-cart";
import { api } from "@/trpc/react";

const INDIAN_STATES = [
	"Andhra Pradesh",
	"Arunachal Pradesh",
	"Assam",
	"Bihar",
	"Chhattisgarh",
	"Goa",
	"Gujarat",
	"Haryana",
	"Himachal Pradesh",
	"Jharkhand",
	"Karnataka",
	"Kerala",
	"Madhya Pradesh",
	"Maharashtra",
	"Manipur",
	"Meghalaya",
	"Mizoram",
	"Nagaland",
	"Odisha",
	"Punjab",
	"Rajasthan",
	"Sikkim",
	"Tamil Nadu",
	"Telangana",
	"Tripura",
	"Uttar Pradesh",
	"Uttarakhand",
	"West Bengal",
	"Delhi",
	"Jammu and Kashmir",
	"Ladakh",
	"Puducherry",
	"Chandigarh",
	"Andaman and Nicobar Islands",
] as const;

const checkoutSchema = z.object({
	customerName: z.string().min(2, "Enter your full name").max(120),
	customerWhatsapp: z
		.string()
		.min(10, "Enter a valid WhatsApp number")
		.max(15)
		.regex(/^[0-9+\s-]+$/, "Numbers only"),
	customerAddress: z.string().min(5, "Enter your delivery address").max(500),
	customerState: z.string().min(1, "Select your state"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

// Triggers a browser download for the given URL without navigating away.
function triggerDownload(url: string, filename: string) {
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
	const cart = useCart();
	const [completedOrder, setCompletedOrder] = useState<{
		id: string;
		billNumber: string;
	} | null>(null);

	const form = useForm<CheckoutFormValues>({
		resolver: zodResolver(checkoutSchema),
		defaultValues: {
			customerName: "",
			customerWhatsapp: "",
			customerAddress: "",
			customerState: "",
		},
	});

	const submitMutation = api.order.submit.useMutation({
		onSuccess: (result) => {
			setCompletedOrder({ id: result.id, billNumber: result.billNumber });
			form.reset();

			// Auto-download the bill PDF immediately — still inside the original
			// submit click's gesture chain, so browsers won't block it as a popup.
			triggerDownload(
				`/api/orders/${result.id}/pdf`,
				`${result.billNumber}.pdf`,
			);
		},
	});

	const handleClose = (next: boolean) => {
		if (!next) setTimeout(() => setCompletedOrder(null), 200);
		onOpenChange(next);
	};

	if (completedOrder) {
		return (
			<Dialog onOpenChange={handleClose} open={open}>
				<DialogContent className="sm:max-w-md">
					<div className="flex flex-col items-center gap-3 py-4 text-center">
						<CheckCircle2 className="h-14 w-14 text-emerald-500" />
						<DialogTitle className="text-xl">Estimate submitted!</DialogTitle>
						<DialogDescription>
							Bill No.{" "}
							<span className="font-bold text-[#14163A]">
								{completedOrder.billNumber}
							</span>
							. We&apos;ll contact you on WhatsApp shortly to confirm your
							order.
						</DialogDescription>
						<div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
							<Button
								asChild
								className="flex-1 gap-2 bg-[#14163A] hover:bg-[#1f2257]"
							>
								<a
									href={`/api/orders/${completedOrder.id}/pdf`}
									rel="noopener noreferrer"
									target="_blank"
								>
									<Download className="h-4 w-4" />
									Download bill
								</a>
							</Button>
							<Button
								className="flex-1"
								onClick={() => handleClose(false)}
								variant="outline"
							>
								Done
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog onOpenChange={handleClose} open={open}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Confirm your estimate</DialogTitle>
					<DialogDescription>
						Share your details and we&apos;ll prepare your bill — Grand total ₹
						{cart.grandTotal.toFixed(2)} for {cart.itemCount} item(s).
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						className="space-y-4"
						onSubmit={form.handleSubmit((values) => {
							cart.flush();
							submitMutation.mutate(values);
						})}
					>
						<FormField
							control={form.control}
							name="customerName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full name</FormLabel>
									<FormControl>
										<Input placeholder="Your name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="customerWhatsapp"
							render={({ field }) => (
								<FormItem>
									<FormLabel>WhatsApp number</FormLabel>
									<FormControl>
										<Input
											inputMode="tel"
											placeholder="98765 43210"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="customerAddress"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Delivery address</FormLabel>
									<FormControl>
										<Textarea
											placeholder="House no, street, city, pincode"
											rows={3}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="customerState"
							render={({ field }) => (
								<FormItem>
									<FormLabel>State</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select your state" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{INDIAN_STATES.map((state) => (
												<SelectItem key={state} value={state}>
													{state}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{submitMutation.error ? (
							<p className="font-medium text-[#C8202F] text-sm">
								{submitMutation.error.message}
							</p>
						) : null}

						<DialogFooter>
							<Button
								className="w-full bg-[#C8202F] font-semibold hover:bg-[#a81b27]"
								disabled={submitMutation.isPending}
								type="submit"
							>
								{submitMutation.isPending ? "Submitting…" : "Get my bill"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
