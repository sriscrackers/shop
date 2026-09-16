"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
	ProductFormDialog,
	type ProductFormProduct,
} from "@/app/_components/admin/product-form-dialog";
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
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
	"skeleton-5",
	"skeleton-6",
] as const;

export default function AdminProductsPage() {
	const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
	const [search, setSearch] = useState("");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<
		ProductFormProduct | undefined
	>(undefined);

	const { data: categories = [] } = api.category.adminList.useQuery();
	const { data: products = [], isLoading } = api.product.adminList.useQuery({
		categoryId,
		search: search || undefined,
	});

	const utils = api.useUtils();
	const toggleActiveMutation = api.product.toggleActive.useMutation({
		onSuccess: () => void utils.product.adminList.invalidate(),
		onError: (error) => toast.error(error.message),
	});
	const deleteMutation = api.product.delete.useMutation({
		onSuccess: () => {
			toast.success("Product deleted");
			void utils.product.adminList.invalidate();
		},
		onError: (error) => toast.error(error.message),
	});

	const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

	const openCreate = () => {
		setEditingProduct(undefined);
		setDialogOpen(true);
	};

	const openEdit = (product: (typeof products)[number]) => {
		setEditingProduct({
			id: product.id,
			categoryId: product.categoryId,
			code: product.code,
			name: product.name,
			unit: product.unit,
			imageUrl: product.imageUrl,
			mrpPrice: product.mrpPrice,
			discountPrice: product.discountPrice,
			sortOrder: product.sortOrder,
			isActive: product.isActive,
		});
		setDialogOpen(true);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="font-display font-extrabold text-2xl text-[#14163A]">
						Products
					</h1>
					<p className="text-[#14163A]/55 text-sm">
						{products.length} product(s)
					</p>
				</div>
				<Button
					className="gap-2 bg-[#14163A] hover:bg-[#1f2257]"
					onClick={openCreate}
				>
					<Plus className="h-4 w-4" />
					Add product
				</Button>
			</div>

			<div className="flex flex-wrap gap-3">
				<Select
					onValueChange={(value) =>
						setCategoryId(value === "all" ? undefined : value)
					}
					value={categoryId ?? "all"}
				>
					<SelectTrigger className="w-56">
						<SelectValue placeholder="All categories" />
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
					className="w-64"
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search products…"
					value={search}
				/>
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
			) : products.length === 0 ? (
				<div className="rounded-lg border border-[#14163A]/15 border-dashed py-16 text-center">
					<p className="font-semibold text-[#14163A]">No products yet</p>
					<p className="text-[#14163A]/55 text-sm">
						Add your first product to get started.
					</p>
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg border border-[#14163A]/10 bg-white">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-16">Image</TableHead>
								<TableHead className="w-16">Code</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Category</TableHead>
								<TableHead className="text-right">MRP</TableHead>
								<TableHead className="text-right">Discount</TableHead>
								<TableHead>Active</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{products.map((product) => (
								<TableRow key={product.id}>
									<TableCell>
										<ClickableImage
											alt={product.name}
											containerClassName="h-10 w-10 overflow-hidden rounded-md border border-[#14163A]/10 bg-[#14163A]/5"
											imageClassName="h-full w-full object-cover"
											imageUrl={product.imageUrl}
											size={40}
										/>
									</TableCell>
									<TableCell className="font-medium text-[#14163A]/70">
										{product.code}
									</TableCell>
									<TableCell>
										<p className="font-semibold text-[#14163A]">
											{product.name}
										</p>
										<p className="text-[#14163A]/55 text-xs">{product.unit}</p>
									</TableCell>
									<TableCell className="text-[#14163A]/70">
										{categoryNameById.get(product.categoryId) ?? "—"}
									</TableCell>
									<TableCell className="text-right text-[#14163A]/45 line-through">
										₹{product.mrpPrice}
									</TableCell>
									<TableCell className="text-right font-bold text-[#C8202F]">
										₹{product.discountPrice}
									</TableCell>
									<TableCell>
										<Switch
											checked={product.isActive}
											onCheckedChange={(checked) =>
												toggleActiveMutation.mutate({
													id: product.id,
													isActive: checked,
												})
											}
										/>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-1">
											<Button
												aria-label="Edit product"
												onClick={() => openEdit(product)}
												size="icon"
												variant="ghost"
											>
												<Pencil className="h-4 w-4 text-[#14163A]/60" />
											</Button>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														aria-label="Delete product"
														size="icon"
														variant="ghost"
													>
														<Trash2 className="h-4 w-4 text-[#C8202F]" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															Delete &ldquo;{product.name}&rdquo;?
														</AlertDialogTitle>
														<AlertDialogDescription>
															This removes it from the price list immediately.
															Past bills that included this product are
															unaffected.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															className="bg-[#C8202F] hover:bg-[#a81b27]"
															onClick={() =>
																deleteMutation.mutate({ id: product.id })
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

			<ProductFormDialog
				categories={categories}
				onOpenChange={setDialogOpen}
				open={dialogOpen}
				product={editingProduct}
			/>
		</div>
	);
}