import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ErrorSummary, TextAreaField, TextField } from "./Field";

const meta = { title: "shared/ui/Field", component: TextField } satisfies Meta<typeof TextField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Required: Story = { args: { id: "name", label: "받는 분", required: true } };
export const WithHint: Story = { args: { id: "email", label: "이메일", type: "email", hint: "주문 안내를 받을 주소입니다." } };
export const WithError: Story = {
  args: { id: "phone", label: "휴대폰 번호", required: true, error: "휴대폰 번호를 010-1234-5678 형식으로 입력해 주세요." },
};
export const TextArea: Story = {
  args: { id: "memo", label: "배송 메모" },
  render: () => <TextAreaField id="memo" label="배송 메모" maxLength={200} />,
};
export const Summary: Story = {
  args: { id: "x", label: "x" },
  render: () => (
    <ErrorSummary titleId="summary-title" errors={{ name: "받는 분 이름을 입력해 주세요.", phone: "휴대폰 번호를 입력해 주세요." }} />
  ),
};
