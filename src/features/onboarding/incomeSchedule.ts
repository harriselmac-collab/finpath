export type IncomeTiming = {
  calculationDate: string;
  expectedDate: string | null;
  estimated: boolean;
};

const isoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const nextDayOfMonth = (day: number, now: Date) => {
  for (let offset = 0; offset < 2; offset += 1) {
    const year = now.getFullYear();
    const month = now.getMonth() + offset;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const candidate = new Date(year, month, Math.min(Math.max(day, 1), lastDay));
    candidate.setHours(0, 0, 0, 0);
    if (candidate >= new Date(now.getFullYear(), now.getMonth(), now.getDate())) return candidate;
  }
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
};

export const resolveIncomeTiming = (
  answers: Record<string, any>,
  now = new Date(),
): IncomeTiming => {
  const explicitDate = typeof answers.nextIncomeDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(answers.nextIncomeDate)
    ? answers.nextIncomeDate
    : null;
  const frequency = answers.incomeFrequency;

  if (frequency === 'monthly' && Number(answers.payday) > 0) {
    const date = isoDate(nextDayOfMonth(Number(answers.payday), now));
    return { calculationDate: date, expectedDate: date, estimated: false };
  }
  if (frequency === 'twiceMonthly' && Number(answers.firstPayday) > 0 && Number(answers.secondPayday) > 0) {
    const dates = [answers.firstPayday, answers.secondPayday]
      .map((day) => nextDayOfMonth(Number(day), now))
      .sort((a, b) => a.getTime() - b.getTime());
    const date = isoDate(dates[0]);
    return { calculationDate: date, expectedDate: date, estimated: false };
  }
  if (explicitDate) {
    return {
      calculationDate: explicitDate,
      expectedDate: explicitDate,
      estimated: answers.incomeDateCertainty === 'approximate',
    };
  }

  const estimate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);
  return { calculationDate: isoDate(estimate), expectedDate: null, estimated: true };
};
