// Dates are stored/passed around as plain "YYYY-MM-DD" strings. Parsing at
// noon local time avoids the classic off-by-one-day bug where midnight in
// one timezone rolls back to the previous day when formatted in another.
export function todayDateString(): string {
  return toDateString(new Date());
}

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateString(value: string): Date {
  return new Date(`${value}T12:00:00`);
}

export function formatDateForDisplay(value: string): string {
  return parseDateString(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
