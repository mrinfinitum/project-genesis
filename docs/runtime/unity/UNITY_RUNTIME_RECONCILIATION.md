# Runtime Reconciliation

## Progression

- XP requirement changed: `preserve_absolute_xp`
- Maximum level decreased: `preserve_level`
- Maximum level increased: `preserve_level`
- Labor cost changed: `use_new_cost_for_future_levels`
- Effect curve changed: `recalculate_from_current_level`
- XP source changed: `preserve_absolute_xp`
- Overflow policy changed: `apply_on_next_xp_award`
- Upgrade deprecated: `preserve_level`

The initial mastery XP overflow policy is `carry_forward`.

## Actions

- Duration changed: `recalculate_remaining_duration`
- Costs changed: `lock_to_source_runtime_version`
- Requirements changed: `grandfather_active_action`
- Rewards changed: `lock_to_source_runtime_version`
- Queue policy changed: `grandfather_active_action`
- Profile deprecated: `manual_review_required`
- Active action from older runtime: `lock_to_source_runtime_version`
- Cancellation fallback: `cancel_and_refund`

Game-owned action instances must record the source content version and package checksum so these policies can be applied deterministically.
