# 03_build — implement one bounded slice

One job: make the smallest isolated change that satisfies the approved spec.

## Inputs
- approved spec
- owning source files
- exact vendor/API references needed for the slice

## Process
1. Reuse before adding.
2. Keep vendor code behind adapters.
3. Preserve current working paths.
4. Add tests/observability with the change.
5. Do not expand scope to adjacent ideas.

## Output
Code + tests + implementation receipt.

## Human check
Builder does not approve release.
