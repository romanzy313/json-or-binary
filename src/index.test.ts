import { describe, it, expect } from "vitest";
import { hello } from "./index";

describe("smoke", () => {
  it("tests", () => {
    const result = hello();
    expect(result).toEqual("hello world");
  });
});
