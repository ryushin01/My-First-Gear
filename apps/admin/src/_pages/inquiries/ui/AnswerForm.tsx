"use client";

import { useActionState } from "react";
import { useActionFormLock } from "@/shared/lib";
import { ActionMessage, SubmitButton, type ActionState } from "@/shared/ui";
import { answerInquiryAction, answerQuestionAction } from "../api/actions";

type AnswerFormProps = { kind: "inquiry" | "question"; id: number; label: string; defaultValue?: string | null };

export function AnswerForm({ kind, id, label, defaultValue }: AnswerFormProps) {
  const [state, action] = useActionState<ActionState, FormData>(kind === "inquiry" ? answerInquiryAction : answerQuestionAction, null);
  const guardSubmit = useActionFormLock(state);
  const fieldId = `${kind}-${id}-answer`;
  return (
    <form action={action} onSubmit={guardSubmit}>
      <input type="hidden" name="id" value={id} />
      <div className="field">
        <label className="label is-small" htmlFor={fieldId}>
          {label}
        </label>
        <div className="control">
          <textarea id={fieldId} name="answer" className="textarea is-small" rows={2} maxLength={2000} defaultValue={state?.values?.answer ?? defaultValue ?? ""} required />
        </div>
        <ActionMessage state={state} />
      </div>
      <SubmitButton className="is-small is-link">{defaultValue ? "답변 고치기" : "답변 등록"}</SubmitButton>
    </form>
  );
}
