export const transactionQueryRoot = ['transactions'] as const;

export const transactionRecurringRulesKey = (userId: string) =>
  [...transactionQueryRoot, 'recurring-rules', userId] as const;
