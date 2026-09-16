"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";

interface Slide {
	eyebrow: string;
	headline: string;
	subhead: string;
	image: string;
}

const SLIDES: Slide[] = [
	{
		eyebrow: "Diwali specials",
		headline: "Light up your Diwali with SS Crackers Shop",
		subhead:
			"Sivakasi-manufactured crackers at honest, manufacturer-direct prices.",
		image: "/hero/double-diya.png",
	},
	{
		eyebrow: "Gift boxes",
		headline: "Curated gift boxes for every budget",
		subhead:
			"From starter packs to family-sized hampers — all in one estimate.",
		image: "/hero/right-purple.png",
	},
	{
		eyebrow: "Quality assured",
		headline: "Certified materials, every single cracker",
		subhead: "Strict factory norms, safe for the whole family to enjoy.",
		image: "/hero/white-diya.png",
	},
	{
		eyebrow: "Festive offers",
		headline: "Brighten every corner this Diwali",
		subhead: "Wide range of sparklers, flower pots, and sky shots in stock.",
		image: "/hero/simple-design.png",
	},
];

export function HeroCarousel() {
	const [api, setApi] = useState<CarouselApi>();

	useEffect(() => {
		if (!api) return;
		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (prefersReducedMotion) return;

		const interval = setInterval(() => api.scrollNext(), 5500);
		return () => clearInterval(interval);
	}, [api]);

	return (
		<Carousel className="w-full" opts={{ loop: true }} setApi={setApi}>
			<CarouselContent>
				{SLIDES.map((slide, index) => (
					<CarouselItem key={slide.headline}>
						<div className="relative min-h-[420px] overflow-hidden px-6 py-14 sm:px-12 lg:py-20">
							{/* Background image */}
							<Image
								alt={slide.headline}
								className="object-cover"
								fill
								priority={index === 0}
								sizes="100vw"
								src={slide.image}
							/>
							{/* Dark overlay for text legibility */}
							<div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />

							{/* Content */}
							<div className="relative z-10 max-w-xl space-y-5">
								<span className="inline-block rounded-full bg-accent/20 px-4 py-1 font-bold text-white text-xs uppercase tracking-wider">
									{slide.eyebrow}
								</span>
								<h1 className="font-extrabold text-3xl text-white leading-tight sm:text-5xl">
									{slide.headline}
								</h1>
								<p className="text-base text-white/80 sm:text-lg">
									{slide.subhead}
								</p>
								<div className="flex flex-wrap gap-3 pt-2">
									<Button
										asChild
										className="rounded-full bg-primary font-bold text-primary-foreground hover:bg-primary/90"
										size="lg"
									>
										<Link href="/estimate">Estimate now</Link>
									</Button>
									<Button
										asChild
										className="rounded-full border-white/40 bg-transparent font-bold text-white hover:bg-white/10"
										size="lg"
										variant="outline"
									>
										<Link href="/estimate#price-list">View price list</Link>
									</Button>
								</div>
							</div>
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
		</Carousel>
	);
}
