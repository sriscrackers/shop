"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

interface ClickableImageProps {
	imageUrl: string | null;
	alt: string;
	size?: number;
	/** Classes for the sized/bordered container (and the <a> wrapping it). */
	containerClassName?: string;
	/** Classes for the <Image> itself — e.g. object-cover vs object-contain. */
	imageClassName?: string;
}

/**
 * Renders a product/category thumbnail. If an image is present, clicking it
 * opens the full-size image in a new browser tab — shared so every image in
 * the app (price list, cart, admin tables) behaves the same way.
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
		<a
			aria-label={`View larger image of ${alt}`}
			className={cn("block", containerClassName)}
			href={imageUrl}
			rel="noopener noreferrer"
			target="_blank"
		>
			<Image
				alt={alt}
				className={imageClassName}
				height={size}
				src={imageUrl}
				width={size}
			/>
		</a>
	);
}