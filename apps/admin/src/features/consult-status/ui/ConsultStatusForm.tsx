"use client";

import { useActionState } from "react";
import { ActionMessage, SubmitButton } from "@/shared/ui";
import { updateConsultStatusAction } from "../api/actions";
import { consultStatusLabel } from "../model/labels";

export function ConsultStatusForm({ id, status, name }: { id: number; status: keyof typeof consultStatusLabel; name: string }) {
  const [state, action] = useActionState(updateConsultStatusAction, null);
  const selectId = `consult-${id}`;
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <div className="field has-addons mb-0">
        <div className="control">
          <label className="is-sr-only" htmlFor={selectId}>
            {name} 상담 상태
          </label>
          <div className="select is-small">
            <select id={selectId} name="status" defaultValue={status}>
              {Object.entries(consultStatusLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="control">
          <SubmitButton className="is-small is-link">
            변경<span className="is-sr-only">: {name}</span>
          </SubmitButton>
        </div>
      </div>
      <ActionMessage state={state} />
    </form>
  );
}
