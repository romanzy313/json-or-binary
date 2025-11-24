type Config = { typeField: string; valueField: string };

type AnyDiscriminatedValue<
  T extends {
    typeField: string & keyof any;
    valueField: string & keyof any;
  },
> = {
  [K in T["typeField"]]: string;
} & {
  [K in T["valueField"]]: unknown;
};

const binarySplitter = '"' as const;
const jsonStartChar = "{".charCodeAt(0);
const binaryStartChar = binarySplitter.charCodeAt(0);

export function configure(
  config: Readonly<{ typeField: `${string}`; valueField: `${string}` }>,
) {
  return {
    /**
     * Serializes a discriminated value to binary format.
     * @throws Error if type field contains the `"` character
     */
    binarize<T extends AnyDiscriminatedValue<Config>>(value: T): Uint8Array {
      const type = value[config.typeField]!;
      const valuez = value[config.valueField]! as unknown;

      if (type.includes(binarySplitter)) {
        throw new Error(`Character '${binarySplitter}' is not allowed in type`);
      }

      if (valuez instanceof Uint8Array) {
        // encode it like "{type}"{binaryValue}
        return new Uint8Array([
          ...new TextEncoder().encode(
            binarySplitter + value.type + binarySplitter,
          ),
          ...valuez,
        ]);
      }

      const stringified = JSON.stringify(value);

      return new TextEncoder().encode(stringified);
    },
    /**
     * Parses binary data back to discriminated value.
     * @throws MalformedBinaryDataError if data is invalid
     */
    parse<T extends AnyDiscriminatedValue<Config>>(data: Uint8Array): T {
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
            return {
              [config.typeField]: type,
              [config.valueField]: value,
            } as T;
          }
        }
        throw new MalformedBinaryDataError("Invalid discriminator");
      } else {
        throw new MalformedBinaryDataError("Invalid starting character");
      }
    },
  };
}

const defaultTypeField = "type" as const;
const defaultValueField = "value" as const;

export const { binarize, parse } = configure({
  typeField: defaultTypeField,
  valueField: defaultValueField,
} as const);

class MalformedBinaryDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MalformedBinaryDataError";
  }
}
