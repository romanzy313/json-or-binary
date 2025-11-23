# json-or-binary

Simply serialize discriminated unions into a binary format.

## Installation

```bash
npm install json-or-binary
```

## Usage

```typescript
import { binarize, parse } from 'json-or-binary';

// JSON serialization (for non-binary values)
const jsonData = binarize({ type: 'message', value: 'hello' });
// Result: {"type":"message","value":"hello"}

const parsed = parse(jsonData);
// Result: { type: 'message', value: 'hello' }

// Binary serialization (for Uint8Array values)
const binaryData = binarize({ 
  type: 'image', 
  value: new Uint8Array([1, 2, 3]) 
});
// Result: "image"<binary data>

const parsedBinary = parse(binaryData);
// Result: { type: 'image', value: Uint8Array([1, 2, 3]) }
```


## Format

- **JSON mode**: Standard JSON serialization when value is not Uint8Array
- **Binary mode**: `"type"<binary>` when value is Uint8Array
- Type field cannot contain `"` character
- Parser auto-detects format by first byte

## API

### `binarize<T>(value: T): Uint8Array`

Serializes discriminated value to binary format.

### `parse<T>(data: Uint8Array): T`

Deserializes binary data back to discriminated value.

## Gotchas

Note that the library will forward the specified type `T` in `parse`. It is technically more accurate to return a type of `unknown`, but I took a shortcut for ease of use. To ensure type correctness, consider validating this type using libraries like `zod` or `Typebox`.

## License

MIT
