import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { featuredProducts } from "@mfg/catalog";
import { TapeSleeve } from "./TapeSleeve";

const meta = {
  title: "entities/product/TapeSleeve",
  component: TapeSleeve,
  decorators: [(Story) => <div style={{ width: 260 }}><Story /></div>],
} satisfies Meta<typeof TapeSleeve>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { product: featuredProducts()[0] } };

export const AllFeatured: Story = {
  args: { product: featuredProducts()[0] },
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, width: "min(1000px, 90vw)" }}>
      {featuredProducts().map((product) => (
        <TapeSleeve key={product.id} product={product} />
      ))}
    </div>
  ),
};
