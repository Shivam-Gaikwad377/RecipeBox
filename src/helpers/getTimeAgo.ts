const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "seconds" },
  { amount: 60, unit: "minutes" },
  { amount: 24, unit: "hours" },
  { amount: 7, unit: "days" },
  { amount: 4.34524, unit: "weeks" }, // avg weeks/month, keeps drift out
  { amount: 12, unit: "months" },
  { amount: Number.POSITIVE_INFINITY, unit: "years" },
];

export function getTimeAgo(date: Date | string | number): string {
  const target = date instanceof Date ? date : new Date(date);
  let duration = (target.getTime() - Date.now()) / 1000; // negative = past

  for (const { amount, unit } of DIVISIONS) {
    if (Math.abs(duration) < amount) {
      return rtf.format(Math.round(duration), unit);
    }
    duration /= amount;
  }
  return rtf.format(Math.round(duration), "years"); // unreachable, keeps TS happy
}