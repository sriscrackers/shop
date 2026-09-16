"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";

type OrderStatus = "pending" | "contacted" | "confirmed" | "cancelled";
type SelectValueOption = OrderStatus | "delete";

const STATUS_OPTIONS: OrderStatus[] = [
	"pending",
	"contacted",
	"confirmed",
	"cancelled",
];

export function OrderStatusSelect({
	orderId,
	status,
}: {
	orderId: string;
	status: OrderStatus;
}) {
	const router = useRouter();
	const utils = api.useUtils();
	const [confirmOpen, setConfirmOpen] = useState(false);

	const updateMutation = api.order.updateStatus.useMutation({
		onSuccess: () => {
			void utils.order.getById.invalidate({ id: orderId });
			void utils.order.list.invalidate();
		},
	});

	const deleteMutation = api.order.delete.useMutation({
		onSuccess: () => {
			void utils.order.list.invalidate();
			setConfirmOpen(false);
			router.push("/admin/orders");
		},
	});

	const handleValueChange = (value: SelectValueOption) => {
		if (value === "delete") {
			setConfirmOpen(true);
			return;
		}
		updateMutation.mutate({ id: orderId, status: value });
	};

	return (
		<>
			<Select
				onValueChange={(value) => handleValueChange(value as SelectValueOption)}
				value={status}
			>
				<SelectTrigger className="w-40 capitalize">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{STATUS_OPTIONS.map((option) => (
						<SelectItem className="capitalize" key={option} value={option}>
							{option}
						</SelectItem>
					))}
					<SelectItem className="font-semibold text-[#C8202F]" value="delete">
						Delete
					</SelectItem>
				</SelectContent>
			</Select>

			<AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this order?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete this order and all its items. This
							action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteMutation.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							className="bg-[#C8202F] hover:bg-[#a81b27]"
							disabled={deleteMutation.isPending}
							onClick={() => deleteMutation.mutate({ id: orderId })}
						>
							{deleteMutation.isPending ? "Deleting…" : "Delete order"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}