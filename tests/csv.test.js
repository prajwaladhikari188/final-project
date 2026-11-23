import test from "node:test";
import assert from "node:assert/strict";
import { createCsvContent } from "../src/utils/csv.js";

test("CSV escapes quotes and neutralizes formula-leading cells", () => {
  const csv = createCsvContent(
    ["Name", "Value", "Price"],
    [['=1+1', 'text "with" quotes', 12], ["\t@SUM(A1:A2)", "+cmd", -5]]
  );
  assert.equal(
    csv,
    '"Name","Value","Price"\r\n"\'=1+1","text ""with"" quotes",12\r\n"\'\t@SUM(A1:A2)","\'+cmd",-5'
  );
});
