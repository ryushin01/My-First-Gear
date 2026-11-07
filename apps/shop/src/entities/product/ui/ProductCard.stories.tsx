import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getProductBySlug } from "@mfg/catalog";
import { ProductCard } from "./ProductCard";

const meta = {
  title: "entities/product/ProductCard",
  component: ProductCard,
  decorators: [(Story) => <div style={{ maxWidth: 300 }}><Story /></div>],
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Discounted: Story = { args: { product: getProductBySlug("geforce-rtx-5070-ti-16gb")! } };
export const SoldOut: Story = { args: { product: getProductBySlug("nintendo-switch-2")! } };
export const Consult: Story = { args: { product: getProductBySlug("lamborghini-aventador")! } };
export const SonyWalkman: Story = { args: { product: getProductBySlug("sony-nw-wm1zm2")! } };
