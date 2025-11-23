const binarySplitter = '"' as const;
const discriminatedName = "type" as const;
const jsonStartChar = "{".charCodeAt(0);
const binaryStartChar = binarySplitter.charCodeAt(0);

export type AnyDiscriminatedValue = {
  [discriminatedName]: string;
  value: unknown;
};

export function binarize<T extends AnyDiscriminatedValue>(
  dValue: T,
): Uint8Array {
  if (dValue.type.includes(binarySplitter)) {
    throw new Error(`Character '${binarySplitter}' is not allowed in type`);
  }

  // check if value is of binary type like Uint8Array

  if (dValue.value instanceof Uint8Array) {
    // encode it like ^{type}^{binaryValue}
    return new Uint8Array([
      ...new TextEncoder().encode(
        binarySplitter + dValue.type + binarySplitter,
      ),
      ...dValue.value,
    ]);
  }

  const stringified = JSON.stringify(dValue);

  return new TextEncoder().encode(stringified);
}

export function parse<T extends AnyDiscriminatedValue>(data: Uint8Array): T {
  // minimum payload binary size is '"a"'
  if (data.byteLength < 3) {
    throw new MalformedBinaryDataError("Invalid length");
  }

  const first = data[0]!;

  if (first === jsonStartChar) {
    // its just json
    return JSON.parse(new TextDecoder().decode(data)) as T;
  } else if (first === binaryStartChar) {
    // read the type until another '"'
    for (let i = 1; i < data.length; i++) {
      if (data[i] === binaryStartChar) {
        const type = new TextDecoder().decode(data.slice(1, i));
        const value = data.slice(i + 1);
        return { [discriminatedName]: type, value } as T;
      }
    }
    throw new MalformedBinaryDataError("Invalid discriminator");
  } else {
    throw new MalformedBinaryDataError("Invalid starting character");
  }
}

class MalformedBinaryDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MalformedBinaryDataError";
  }
}
