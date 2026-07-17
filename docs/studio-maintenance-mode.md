# Project Genesis Studio Maintenance Mode

Project Genesis Studio is the canonical content and asset IDE. Game repositories own rendering, client simulation, and implementation-specific UI.

## Change Classes

- **Content-only change:** edits canonical records, assets, tags, labels, requirements, or production metadata without changing runtime schema. Usually no `runtimeVersion` or `architectureVersion` change.
- **Studio tooling change:** improves authoring UI, verification, search, command palette, downloads, or production health. Does not bump `contentVersion` unless exported runtime data changes.
- **Runtime contract change:** adds/removes/renames fields consumed by game clients. Requires verifier updates, checksum regeneration, and content release review.
- **Architecture change:** changes ownership boundaries, source-of-truth rules, or published compatibility policy. Requires `architectureVersion` review.
- **New canonical system:** only allowed when the Architecture Workspace accepts ownership, runtime boundaries, validators, export shape, and game ingestion expectations.

## Version Policy

- Bump `contentVersion` when published client-consumed content or runtime fields change.
- Bump `runtimeVersion` only for incompatible runtime schema contracts.
- Bump `architectureVersion` only for accepted architecture contract changes.
- Studio-only UI and verifier changes should not bump runtime content.

## Required Verifier Updates

Every runtime or architecture change must update the matching verifier before merge. Studio-only changes should update focused verifiers such as content browser, command palette, asset downloads, production health, route health, performance, accessibility, and private-path boundary checks.

## Game Ingestion Expectations

The Game consumes approved published runtime/API content. It should not infer canonical gameplay rules that Studio owns, and it should keep local fallbacks only during staged migration.

## Deprecation Policy

Obsolete Studio routes must redirect safely. Deprecated exports must remain available until all known clients have migrated or a compatibility note is published.

## Release Checklist

1. Run `npm run build`.
2. Run `npm run verify:studio-gold`.
3. Confirm all six engine exports are Ready.
4. Confirm no private path leakage.
5. Confirm no broken internal route files.
6. Commit with a focused message.
7. Push `main`.
