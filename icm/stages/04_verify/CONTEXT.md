# 04_verify — prove the intended result

One job: independently test the slice against the acceptance contract.

## Inputs
- implementation receipt
- spec/proof requirements
- relevant runtime/build environment

## Process
1. Run existing checks first.
2. Run new targeted tests.
3. Trace the result through the actual runtime path.
4. Check security, failure handling, tenant isolation, and rollback where relevant.
5. Record evidence, not impressions.

## Output
Verdict: accept, reject, or halt; evidence refs; largest gap if rejected.

## Human check
Required before L3/L4 release.
