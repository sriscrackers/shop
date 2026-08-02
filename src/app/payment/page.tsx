import { BankAccountCard } from "@/app/_components/payment/bank-account-card";
import { UpiAccountCard } from "@/app/_components/payment/upi-account-card";
import { api } from "@/trpc/server";

export default async function PaymentPage() {
	const [accounts, upiAccounts] = await Promise.all([
		api.bankAccount.list(),
		api.upiAccount.list(),
	]);

	const hasAny = accounts.length > 0 || upiAccounts.length > 0;

	return (
		<div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
			<div className="text-center">
				<h1 className="font-extrabold text-3xl text-[#14163A] sm:text-4xl">
					Payment details
				</h1>
				<p className="mx-auto mt-4 max-w-2xl text-[#14163A]/65">
					Once your estimate is confirmed over a phone call, transfer the amount
					to any account below and share the screenshot on WhatsApp to complete
					your order.
				</p>
			</div>

			{!hasAny ? (
				<p className="mt-10 text-center text-[#14163A]/55 text-sm">
					No payment methods have been added yet.
				</p>
			) : (
				<div className="mt-10 grid gap-6 sm:grid-cols-2">
					{accounts.map((account) => (
						<BankAccountCard account={account} key={account.id} />
					))}
					{upiAccounts.map((account) => (
						<UpiAccountCard account={account} key={account.id} />
					))}
				</div>
			)}
		</div>
	);
}
