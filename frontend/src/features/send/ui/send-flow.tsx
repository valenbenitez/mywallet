"use client";

import { useState } from "react";
import type { SendDraft, SendStep } from "../model/types";
import { SendConfirm } from "./send-confirm";
import { SendForm } from "./send-form";
import { SendSuccess } from "./send-success";

const INITIAL_DRAFT: SendDraft = {
  chain: "MATIC-AMOY",
  destinationAddress: "",
  amount: "",
};

/** Local step state: form → confirm (fee preview) → success mock. */
export function SendFlow() {
  const [step, setStep] = useState<SendStep>("form");
  const [draft, setDraft] = useState<SendDraft>(INITIAL_DRAFT);

  if (step === "success") {
    return <SendSuccess />;
  }

  if (step === "confirm") {
    return (
      <SendConfirm
        draft={draft}
        onBack={() => setStep("form")}
        onConfirm={() => setStep("success")}
      />
    );
  }

  return (
    <SendForm
      draft={draft}
      onChange={setDraft}
      onContinue={() => setStep("confirm")}
    />
  );
}
