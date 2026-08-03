# Unity Migration Notes: game-runtime-v2

Do not update Unity until this package is deployed and returns `Ready`.

Migration steps:

1. Add a v2 envelope model and capability negotiation before runtime model parsing.
2. Require Unity client version `2.0.0` or newer.
3. Verify the package checksum before cache activation.
4. Persist source content version and package checksum on active actions.
5. Consume generated progression rows directly; do not recalculate Studio curves.
6. Apply `masteryXpOverflowPolicy` instead of inventing overflow behavior.
7. Resolve typed cost/reward references through the published resolver contracts; never substitute zero.
8. Apply each action's structured offline and reward-claim policies.
9. Apply progression/action reconciliation policies during runtime replacement.

The authoritative route is `/api/export/unity-runtime.json`. Do not use `/api/export/unity` as gameplay runtime input.
