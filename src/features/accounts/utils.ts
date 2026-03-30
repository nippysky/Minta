import type { AccountTransaction, LinkedAccount } from "@/src/features/accounts/types";

export function formatCurrency(value: number) {
  return `₦${Math.abs(value).toLocaleString("en-NG")}`;
}

export function maskMoney(visible: boolean, value: number, prefix?: "+" | "-") {
  if (!visible) {
    return prefix ? `${prefix}••••••` : "••••••";
  }

  if (prefix) {
    return `${prefix}${formatCurrency(value)}`;
  }

  return formatCurrency(value);
}

export function getNetWorth(accounts: LinkedAccount[]) {
  const bankAccounts = accounts
    .filter((item) => item.kind === "bank")
    .reduce((sum, item) => sum + item.balance, 0);

  const savingsGoals = 1400000;
  const investments = 9347217;

  return {
    bankAccounts,
    savingsGoals,
    investments,
    total: bankAccounts + savingsGoals + investments,
  };
}

export function getAccountById(accounts: LinkedAccount[], accountId: string) {
  return accounts.find((item) => item.id === accountId) ?? null;
}

export function getTransactionsByAccount(
  transactions: AccountTransaction[],
  accountId: string
) {
  return transactions.filter((item) => item.accountId === accountId);
}

export function groupTransactionsByDate(transactions: AccountTransaction[]) {
  const map = new Map<string, AccountTransaction[]>();

  for (const txn of transactions) {
    const date = new Date(txn.occurredAt);
    const key = date.toDateString();
    const current = map.get(key) ?? [];
    current.push(txn);
    map.set(key, current);
  }

  return Array.from(map.entries())
    .map(([key, items]) => ({
      key,
      label: formatSectionDate(key),
      items: items.sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
      ),
    }))
    .sort(
      (a, b) => new Date(b.key).getTime() - new Date(a.key).getTime()
    );
}

export function formatSectionDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatFullDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(value: string) {
  const date = new Date(value);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}