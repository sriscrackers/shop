import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const QUICK_LINKS = [
	{ href: "/", label: "Home" },
	{ href: "/estimate", label: "Estimate" },
	{ href: "/about-us", label: "About us" },
	{ href: "/contact-us", label: "Contact us" },
	{ href: "/payment", label: "Payment" },
] as const;

export interface SiteFooterProps {
	shopName: string;
	shopAddress: string | null;
	mail: string | null;
	contactPhonePrimary: string | null;
	contactPhoneSecondary: string | null;
}

export function SiteFooter(props: SiteFooterProps) {
	const year = new Date().getFullYear();
	const phones = [
		props.contactPhonePrimary,
		props.contactPhoneSecondary,
	].filter((p): p is string => Boolean(p));

	return (
		<footer className="bg-[var(--brand-navy)] text-white">
			<div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-3">
				<div className="space-y-4 lg:col-span-1">
					<div className="flex items-center gap-3">
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
							<span className="block font-extrabold text-lg tracking-tight">
								{props.shopName}
							</span>
							<span className="block font-medium text-[var(--brand-gold)] text-xs">
								Brighten your Diwali!
							</span>
						</span>
					</div>
					<p className="text-sm text-white/65 leading-relaxed">
						As per the 2018 Supreme Court order, online sale of firecrackers is
						not permitted. Estimates submitted here are confirmed over a phone
						call before any order is finalised — we follow every
						explosives-licensing and statutory compliance that applies to our
						shop and godowns.
					</p>
				</div>

				<div>
					<h3 className="font-bold text-[var(--brand-gold)] text-sm uppercase tracking-wider">
						Quick links
					</h3>
					<ul className="mt-4 space-y-2.5">
						{QUICK_LINKS.map((link) => (
							<li key={link.href}>
								<Link
									className="text-sm text-white/75 transition hover:text-white"
									href={link.href}
								>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</div>

				<div>
					<h3 className="font-bold text-[var(--brand-gold)] text-sm uppercase tracking-wider">
						For more
					</h3>
					<ul className="mt-4 space-y-3.5 text-sm text-white/75">
						{props.shopAddress ? (
							<li className="flex items-start gap-2.5">
								<MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-gold)]" />
								<span>{props.shopAddress}</span>
							</li>
						) : null}
						{props.mail ? (
							<li className="flex items-center gap-2.5">
								<Mail className="h-4 w-4 shrink-0 text-[var(--brand-gold)]" />
								<a className="hover:text-white" href={`mailto:${props.mail}`}>
									{props.mail}
								</a>
							</li>
						) : null}
						{phones.length > 0 ? (
							<li className="flex items-center gap-2.5">
								<Phone className="h-4 w-4 shrink-0 text-[var(--brand-gold)]" />
								<span className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
									{phones.map((phone) => (
										<a
											className="hover:text-white"
											href={`tel:${phone}`}
											key={phone}
										>
											{phone}
										</a>
									))}
								</span>
							</li>
						) : null}
					</ul>
				</div>
			</div>

			<div className="border-white/10 border-t px-6 py-5">
				<p className="mx-auto max-w-7xl text-center text-white/55 text-xs">
					© {year} {props.shopName}. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
