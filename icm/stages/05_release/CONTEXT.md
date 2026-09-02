# 05_release — ship only verified work

One job: release an accepted slice with rollback and evidence.

## Inputs
- independent verification verdict
- approval envelope when required
- rollback plan

## Process
1. Confirm exact artifact/version.
2. Confirm secrets remain server-side.
3. Confirm rollback is executable.
4. Release only approved scope.
5. Re-check runtime after release.

## Output
`OUTCOME | EVIDENCE | COST | WHAT CHANGED | RISKS | ROLLBACK | NEXT | HUMAN DECISION`

## Human check
Explicit approval for L3/L4 actions.
