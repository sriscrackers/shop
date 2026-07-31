"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { type ComponentProps, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
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
import { UploadButton } from "@/lib/uploadthing";
import { api } from "@/trpc/react";

const SPECIAL_CHARS = [
	"½",
	"¾",
	"¼",
	'"',
	"'",
	"–",
	"—",
	"&",
	"×",
	"°",
] as const;

const productFormSchema = z.object({
	categoryId: z.string().min(1, "Select a category"),
	code: z.string().trim().min(1, "Enter a code").max(30, "Code is too long"),
	name: z.string().min(1, "Enter a product name").max(200),
	unit: z.string().min(1).max(20).default("PKT"),
	imageUrl: z.string().url().optional().or(z.literal("")),
	mrpPrice: z.coerce.number().positive("MRP must be greater than 0"),
	discountPrice: z.coerce
		.number()
		.positive("Discount price must be greater than 0"),
	sortOrder: z.coerce.number().int().default(0),
	isActive: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export interface ProductFormProduct {
	id: string;
	categoryId: string;
	code: string;
	name: string;
	unit: string;
	imageUrl: string | null;
	mrpPrice: string;
	discountPrice: string;
	sortOrder: number;
	isActive: boolean;
}

interface ProductFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	product?: ProductFormProduct;
	categories: { id: string; name: string }[];
	onSaved?: () => void;
}

function isValidUrl(url: string | null | undefined): boolean {
	if (!url) return false;
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

function defaultsFor(product?: ProductFormProduct): ProductFormValues {
	return {
		categoryId: product?.categoryId ?? "",
		code: product?.code ?? "",
		name: product?.name ?? "",
		unit: product?.unit ?? "PKT",
		imageUrl: isValidUrl(product?.imageUrl)
			? (product?.imageUrl as string)
			: "",
		mrpPrice: product ? Number(product.mrpPrice) : 0,
		discountPrice: product ? Number(product.discountPrice) : 0,
		sortOrder: product?.sortOrder ?? 0,
		isActive: product?.isActive ?? true,
	};
}

// Renders 0 as an empty string in the input so the user isn't stuck deleting
// a leading "0" before they can type — but keeps the underlying field value
// numeric for validation/submission.
function ZeroableNumberInput({
	value = 0,
	onChange,
	...rest
}: Omit<ComponentProps<typeof Input>, "value" | "onChange"> & {
	value?: number;
	onChange: (value: number) => void;
}) {
	return (
		<Input
			{...rest}
			onChange={(e) => {
				const raw = e.target.value;
				onChange(raw === "" ? 0 : Number(raw));
			}}
			onFocus={(e) => {
				// Select all so typing immediately replaces the 0, in case
				// the value wasn't already blank (e.g. tabbed in vs clicked).
				if (e.target.value === "0") e.target.select();
			}}
			type="number"
			value={value === 0 ? "" : value}
		/>
	);
}

export function ProductFormDialog({
	open,
	onOpenChange,
	product,
	categories,
	onSaved,
}: ProductFormDialogProps) {
	const isEditing = Boolean(product);
	const nameInputRef = useRef<HTMLInputElement | null>(null);

	const form = useForm<
		z.input<typeof productFormSchema>,
		unknown,
		ProductFormValues
	>({
		resolver: zodResolver(productFormSchema),
		defaultValues: defaultsFor(product),
	});

	useEffect(() => {
		if (open) form.reset(defaultsFor(product));
	}, [open, product, form]);

	const utils = api.useUtils();

	const createMutation = api.product.create.useMutation({
		onSuccess: () => {
			void utils.product.adminList.invalidate();
			onSaved?.();
			onOpenChange(false);
		},
	});

	const updateMutation = api.product.update.useMutation({
		onSuccess: () => {
			void utils.product.adminList.invalidate();
			onSaved?.();
			onOpenChange(false);
		},
	});

	const mutation = isEditing ? updateMutation : createMutation;

	const onSubmit = (values: ProductFormValues) => {
		const payload = { ...values, imageUrl: values.imageUrl || undefined };
		if (isEditing && product) {
			updateMutation.mutate({ id: product.id, ...payload });
		} else {
			createMutation.mutate(payload);
		}
	};

	const insertSpecialChar = (char: string) => {
		const input = nameInputRef.current;
		const currentValue = form.getValues("name");

		if (!input) {
			form.setValue("name", currentValue + char, {
				shouldDirty: true,
				shouldValidate: true,
			});
			return;
		}

		const start = input.selectionStart ?? currentValue.length;
		const end = input.selectionEnd ?? currentValue.length;
		const nextValue =
			currentValue.slice(0, start) + char + currentValue.slice(end);

		form.setValue("name", nextValue, {
			shouldDirty: true,
			shouldValidate: true,
		});

		requestAnimationFrame(() => {
			input.focus();
			const cursorPos = start + char.length;
			input.setSelectionRange(cursorPos, cursorPos);
		});
	};

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Edit product" : "Add product"}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="categoryId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Category</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select category" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{categories.map((category) => (
												<SelectItem key={category.id} value={category.id}>
													{category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="code"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Code</FormLabel>
										<FormControl>
											<Input placeholder="e.g. 63 or RB-50" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="unit"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Unit</FormLabel>
										<FormControl>
											<Input placeholder="PKT" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Product name</FormLabel>
									<FormControl>
										<Input
											placeholder="3 ½ Lakshmi"
											{...field}
											ref={(el) => {
												field.ref(el);
												nameInputRef.current = el;
											}}
										/>
									</FormControl>
									<div className="flex flex-wrap gap-1.5 pt-1">
										{SPECIAL_CHARS.map((char) => (
											<button
												className="rounded-md border border-[#5C1024]/15 bg-[#5C1024]/5 px-2.5 py-1 font-semibold text-[#5C1024] text-sm transition hover:bg-[#5C1024]/10"
												key={char}
												onClick={() => insertSpecialChar(char)}
												tabIndex={-1}
												type="button"
											>
												{char}
											</button>
										))}
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="mrpPrice"
								render={({ field }) => (
									<FormItem>
										<FormLabel>MRP price (₹)</FormLabel>
										<FormControl>
											<ZeroableNumberInput
												onChange={field.onChange}
												step="0.01"
												value={field.value}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="discountPrice"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Discount price (₹)</FormLabel>
										<FormControl>
											<ZeroableNumberInput
												onChange={field.onChange}
												step="0.01"
												value={field.value}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="imageUrl"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Product image</FormLabel>
									<div className="flex items-center gap-3">
										{field.value ? (
											<div className="relative h-12 w-12 shrink-0">
												<Image
													alt=""
													className="h-12 w-12 rounded-md border object-cover"
													src={field.value}
												/>
												<button
													aria-label="Remove image"
													className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#5C1024] text-white shadow-sm transition hover:bg-[#420B19]"
													onClick={() => field.onChange("")}
													tabIndex={-1}
													type="button"
												>
													×
												</button>
											</div>
										) : null}
										{!field.value && (
											<UploadButton
												appearance={{
													button:
														"bg-[#5C1024] text-white text-xs px-3 py-1.5 rounded-md",
													allowedContent: "hidden",
												}}
												endpoint="productImage"
												onClientUploadComplete={(res) => {
													const url = res[0]?.url;
													if (url) field.onChange(url);
												}}
											/>
										)}
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="sortOrder"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Sort order</FormLabel>
										<FormControl>
											<ZeroableNumberInput
												onChange={field.onChange}
												value={field.value}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="isActive"
								render={({ field }) => (
									<FormItem className="flex flex-row items-end gap-2 pb-1.5">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<FormLabel className="!mt-0">
											Visible on price list
										</FormLabel>
									</FormItem>
								)}
							/>
						</div>

						{mutation.error ? (
							<p className="font-medium text-[#D7263D] text-sm">
								{mutation.error.message}
							</p>
						) : null}

						<DialogFooter>
							<Button
								className="bg-[#5C1024] hover:bg-[#420B19]"
								disabled={mutation.isPending}
								type="submit"
							>
								{mutation.isPending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : isEditing ? (
									"Save changes"
								) : (
									"Add product"
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}