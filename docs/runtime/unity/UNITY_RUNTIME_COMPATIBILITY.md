# Unity Runtime Compatibility

Compatibility is fail-closed.

The client must reject when:

- `runtimeSchemaId` is not in its supported schema list;
- its semantic client version is below `minimumClientVersion`;
- a required capability is unsupported;
- a required contract ID/version is unsupported;
- package validation or checksum verification fails.

`game-runtime-v2` is intentionally distinct from `game-runtime-v1`. Older clients must not silently discard progression or action data.

Unknown optional capabilities may be ignored only when a future package explicitly marks them optional. The current `capabilities` list is required in full.

Contract versions:

| Contract | Version |
| --- | --- |
| canonicalProgressionSystem | 1.0.0 |
| canonicalActionSystem | 1.0.0 |
| timeActionContract | 1.0.0 |
| progressionReconciliation | 1.0.0 |
| actionReconciliation | 1.0.0 |
