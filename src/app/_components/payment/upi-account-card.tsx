"use client";

import { Check, Copy, Smartphone } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export interface UpiAccountCardData {
	label: string;
	upiId: string | null;
	phoneNumber: string;
}

export function UpiAccountCard({ account }: { account: UpiAccountCardData }) {
	return (
		<div className="rounded-xl border border-[#14163A]/10 bg-white p-6 shadow-sm">
			<div className="flex items-center gap-3">
				<span className="grid h-11 w-11 place-items-center rounded-full bg-[#14163A]/5 text-[#14163A]">
					<Smartphone className="h-5 w-5" />
				</span>
				<h3 className="font-bold text-[#14163A] text-lg">{account.label}</h3>
			</div>

			<dl className="mt-5 space-y-3 text-sm">
				<Row copyable label="Phone number (UPI)" value={account.phoneNumber} />
				{account.upiId ? (
					<Row copyable label="UPI ID" value={account.upiId} />
				) : null}
			</dl>
		</div>
	);
}

function Row({
	label,
	value,
	copyable,
}: {
	label: string;
	value: string;
	copyable?: boolean;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(value);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<div className="flex items-center justify-between gap-3">
			<div>
				<dt className="text-[#14163A]/45 text-xs uppercase tracking-wide">
					{label}
				</dt>
				<dd className="font-semibold text-[#14163A]">{value}</dd>
			</div>
			{copyable ? (
				<Button
					aria-label={`Copy ${label}`}
					onClick={handleCopy}
					size="icon"
					variant="ghost"
				>
					{copied ? (
						<Check className="h-4 w-4 text-emerald-500" />
					) : (
						<Copy className="h-4 w-4 text-[#14163A]/50" />
					)}
				</Button>
			) : null}
		</div>
	);
}
