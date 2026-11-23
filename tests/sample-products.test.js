import assert from "node:assert/strict";
import test from "node:test";
import { CATEGORIES } from "../src/data/appDefaults.js";
import { SAMPLE_PRODUCTS, SAMPLE_PRODUCTS_PER_CATEGORY } from "../src/data/sampleProducts.js";

test("sample catalog contains 50 illustrated products in every inventory category", () => {
  const categories = CATEGORIES.filter((category) => category !== "All Categories");
  assert.equal(SAMPLE_PRODUCTS_PER_CATEGORY, 50);
  assert.equal(SAMPLE_PRODUCTS.length, categories.length * SAMPLE_PRODUCTS_PER_CATEGORY);
  assert.equal(new Set(SAMPLE_PRODUCTS.map((product) => product.code)).size, SAMPLE_PRODUCTS.length);

  for (const category of categories) {
    const products = SAMPLE_PRODUCTS.filter((product) => product.category === category);
    assert.equal(products.length, SAMPLE_PRODUCTS_PER_CATEGORY, category);
    assert.ok(products.every((product) => product.isSample && product.image.startsWith("data:image/svg+xml,")));
  }
});
