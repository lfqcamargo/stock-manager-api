export type TransactionContext = unknown;

export interface TransactionContextParams {
  transactionContext?: TransactionContext;
  commit: boolean;
}
