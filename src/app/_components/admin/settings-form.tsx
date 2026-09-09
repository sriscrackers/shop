"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

const settingsFormSchema = z.object({
	shopName: z.string().min(1).max(150),
	shopAddress: z.string().max(500).optional().or(z.literal("")),
	announcementText: z.string().max(300).optional().or(z.literal("")),
	minimumOrderAmount: z.coerce.number().nonnegative(),
	whatsappNumber: z.string().max(20).optional().or(z.literal("")),
	contactPhonePrimary: z.string().max(20).optional().or(z.literal("")),
	contactPhoneSecondary: z.string().max(20).optional().or(z.literal("")),
	address: z.string().max(500).optional().or(z.literal("")),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export function SettingsForm() {
	const utils = api.useUtils();
	const { data: settings, isLoading } = api.settings.get.useQuery();

	const form = useForm<SettingsFormValues>({
		resolver: zodResolver(settingsFormSchema),
		defaultValues: {
			shopName: "",
			shopAddress: "",
			announcementText: "",
			minimumOrderAmount: 0,
			whatsappNumber: "",
			contactPhonePrimary: "",
			contactPhoneSecondary: "",
			address: "",
		},
		values: settings
			? {
					shopName: settings.shopName ?? "",
					shopAddress: settings.shopAddress ?? "",
					announcementText: settings.announcementText ?? "",
					minimumOrderAmount: Number(settings.minimumOrderAmount ?? 0),
					whatsappNumber: settings.whatsappNumber ?? "",
					contactPhonePrimary: settings.contactPhonePrimary ?? "",
					contactPhoneSecondary: settings.contactPhoneSecondary ?? "",
					address: settings.address ?? "",
				}
			: undefined,
	});

	const updateMutation = api.settings.update.useMutation({
		onSuccess: () => void utils.settings.get.invalidate(),
	});

	if (isLoading)
		return <div className="h-96 animate-pulse rounded-lg bg-[#14163A]/5" />;

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<CardTitle>Site settings</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							className="space-y-4"
							onSubmit={form.handleSubmit((values) =>
								updateMutation.mutate(values),
							)}
						>
							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="shopName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Shop name</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="minimumOrderAmount"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Minimum order amount (₹)</FormLabel>
											<FormControl>
												<Input step="0.01" type="number" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="shopAddress"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Shop address (shown on bills)</FormLabel>
										<FormControl>
											<Textarea rows={2} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="announcementText"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Announcement bar text</FormLabel>
										<FormControl>
											<Input
												placeholder="Welcome to SS Crackers Shop — 80% discount live!"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-3 gap-4">
								<FormField
									control={form.control}
									name="whatsappNumber"
									render={({ field }) => (
										<FormItem>
											<FormLabel>WhatsApp number</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="contactPhonePrimary"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Phone 1</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="contactPhoneSecondary"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Phone 2</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Footer address</FormLabel>
										<FormControl>
											<Textarea rows={2} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{updateMutation.error ? (
								<p className="font-medium text-[#C8202F] text-sm">
									{updateMutation.error.message}
								</p>
							) : null}

							<Button
								className="bg-[#14163A] hover:bg-[#1f2257]"
								disabled={updateMutation.isPending}
								type="submit"
							>
								{updateMutation.isPending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									"Save settings"
								)}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>

			<BankAccountsManager />
			<UpiAccountsManager />
		</div>
	);
}

const bankAccountSchema = z.object({
	bankName: z.string().min(1, "Required"),
	accountHolderName: z.string().min(1, "Required"),
	accountNumber: z.string().min(4, "Required"),
	ifscCode: z.string().min(4, "Required"),
	branchName: z.string().optional().or(z.literal("")),
});

type BankAccountValues = z.infer<typeof bankAccountSchema>;

function BankAccountsManager() {
	const utils = api.useUtils();
	const { data: accounts = [] } = api.bankAccount.adminList.useQuery();
	const [adding, setAdding] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const emptyValues: BankAccountValues = {
		bankName: "",
		accountHolderName: "",
		accountNumber: "",
		ifscCode: "",
		branchName: "",
	};

	const form = useForm<BankAccountValues>({
		resolver: zodResolver(bankAccountSchema),
		defaultValues: emptyValues,
	});

	const invalidate = () => void utils.bankAccount.adminList.invalidate();

	const createMutation = api.bankAccount.create.useMutation({
		onSuccess: () => {
			invalidate();
			setAdding(false);
			form.reset(emptyValues);
		},
	});

	const updateMutation = api.bankAccount.update.useMutation({
		onSuccess: () => {
			invalidate();
			setEditingId(null);
			form.reset(emptyValues);
		},
	});

	const deleteMutation = api.bankAccount.delete.useMutation({
		onSuccess: invalidate,
	});

	const startAdd = () => {
		setEditingId(null);
		form.reset(emptyValues);
		setAdding(true);
	};

	const startEdit = (account: (typeof accounts)[number]) => {
		setAdding(false);
		form.reset({
			bankName: account.bankName,
			accountHolderName: account.accountHolderName,
			accountNumber: account.accountNumber,
			ifscCode: account.ifscCode,
			branchName: account.branchName ?? "",
		});
		setEditingId(account.id);
	};

	const cancelForm = () => {
		setAdding(false);
		setEditingId(null);
		form.reset(emptyValues);
	};

	const isFormOpen = adding || editingId !== null;

	const handleSubmit = form.handleSubmit((values) => {
		if (editingId) {
			updateMutation.mutate({ id: editingId, ...values });
		} else {
			createMutation.mutate(values);
		}
	});

	const renderForm = () => (
		<Form {...form}>
			<form
				className="grid grid-cols-2 gap-3 rounded-md border border-[#14163A]/20 border-dashed p-4"
				onSubmit={handleSubmit}
			>
				<FormField
					control={form.control}
					name="bankName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Bank name</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="accountHolderName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Account holder</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="accountNumber"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Account number</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="ifscCode"
					render={({ field }) => (
						<FormItem>
							<FormLabel>IFSC code</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="branchName"
					render={({ field }) => (
						<FormItem className="col-span-2">
							<FormLabel>Branch (optional)</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="col-span-2 flex gap-2">
					<Button
						className="bg-[#14163A] hover:bg-[#1f2257]"
						disabled={createMutation.isPending || updateMutation.isPending}
						size="sm"
						type="submit"
					>
						{editingId ? "Update account" : "Save account"}
					</Button>
					<Button onClick={cancelForm} size="sm" type="button" variant="ghost">
						Cancel
					</Button>
				</div>
			</form>
		</Form>
	);

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>Bank accounts</CardTitle>
				{!isFormOpen ? (
					<Button className="gap-1.5" onClick={startAdd} size="sm" variant="outline">
						<Plus className="h-4 w-4" />
						Add account
					</Button>
				) : null}
			</CardHeader>
			<CardContent className="space-y-3">
				{accounts.map((account) =>
					editingId === account.id ? (
						<div key={account.id}>{renderForm()}</div>
					) : (
						<div
							className="flex items-center justify-between gap-4 rounded-md border border-[#14163A]/10 px-4 py-3"
							key={account.id}
						>
							<div className="text-sm">
								<p className="font-semibold text-[#14163A]">{account.bankName}</p>
								<p className="text-[#14163A]/60">
									{account.accountHolderName} · A/C {account.accountNumber} · IFSC{" "}
									{account.ifscCode}
								</p>
							</div>
							<div className="flex items-center gap-1">
								<Button
									aria-label="Edit bank account"
									onClick={() => startEdit(account)}
									size="icon"
									variant="ghost"
								>
									<Pencil className="h-4 w-4 text-[#14163A]/60" />
								</Button>
								<Button
									aria-label="Delete bank account"
									onClick={() => deleteMutation.mutate({ id: account.id })}
									size="icon"
									variant="ghost"
								>
									<Trash2 className="h-4 w-4 text-[#C8202F]" />
								</Button>
							</div>
						</div>
					),
				)}

				{adding ? renderForm() : null}
			</CardContent>
		</Card>
	);
}

const upiAccountSchema = z.object({
	label: z.string().min(1, "Required"),
	upiId: z.string().optional().or(z.literal("")),
	phoneNumber: z.string().min(10, "Enter a valid phone number").max(15),
});

type UpiAccountValues = z.infer<typeof upiAccountSchema>;

function UpiAccountsManager() {
	const utils = api.useUtils();
	const { data: accounts = [] } = api.upiAccount.adminList.useQuery();
	const [adding, setAdding] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const emptyValues: UpiAccountValues = {
		label: "",
		upiId: "",
		phoneNumber: "",
	};

	const form = useForm<UpiAccountValues>({
		resolver: zodResolver(upiAccountSchema),
		defaultValues: emptyValues,
	});

	const invalidate = () => void utils.upiAccount.adminList.invalidate();

	const createMutation = api.upiAccount.create.useMutation({
		onSuccess: () => {
			invalidate();
			setAdding(false);
			form.reset(emptyValues);
		},
	});

	const updateMutation = api.upiAccount.update.useMutation({
		onSuccess: () => {
			invalidate();
			setEditingId(null);
			form.reset(emptyValues);
		},
	});

	const deleteMutation = api.upiAccount.delete.useMutation({
		onSuccess: invalidate,
	});

	const startAdd = () => {
		setEditingId(null);
		form.reset(emptyValues);
		setAdding(true);
	};

	const startEdit = (account: (typeof accounts)[number]) => {
		setAdding(false);
		form.reset({
			label: account.label,
			upiId: account.upiId ?? "",
			phoneNumber: account.phoneNumber,
		});
		setEditingId(account.id);
	};

	const cancelForm = () => {
		setAdding(false);
		setEditingId(null);
		form.reset(emptyValues);
	};

	const isFormOpen = adding || editingId !== null;

	const handleSubmit = form.handleSubmit((values) => {
		const payload = { ...values, upiId: values.upiId || undefined };
		if (editingId) {
			updateMutation.mutate({ id: editingId, ...payload });
		} else {
			createMutation.mutate(payload);
		}
	});

	const renderForm = () => (
		<Form {...form}>
			<form
				className="grid grid-cols-2 gap-3 rounded-md border border-[#14163A]/20 border-dashed p-4"
				onSubmit={handleSubmit}
			>
				<FormField
					control={form.control}
					name="label"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Label</FormLabel>
							<FormControl>
								<Input placeholder="Google Pay" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="phoneNumber"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Phone number</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="upiId"
					render={({ field }) => (
						<FormItem className="col-span-2">
							<FormLabel>UPI ID (optional)</FormLabel>
							<FormControl>
								<Input placeholder="9626965591@okicici" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="col-span-2 flex gap-2">
					<Button
						className="bg-[#14163A] hover:bg-[#1f2257]"
						disabled={createMutation.isPending || updateMutation.isPending}
						size="sm"
						type="submit"
					>
						{editingId ? "Update UPI" : "Save UPI"}
					</Button>
					<Button onClick={cancelForm} size="sm" type="button" variant="ghost">
						Cancel
					</Button>
				</div>
			</form>
		</Form>
	);

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>UPI accounts</CardTitle>
				{!isFormOpen ? (
					<Button className="gap-1.5" onClick={startAdd} size="sm" variant="outline">
						<Plus className="h-4 w-4" />
						Add UPI
					</Button>
				) : null}
			</CardHeader>
			<CardContent className="space-y-3">
				{accounts.map((account) =>
					editingId === account.id ? (
						<div key={account.id}>{renderForm()}</div>
					) : (
						<div
							className="flex items-center justify-between gap-4 rounded-md border border-[#14163A]/10 px-4 py-3"
							key={account.id}
						>
							<div className="text-sm">
								<p className="font-semibold text-[#14163A]">{account.label}</p>
								<p className="text-[#14163A]/60">
									{account.upiId ? `${account.upiId} · ` : ""}
									{account.phoneNumber}
								</p>
							</div>
							<div className="flex items-center gap-1">
								<Button
									aria-label="Edit UPI account"
									onClick={() => startEdit(account)}
									size="icon"
									variant="ghost"
								>
									<Pencil className="h-4 w-4 text-[#14163A]/60" />
								</Button>
								<Button
									aria-label="Delete UPI account"
									onClick={() => deleteMutation.mutate({ id: account.id })}
									size="icon"
									variant="ghost"
								>
									<Trash2 className="h-4 w-4 text-[#C8202F]" />
								</Button>
							</div>
						</div>
					),
				)}

				{adding ? renderForm() : null}
			</CardContent>
		</Card>
	);
}