# Progression Migration Report

The migration preserves every authored upgrade ID and source record. Runtime upgrades now start at Level 1, master at Level 100, reference an era progression profile and XP source profile, and contain deterministic explicit generated rows.

Legacy base cost, resource, and effect values seed the explicit generated rows. Unity must consume these rows and must not reproduce Studio curve formulas.

Manual balancing remains appropriate for profile-specific resources, prerequisite overrides, and bespoke milestone effects.
