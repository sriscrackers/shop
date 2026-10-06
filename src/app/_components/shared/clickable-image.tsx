"use client";

import Image from "next/image";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ClickableImageProps {
	imageUrl: string | null;
	alt: string;
	size?: number;
	/** Classes for the sized/bordered container (the trigger button). */
	containerClassName?: string;
	/** Classes for the thumbnail <Image> — e.g. object-cover vs object-contain. */
	imageClassName?: string;
}

/**
 * Renders a product/category thumbnail. Clicking it opens the full-size
 * image in a dialog on the same page — shared so every image in the app
 * (price list, cart, admin tables) behaves the same way.
 */
export function ClickableImage({
	imageUrl,
	alt,
	size = 48,
	containerClassName,
	imageClassName = "h-full w-full object-cover",
}: ClickableImageProps) {
	if (!imageUrl) {
		return <div className={containerClassName} />;
	}

	return (
		<Dialog>
			<DialogTrigger
				aria-label={`View larger image of ${alt}`}
				className={cn("block cursor-zoom-in", containerClassName)}
				type="button"
			>
				<Image
					alt={alt}
					className={imageClassName}
					height={size}
					src={imageUrl}
					width={size}
				/>
			</DialogTrigger>

			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					{/* pr-8 keeps the title clear of the close button */}
					<DialogTitle className="pr-8">{alt}</DialogTitle>
				</DialogHeader>
				<div className="flex max-h-[75vh] items-center justify-center overflow-hidden rounded-lg bg-muted/40">
					<Image
						alt={alt}
						className="h-auto max-h-[75vh] w-auto max-w-full object-contain"
						height={1000}
						sizes="(max-width: 768px) 90vw, 672px"
						src={imageUrl}
						width={1000}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}