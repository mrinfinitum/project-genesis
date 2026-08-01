# Build Health Audit

| Command | Result | Exit | Duration ms |
| --- | --- | --- | --- |
| npm run build | passed | 0 | 19663 |
| npm run lint | failed | 1 | 365 |
| npm test | failed | 1 | 84 |
| npm run verify:resource-taxonomy | passed | 0 | 391 |
| npm run verify:resource-discovery | passed | 0 | 361 |
| npm run verify:species-plates | passed | 0 | 193 |
| npm run verify:environment-composer | failed | 1 | 2571 |

## Notes

- Command outputs, exit codes, and durations are preserved in `build-health.json`.
- This project does not declare a conventional `test` script in `package.json`; `npm test` was run to record the current behavior rather than silently omitting it.
- Validation commands were sampled from documented package scripts. Unrun verifier scripts are not claimed as passing.
