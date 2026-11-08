"use client";

import { useActionState } from "react";
import { useActionFormLock } from "@/shared/lib";
import { ActionMessage, SubmitButton } from "@/shared/ui";
import { updateMerchAction } from "../api/actions";

type MerchRowProps = {
  productId: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  listPrice: number | null;
  stock: number;
  featured: boolean;
  visible: boolean;
  /** 재입고 알림을 신청한 회원 수 */
  restockRequests?: number;
};

/** 상품 한 줄 수정. 표 안에서는 form이 tr을 감쌀 수 없어 form 속성으로 입력을 묶는다. */
export function MerchRow(props: MerchRowProps) {
  const [state, action] = useActionState(updateMerchAction, null);
  const guardSubmit = useActionFormLock(state);
  const formId = `merch-${props.productId}`;
  const id = (field: string) => `${formId}-${field}`;

  return (
    <tr>
      <th scope="row">
        <span className="is-block">{props.name}</span>
        <span className="is-size-7 has-text-grey-dark">
          {props.brand} · {props.category}
        </span>
        <ActionMessage state={state} />
      </th>
      <td>
        <label className="is-sr-only" htmlFor={id("price")}>
          {props.name} 판매가
        </label>
        <input id={id("price")} form={formId} name="price" className="input is-small" inputMode="numeric" defaultValue={state?.values?.price ?? props.price} required />
      </td>
      <td>
        <label className="is-sr-only" htmlFor={id("listPrice")}>
          {props.name} 정가
        </label>
        <input id={id("listPrice")} form={formId} name="listPrice" className="input is-small" inputMode="numeric" defaultValue={state?.values?.listPrice ?? props.listPrice ?? ""} placeholder="없음" />
      </td>
      <td>
        <label className="is-sr-only" htmlFor={id("stock")}>
          {props.name} 재고
        </label>
        <input
          id={id("stock")}
          form={formId}
          name="stock"
          className={`input is-small ${props.stock < 5 ? "is-warning" : ""}`}
          inputMode="numeric"
          defaultValue={state?.values?.stock ?? props.stock}
          required
        />
      </td>
      <td className="has-text-centered">
        <label className="checkbox">
          <input form={formId} type="checkbox" name="featured" defaultChecked={state?.values ? state.values.featured === "on" : props.featured} />
          <span className="is-sr-only">{props.name} 추천</span>
        </label>
      </td>
      <td className="has-text-centered">
        <label className="checkbox">
          <input form={formId} type="checkbox" name="visible" defaultChecked={state?.values ? state.values.visible === "on" : props.visible} />
          <span className="is-sr-only">{props.name} 노출</span>
        </label>
      </td>
      <td className="has-text-centered">{props.restockRequests ? <span className="tag is-warning is-light">{props.restockRequests}명</span> : "-"}</td>
      <td>
        <form id={formId} action={action} onSubmit={guardSubmit}>
          <input type="hidden" name="productId" value={props.productId} />
          <SubmitButton className="is-small is-link">
            저장<span className="is-sr-only">: {props.name}</span>
          </SubmitButton>
        </form>
      </td>
    </tr>
  );
}
