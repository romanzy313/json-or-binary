import { it, expect } from "vitest";
import { encode, decode } from "./index";

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
  const binary = encode<TestType>({ type: "json", value: "hello, world" });

  expect(binary).toEqual(
    new TextEncoder().encode(`{"type":"json","value":"hello, world"}`),
  );

  const parsed = decode<TestType>(binary);

  expect(parsed).toStrictEqual({ type: "json", value: "hello, world" });
});

it("encodes and decodes binary", () => {
  const binary = encode<TestType>({
    type: "binary",
    value: new TextEncoder().encode(`42`),
  });

  expect(binary).toEqual(new TextEncoder().encode(`"binary"42`));

  const parsed = decode<TestType>(binary);

  expect(parsed).toStrictEqual({
    type: "binary",
    value: new TextEncoder().encode(`42`),
  });
});

it("encodes and decodes binary with 0 length", () => {
  const binary = encode<TestType>({
    type: "binary",
    value: new Uint8Array(),
  });

  expect(binary).toEqual(new TextEncoder().encode(`"binary"`));

  const parsed = decode<TestType>(binary);

  expect(parsed).toStrictEqual({
    type: "binary",
    value: new Uint8Array(),
  });
});

it("handles invalid input with quote", () => {
  // expect this to throw an error
  expect(() =>
    encode({
      type: 'invalid"',
      value: "whatever",
    }),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Character '"' is not allowed in type]`,
  );
});

it("handles invalid binary data length", () => {
  // expect this to throw an error
  expect(() =>
    decode(new TextEncoder().encode(`"`)),
  ).toThrowErrorMatchingInlineSnapshot(
    `[MalformedBinaryDataError: Invalid length]`,
  );
});

it("handles malformed binary data without closing type", () => {
  // expect this to throw an error
  expect(() =>
    decode(new TextEncoder().encode(`"whatever is not closed`)),
  ).toThrowErrorMatchingInlineSnapshot(
    `[MalformedBinaryDataError: Invalid discriminator]`,
  );
});
