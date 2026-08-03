# Unity Runtime Checksum

Algorithm: SHA-256.

Canonical serialization:

1. Start with the complete Unity runtime package.
2. Set `metadata.generatedAt` and `metadata.packageChecksum` to empty strings.
3. Remove properties whose value is `undefined`.
4. Sort every object key lexicographically and recursively.
5. Preserve array order exactly as published.
6. Serialize as compact UTF-8 JSON.
7. Compute lowercase hexadecimal SHA-256.

Only `generatedAt` and the checksum field itself are excluded as volatile/self-referential metadata. Contract data, schema metadata, content version, capabilities, compatibility policy, validation status, and array order are included.

Unity should verify the checksum before replacing its cached runtime. Cache identity is `(runtimeSchemaId, contentVersion, packageChecksum)`.
