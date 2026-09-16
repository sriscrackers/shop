"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
	type CategoryFormCategory,
	CategoryFormDialog,
} from "@/app/_components/admin/category-form-dialog";
import { ClickableImage } from "@/app/_components/shared/clickable-image";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";

const SKELETON_ROWS = [
	"skeleton-1",
	"skeleton-2",
	"skeleton-3",
	"skeleton-4",
] as const;

export default function AdminCategoriesPage() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<
		CategoryFormCategory | undefined
	>(undefined);

	const { data: categories = [], isLoading } =
		api.category.adminList.useQuery();

	const utils = api.useUtils();
	const updateMutation = api.category.update.useMutation({
		onSuccess: () => void utils.category.adminList.invalidate(),
		onError: (error) => toast.error(error.message),
	});
	const deleteMutation = api.category.delete.useMutation({
		onSuccess: () => {
			toast.success("Category deleted");
			void utils.category.adminList.invalidate();
		},
		onError: (error) => toast.error(error.message),
	});

	const openCreate = () => {
		setEditingCategory(undefined);
		setDialogOpen(true);
	};

	const openEdit = (category: (typeof categories)[number]) => {
		setEditingCategory(category);
		setDialogOpen(true);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="font-display font-extrabold text-2xl text-[#14163A]">
						Categories
					</h1>
					<p className="text-[#14163A]/55 text-sm">
						{categories.length} category(ies)
					</p>
				</div>
				<Button
					className="gap-2 bg-[#14163A] hover:bg-[#1f2257]"
					onClick={openCreate}
				>
					<Plus className="h-4 w-4" />
					Add category
				</Button>
			</div>

			{isLoading ? (
				<div className="space-y-2">
					{SKELETON_ROWS.map((rowKey) => (
						<div
							className="h-12 animate-pulse rounded-md bg-[#14163A]/5"
							key={rowKey}
						/>
					))}
				</div>
			) : categories.length === 0 ? (
				<div className="rounded-lg border border-[#14163A]/15 border-dashed py-16 text-center">
					<p className="font-semibold text-[#14163A]">No categories yet</p>
					<p className="text-[#14163A]/55 text-sm">
						Create a category before adding products.
					</p>
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg border border-[#14163A]/10 bg-white">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-16">Icon</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Slug</TableHead>
								<TableHead>Discount label</TableHead>
								<TableHead className="w-20">Sort</TableHead>
								<TableHead>Active</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{categories.map((category) => (
								<TableRow key={category.id}>
									<TableCell>
										<ClickableImage
											alt={category.name}
											containerClassName="h-10 w-10 overflow-hidden rounded-md border border-[#14163A]/10 bg-[#14163A]/5"
											imageClassName="h-full w-full object-contain"
											imageUrl={category.imageUrl}
											size={40}
										/>
									</TableCell>
									<TableCell className="font-semibold text-[#14163A]">
										{category.name}
									</TableCell>
									<TableCell className="text-[#14163A]/60">
										{category.slug}
									</TableCell>
									<TableCell className="text-[#14163A]/60">
										{category.discountLabel ?? "—"}
									</TableCell>
									<TableCell className="text-[#14163A]/60">
										{category.sortOrder}
									</TableCell>
									<TableCell>
										<Switch
											checked={category.isActive}
											onCheckedChange={(checked) =>
												updateMutation.mutate({
													id: category.id,
													isActive: checked,
												})
											}
										/>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-1">
											<Button
												aria-label="Edit category"
												onClick={() => openEdit(category)}
												size="icon"
												variant="ghost"
											>
												<Pencil className="h-4 w-4 text-[#14163A]/60" />
											</Button>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														aria-label="Delete category"
														size="icon"
														variant="ghost"
													>
														<Trash2 className="h-4 w-4 text-[#C8202F]" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															Delete &ldquo;{category.name}&rdquo;?
														</AlertDialogTitle>
														<AlertDialogDescription>
															Categories with existing products can&apos;t be
															deleted — move or delete those products first.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															className="bg-[#C8202F] hover:bg-[#a81b27]"
															onClick={() =>
																deleteMutation.mutate({ id: category.id })
															}
														>
															Delete
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			<CategoryFormDialog
				category={editingCategory}
				onOpenChange={setDialogOpen}
				open={dialogOpen}
			/>
		</div>
	);
}