import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { products } from "@mfg/catalog";
import { GearArt } from "@mfg/gear-art";

/** 모든 상품 그림을 한눈에 본다. 그림은 @mfg/gear-art 패키지에 있다. */
const meta = { title: "entities/product/GearArt gallery", component: GearArt } satisfies Meta<typeof GearArt>;
export default meta;

export const AllProducts: StoryObj<typeof meta> = {
  args: { art: products[0].art },
  render: () => (
    <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, listStyle: "none", padding: 0 }}>
      {products.map((product) => (
        <li key={product.id} style={{ border: "1px solid #333", borderRadius: 8, padding: 8 }}>
          <GearArt art={product.art} label={`${product.name} 그림`} style={{ width: "100%", height: "auto" }} />
          <p style={{ fontSize: 12, marginTop: 4 }}>{product.name}</p>
        </li>
      ))}
    </ul>
  ),
};
