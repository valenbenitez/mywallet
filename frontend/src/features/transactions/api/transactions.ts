import { apiRequest } from "@/shared/api";
import type {
  ListTransactionsQuery,
  TransactionListResponse,
  TransactionPublic,
} from "../model/types";

function toQueryString(query: ListTransactionsQuery): string {
  const params = new URLSearchParams();
  if (query.walletId != null) params.set("walletId", query.walletId);
  if (query.direction != null) params.set("direction", query.direction);
  if (query.state != null) params.set("state", query.state);
  if (query.limit != null) params.set("limit", String(query.limit));
  if (query.cursor != null) params.set("cursor", query.cursor);
  const qs = params.toString();
  return qs === "" ? "" : `?${qs}`;
}

/** `GET /transactions` — Bearer; paginated history for the authenticated user. */
export function listTransactions(
  query: ListTransactionsQuery = {},
): Promise<TransactionListResponse> {
  return apiRequest<TransactionListResponse>(
    `/transactions${toQueryString(query)}`,
  );
}

/** `GET /transactions/:id` — Bearer; single transaction detail. */
export function getTransaction(id: string): Promise<TransactionPublic> {
  return apiRequest<TransactionPublic>(`/transactions/${id}`);
}
