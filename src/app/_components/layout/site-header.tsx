"use client";

import { Mail, MapPin, Menu, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
	{ href: "/", label: "Home" },
	{ href: "/estimate", label: "Estimate" },
	{ href: "/payment", label: "Payment" },
	{ href: "/about-us", label: "About us" },
	{ href: "/contact-us", label: "Contact us" },
] as const;

export interface SiteHeaderProps {
	shopName: string;
	address: string | null;
	mail: string | null;
	contactPhonePrimary: string | null;
	contactPhoneSecondary: string | null;
}

export function SiteHeader(props: SiteHeaderProps) {
	const pathname = usePathname();
	const phones = [
		props.contactPhonePrimary,
		props.contactPhoneSecondary,
	].filter((p): p is string => Boolean(p));

	return (
		<header className="sticky top-0 z-40 bg-white shadow-sm">
			<div className="hidden border-white/10 border-b bg-[var(--brand-navy)] text-white lg:block">
				<div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-2.5 text-sm">
					{props.address ? (
						<div className="flex items-center gap-2 text-white/85">
							<MapPin className="h-4 w-4 shrink-0 text-[var(--brand-gold)]" />
							<span>{props.address}</span>
						</div>
					) : (
						<span />
					)}
					<div className="flex items-center gap-6">
						{props.mail ? (
							<a
								className="flex items-center gap-2 text-white/85 transition hover:text-white"
								href={`mailto:${props.mail}`}
							>
								<Mail className="h-4 w-4 text-[var(--brand-gold)]" />
								{props.mail}
							</a>
						) : null}
						{phones.length > 0 ? (
							<div className="flex items-center gap-2 text-white/85">
								<Phone className="h-4 w-4 shrink-0 text-[var(--brand-gold)]" />
								<span className="flex items-center gap-1.5">
									{phones.map((phone, i) => (
										<span className="flex items-center" key={phone}>
											<a
												className="transition hover:text-white"
												href={`tel:${phone}`}
											>
												{phone}
											</a>
											{i < phones.length - 1 && (
												<span className="ml-1 text-white/50">,</span>
											)}
										</span>
									))}
								</span>
							</div>
						) : null}
					</div>
				</div>
			</div>

			<div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
				<Link className="flex items-center gap-3" href="/">
					<span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
						<Image
							alt={`${props.shopName} logo`}
							className="object-cover"
							fill
							priority
							sizes="44px"
							src="/logo.jpeg"
						/>
					</span>
					<span className="leading-tight">
						<span className="block font-extrabold text-foreground text-lg tracking-tight">
							{props.shopName}
						</span>
						<span className="block font-medium text-primary text-xs">
							Brighten your Diwali!
						</span>
					</span>
				</Link>

				<nav className="hidden items-center gap-8 lg:flex">
					{NAV_LINKS.map((link) => {
						const isActive = pathname === link.href;
						return (
							<Link
								className={cn(
									"font-semibold text-sm transition-colors",
									isActive
										? "text-primary"
										: "text-foreground/70 hover:text-foreground",
								)}
								href={link.href}
								key={link.href}
							>
								{link.label}
							</Link>
						);
					})}
				</nav>

				<div className="hidden lg:block">
					<Button
						asChild
						className="rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
					>
						<Link href="/estimate#price-list">Price list</Link>
					</Button>
				</div>

				<Sheet>
					<SheetTrigger asChild>
						<Button
							aria-label="Open menu"
							className="lg:hidden"
							size="icon"
							variant="ghost"
						>
							<Menu className="h-6 w-6 text-foreground" />
						</Button>
					</SheetTrigger>
					<SheetContent className="w-72" side="right">
						<nav className="mt-10 flex flex-col gap-1">
							{NAV_LINKS.map((link) => (
								<SheetClose asChild key={link.href}>
									<Link
										className={cn(
											"rounded-md px-3 py-2.5 font-semibold text-base transition-colors",
											pathname === link.href
												? "bg-primary/10 text-primary"
												: "text-foreground hover:bg-foreground/5",
										)}
										href={link.href}
									>
										{link.label}
									</Link>
								</SheetClose>
							))}
							<SheetClose asChild>
								<Button
									asChild
									className="mt-3 rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
								>
									<Link href="/estimate#price-list">Price list</Link>
								</Button>
							</SheetClose>
						</nav>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
}
