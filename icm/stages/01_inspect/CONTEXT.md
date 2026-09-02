# 01_inspect — establish the truth

One job: record the baseline and blast radius before code changes.

## Inputs
- `../../context/CURRENT_STATE.md`
- relevant entries in `../../map/objects/_index.md`
- owning source files only

Do NOT load the whole repository unless the change genuinely spans it.

## Process
1. Identify the current implementation path.
2. Record existing checks/build commands and current evidence.
3. Identify dependencies and first-order blast radius.
4. Identify rollback.

## Output
A mission-specific inspect note copied from `../../_templates/MISSION.md`.

## Human check
For L3/L4 or broad migrations, confirm scope before implementation.
