import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getProductBySlug } from "@mfg/catalog";
import { PriceTag } from "./PriceTag";

const meta = { title: "entities/product/PriceTag", component: PriceTag } satisfies Meta<typeof PriceTag>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Regular: Story = { args: { product: getProductBySlug("samsung-ddr5-5600-32gb-kit")! } };
export const Discount: Story = { args: { product: getProductBySlug("lg-gram-16")!, size: "lg" } };
