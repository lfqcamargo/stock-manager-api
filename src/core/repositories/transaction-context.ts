export type TransactionContext = unknown;

export interface TransactionContextParams {
  transactionContext?: TransactionContext;
  commit?: boolean;
}

export function resolveClient<T>(
  client: T,
  options?: TransactionContextParams,
): T {
  if (options?.transactionContext) {
    return options.transactionContext as T;
  }
  return client;
}
