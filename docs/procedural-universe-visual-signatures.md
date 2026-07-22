# Procedural Universe Visual Signatures

Project Genesis Studio owns deterministic generation rules, bounded visual profiles, overrides, validation, and sanitized export contracts. Game clients own rendering, cameras, controls, fog masks, probe state, discovery progress, and save data.

## Deterministic Identity

Visual identity is derived from `universeSeed`, generation version, visual-signature version, semantic level, canonical object ID, visual salt, and uniqueness attempt. The implementation uses FNV-1a 32-bit hashing, xorshift32, and four-decimal quantization. It never uses `Math.random` for persistent identity.

`visual-signature-v1` is independent from topology generation. Changing that version invalidates presentation signatures without changing universe, galaxy, sector, or star-system IDs.

## Hierarchy And Inheritance

The canonical hierarchy remains Universe -> Galaxy -> Sector -> Star System -> celestial bodies. Sectors inherit 35-60% of their parent galaxy's visual character. Star systems inherit 20-45% of their parent sector. A deterministic reroll guard rejects sibling signatures below the minimum visual-distance threshold.

## Profile Libraries

The contract publishes galaxy, sector, and star-system archetypes; palette families; density, lighting, nebula, dust/void, fog, and route profiles; and renderer-neutral device-budget recommendations. Profile IDs are globally unique and stable.

## Overrides

Overrides are optional patches applied over deterministic defaults. They may alter presentation parameters and landmark directives, but never canonical IDs or hierarchy. Milky Way and Sol use authored presentation overrides while retaining deterministic seeds.

## Runtime And Discovery

All six engine exports receive the same `galaxy_engine_contract.proceduralUniverse` contract. Unknown objects display `???` and redact classification, resources, descendants, discoveries, routes, and ownership. The export does not include player-specific state or materialized universe descendants.

## Migration And Parity

Content version 51 introduces signatures as derived metadata. Existing records retain their IDs and acquire signatures on demand. The fixture at `data/universe/fixtures/procedural-visual-signatures-v1.json` gives all clients identical cross-engine inputs and expected signatures.

Run `npm run verify:procedural-universe` to verify determinism, inheritance, sibling uniqueness, overrides, discovery redaction, runtime readiness, and all six engine exports.
