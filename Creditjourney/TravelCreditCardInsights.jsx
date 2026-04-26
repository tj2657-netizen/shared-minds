import React, { useMemo, useState } from 'react';

function IconWrap({ children, color = 'bg-sky-100 text-sky-700' }) {
  return (
    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
      {children}
    </span>
  );
}

function TravelIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 11h18" />
      <path d="M7 6l5 5-5 7" />
      <path d="M17 6l-3 5 3 7" />
    </svg>
  );
}

function GroceryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.5L22 8H7" />
    </svg>
  );
}

function FinanceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 20h16" />
      <path d="M7 16V9" />
      <path d="M12 16V5" />
      <path d="M17 16v-4" />
    </svg>
  );
}

function InfoTip({ text }) {
  return (
    <span
      className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600"
      title={text}
      aria-label={text}
    >
      ?
    </span>
  );
}

function merchantLooksTravel(name) {
  const travelKeywords = [
    'airlines',
    'airline',
    'delta',
    'united',
    'southwest',
    'american airlines',
    'jetblue',
    'hertz',
    'avis',
    'budget',
    'enterprise',
    'expedia',
    'booking',
    'hotel',
    'marriott',
    'hilton',
    'hyatt',
    'uber',
    'lyft',
    'amtrak'
  ];

  const normalized = String(name || '').toLowerCase();
  return travelKeywords.some((keyword) => normalized.includes(keyword));
}

export default function TravelCreditCardInsights({
  transactions = [
    { merchant: 'Hertz Rental Car', amount: 218.5 },
    { merchant: 'Whole Foods', amount: 67.2 },
    { merchant: 'Delta Airlines', amount: 420.0 },
    { merchant: 'Target', amount: 88.0 }
  ],
  creditLimit = 5000,
  currentUsage = 1400
}) {
  const [bookingAmount, setBookingAmount] = useState(650);
  const [groceryMonthlySpend, setGroceryMonthlySpend] = useState(250);

  const pointValue = 0.0125;

  const travelMatches = useMemo(
    () => transactions.filter((item) => merchantLooksTravel(item.merchant)),
    [transactions]
  );

  const directPoints = Math.max(0, Number(bookingAmount) || 0) * 2;
  const portalPoints = Math.max(0, Number(bookingAmount) || 0) * 5;
  const extraTravelPoints = portalPoints - directPoints;
  const extraTravelValue = extraTravelPoints * pointValue;

  const groceryExtraPoints = Math.max(0, Number(groceryMonthlySpend) || 0) * 2;
  const groceryExtraValue = groceryExtraPoints * pointValue;
  const savingsEarned = extraTravelValue + groceryExtraValue;

  const utilization = creditLimit > 0 ? (currentUsage / creditLimit) * 100 : 0;
  const utilizationBarColor =
    utilization < 30 ? 'bg-emerald-500' : utilization <= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 rounded-2xl bg-zinc-50 p-4 text-zinc-900 sm:p-6">
      <header className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">TravelCreditCardInsights</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Chase Sapphire Preferred guidance for beginner-to-intermediate users.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Savings Earned Tracker: ${savingsEarned.toFixed(2)}
          <InfoTip text="Estimated incremental value from travel portal optimization and grocery app strategy." />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <IconWrap color="bg-sky-100 text-sky-700">
              <TravelIcon />
            </IconWrap>
            <h3 className="text-lg font-semibold">Travel Insights</h3>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
              <p className="text-xs uppercase tracking-wide text-sky-700">Travel Merchant Detection</p>
              {travelMatches.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                  {travelMatches.map((item, idx) => (
                    <li key={`${item.merchant}-${idx}`}>• {item.merchant}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-zinc-600">No travel-related merchants detected yet.</p>
              )}
            </div>

            <div className="animate-pulse rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="font-semibold text-emerald-800">Travel Protection Tip</p>
              <p className="mt-1 text-sm text-emerald-700">
                You have rental car insurance with this card. You can decline extra coverage.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <p className="font-medium text-zinc-800">Travel Multiplier Calculator</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm text-zinc-600">
                  Booking Amount
                  <input
                    type="number"
                    min="0"
                    value={bookingAmount}
                    onChange={(e) => setBookingAmount(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
                  />
                </label>

                <div className="rounded-lg border border-zinc-200 bg-white p-3 text-sm">
                  <p className="text-zinc-600">Direct Booking (2x)</p>
                  <p className="font-semibold">{Math.round(directPoints)} points</p>
                  <p className="mt-2 text-zinc-600">Chase Portal (5x)</p>
                  <p className="font-semibold">{Math.round(portalPoints)} points</p>
                  <p className="mt-2 text-zinc-600">Extra Value Difference</p>
                  <p className="font-semibold text-emerald-700">${extraTravelValue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <IconWrap color="bg-lime-100 text-lime-700">
              <GroceryIcon />
            </IconWrap>
            <h3 className="text-lg font-semibold">Grocery Optimization</h3>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="font-semibold text-amber-900">Missed Opportunity</p>
              <p className="mt-1 text-sm text-amber-800">
                Earn 3x points by using grocery apps like Instacart or store pickup.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <p className="font-medium">Use Instacart</p>
                <p className="mt-1 text-sm text-zinc-600">Route grocery orders through Instacart to qualify for higher rewards.</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <p className="font-medium">Use Store Apps</p>
                <p className="mt-1 text-sm text-zinc-600">Use Kroger, Publix, and similar pickup apps to optimize category coding.</p>
              </div>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Stores like Walmart and Target do not count for bonus rewards.
            </div>

            <label className="block text-sm text-zinc-600">
              Monthly Grocery Spend (for estimated upside)
              <input
                type="number"
                min="0"
                value={groceryMonthlySpend}
                onChange={(e) => setGroceryMonthlySpend(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
              />
              <span className="mt-1 block text-xs text-emerald-700">
                Potential additional value: ${groceryExtraValue.toFixed(2)}
              </span>
            </label>
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <IconWrap color="bg-violet-100 text-violet-700">
            <FinanceIcon />
          </IconWrap>
          <h3 className="text-lg font-semibold">Credit Utilization Tracker</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-zinc-600">Credit Limit: ${creditLimit.toLocaleString()}</p>
            <p className="text-sm text-zinc-600">Current Usage: ${currentUsage.toLocaleString()}</p>
            <p className="mt-1 text-sm font-medium">Utilization: {utilization.toFixed(1)}%</p>
          </div>
          <div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-200">
              <div
                className={`h-full ${utilizationBarColor}`}
                style={{ width: `${Math.min(100, Math.max(0, utilization))}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-zinc-700">
              Pay $200 before statement date to stay below 30% utilization.
            </p>
          </div>
        </div>
      </article>

      <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-4 sm:p-5">
          <h3 className="text-lg font-semibold">Smart Comparison Table</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-zinc-700">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-700">Basic Behavior</th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-700">Optimized Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              <tr>
                <td className="px-4 py-3 font-medium">Groceries</td>
                <td className="px-4 py-3">In-store</td>
                <td className="px-4 py-3">App-based</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Travel</td>
                <td className="px-4 py-3">Expedia</td>
                <td className="px-4 py-3">Chase Portal</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Dining</td>
                <td className="px-4 py-3">Split bill</td>
                <td className="px-4 py-3">Pay and collect</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Streaming</td>
                <td className="px-4 py-3">Multiple cards</td>
                <td className="px-4 py-3">One card</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
