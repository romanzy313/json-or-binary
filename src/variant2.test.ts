import { describe, it, expect } from "vitest";
import { binarize, configure, parse } from "./variant2";

describe("default", () => {
  type TestType =
    | {
        type: "json";
        value: string;
      }
    | {
        type: "binary";
        value: Uint8Array;
      };
  it("encodes and decodes json", () => {
    const binary = binarize<TestType>({ type: "json", value: "hello, world" });

    expect(binary).toEqual(
      new TextEncoder().encode(`{"type":"json","value":"hello, world"}`),
    );

    const parsed = parse<TestType>(binary);

    expect(parsed).toStrictEqual({ type: "json", value: "hello, world" });
  });

  it("encodes and decodes binary", () => {
    const binary = binarize<TestType>({
      type: "binary",
      value: new TextEncoder().encode(`42`),
    });

    expect(binary).toEqual(new TextEncoder().encode(`"binary"42`));

    const parsed = parse<TestType>(binary);

    expect(parsed).toStrictEqual({
      type: "binary",
      value: new TextEncoder().encode(`42`),
    });
  });
});

describe("custom", () => {
  const { binarize: binarizeCustom, parse: parseCustom } = configure({
    typeField: "abra",
    valueField: "karabra",
  });

  type CustomType =
    | {
        abra: "json";
        catabra: string;
      }
    | {
        abra: "binary";
        catabra: Uint8Array;
      };
  it("encodes and decodes custom", () => {
    const binary = binarizeCustom<CustomType>({
      type: "custom",
      value: "hello, world",
    });

    expect(binary).toEqual(
      new TextEncoder().encode(`{"type":"custom","value":"hello, world"}`),
    );

    const parsed = parseCustom<CustomType>(binary);

    expect(parsed).toStrictEqual({ type: "custom", value: "hello, world" });
  });

  it("encodes and decodes binary", () => {
    const binary = binarizeCustom<CustomType>({
      type: "binary",
      value: new TextEncoder().encode(`42`),
    });

    expect(binary).toEqual(new TextEncoder().encode(`"binary"42`));

    const parsed = parseCustom(binary);

    expect(parsed).toStrictEqual({
      type: "binary",
      value: new TextEncoder().encode(`42`),
    });
  });
});
