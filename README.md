# json-or-binary

Simply encode and decode discriminated unions into a binary format.

## Installation

```bash
npm install json-or-binary
```

## Usage

All values must follow the `{type: string, value: unknown}` structure.

```typescript
import { encode, decode } from 'json-or-binary';

// JSON mode (for non-binary values)
const encoded = encode({ type: 'message', value: 'hello' });
// Result: {"type":"message","value":"hello"}

const decoded = decode(encoded);
// Result: { type: 'message', value: 'hello' }

// Binary mode (for Uint8Array values)
const binaryEncoded = encode({ 
  type: 'image', 
  value: new Uint8Array([1, 2, 3]) 
});
// Result: "image"<binary data>

const binaryDecoded = decode(binaryEncoded);
// Result: { type: 'image', value: Uint8Array([1, 2, 3]) }
```

## How it works

- **Input**: Always `{type: string, value: any}`
- **JSON mode**: Uses standard JSON when `value` is not `Uint8Array`
- **Binary mode**: Uses `"type"<binary>` format when `value` is `Uint8Array`
- **Auto-detection**: Decoder detects format by first byte (`{` or `"`)
- **Constraint**: Type field cannot contain `"` character

## API

### `encode<T>(value: T): Uint8Array`

Encodes a discriminated value to binary format.

### `decode<T>(data: Uint8Array): T`

Decodes binary data back to discriminated value. Consider validating output with `zod`, `Typebox`, or similar for type safety.


## License

MIT
