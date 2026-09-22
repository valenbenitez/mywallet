import { apiRequest } from "@/shared/api";
import type {
  CreateTransferBody,
  CreateTransferResponse,
  EstimateFeeBody,
  FeeEstimateResponse,
} from "../model/types";

/** `POST /wallets/:id/transfers/estimate-fee` — Bearer; fee preview levels. */
export function estimateTransferFee(
  walletId: string,
  body: EstimateFeeBody,
): Promise<FeeEstimateResponse> {
  return apiRequest<FeeEstimateResponse>(
    `/wallets/${walletId}/transfers/estimate-fee`,
    { method: "POST", body },
  );
}

/** `POST /wallets/:id/transfers` — Bearer; create outbound transfer (201). */
export function createTransfer(
  walletId: string,
  body: CreateTransferBody,
): Promise<CreateTransferResponse> {
  return apiRequest<CreateTransferResponse>(
    `/wallets/${walletId}/transfers`,
    { method: "POST", body },
  );
}
