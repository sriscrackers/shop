import { ContactLeadForm } from "@/app/_components/contact/contact-lead-form";
import { DiyaWatermark } from "@/app/_components/layout/diya-watermark";

export default function ContactUsPage() {
	return (
		<div className="relative overflow-hidden">
			<DiyaWatermark className="pointer-events-none absolute top-1/2 right-0 h-[520px] w-[520px] translate-x-1/4 -translate-y-1/2 opacity-80 sm:h-[640px] sm:w-[640px]" />

			<div className="relative mx-auto max-w-5xl px-4 py-14 text-center sm:px-6">
				<h1 className="font-extrabold text-3xl text-[#14163A] sm:text-4xl">
					Contact us
				</h1>
				<p className="mx-auto mt-4 max-w-2xl text-[#14163A]/65">
					Our price list is neatly categorised so you can filter exactly what
					you want and build your estimate in minutes. Leave your number below
					and we&apos;ll call you back.
				</p>
				<div className="mt-10">
					<ContactLeadForm />
				</div>
			</div>
		</div>
	);
}
