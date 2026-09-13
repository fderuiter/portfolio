# 0.3.0 Dependency Security Evidence

Captured on 2026-09-13 for release blocker
[#647](https://github.com/fderuiter/portfolio/issues/647).

## Source Identity

- Audited source revision: `c81442929f7adf71d6ac0780ecd9e14e435de795`
- `package-lock.json` SHA-256:
  `428bffcc98e9a8c41e69761555bf095e3b035597ae7407eb533c47b80ea04c04`
- Provider query: GitHub Dependabot REST API, all alert states
- Provider result: 0 open, 0 dismissed, 118 fixed
- Local result: `npm audit --json --audit-level=none` reports 0 total
  vulnerabilities and 0 at every severity

The evidence commit changes only audit policy, tests, and this report; it does
not change the audited lockfile. The protected release workflow records the
final release commit SHA and deployment ID so publication cannot reuse this
report against a different source tree.

## Release-Workstream Alert Matrix

The final re-query explicitly inspected alerts 96 through 118, spanning the
three completed remediation tickets #644, #645, and #646.

| Alert | Package | Advisory | Severity | Provider state | Resolution |
| ---: | --- | --- | --- | --- | --- |
| 96 | `extract-zip` | `GHSA-jmr9-qjv8-65gv` | High | Fixed | Owning `@lhci/cli` path removed; no patched release exists |
| 97 | `js-yaml` | `GHSA-h67p-54hq-rp68` | Moderate | Fixed | Patched lockfile resolution |
| 98 | `next` | `GHSA-4c39-4ccg-62r3` | Moderate | Fixed | Next.js 16.3.4 |
| 99 | `brace-expansion` | `GHSA-rgw5-rvv9-x895` | High | Fixed | Vulnerable path absent |
| 100 | `nanoid` | `GHSA-2v37-7h3g-55p8` | High | Fixed | Vulnerable path absent |
| 101 | `deepmerge-ts` | `GHSA-ggr8-5vv4-36mx` | High | Fixed | Vulnerable path absent |
| 102 | `ip-address` | `GHSA-v2v4-37r5-5v8g` | Moderate | Fixed | Vulnerable path absent |
| 103 | `mysql2` | `GHSA-3f6p-5ww8-9rcr` | High | Fixed | Vulnerable path absent |
| 104 | `fast-uri` | `GHSA-5jgf-p345-68v8` | High | Fixed | Vulnerable path absent |
| 105 | `fast-uri` | `GHSA-fph4-wmhf-6fwf` | High | Fixed | Vulnerable path absent |
| 106 | `qs` | `GHSA-x5fp-wj9c-mxmx` | Moderate | Fixed | Vulnerable path absent |
| 107 | `mysql2` | `GHSA-rgwj-5xj2-c3m3` | Moderate | Fixed | Vulnerable path absent |
| 108 | `fast-uri` | `GHSA-f65p-4m7j-42xc` | High | Fixed | Vulnerable path absent |
| 109 | `fast-uri` | `GHSA-jqff-g426-hqxp` | High | Fixed | Vulnerable path absent |
| 110 | `qs` | `GHSA-4mjr-xmp4-gh2g` | Moderate | Fixed | Vulnerable path absent |
| 111 | `extract-zip` | `GHSA-7pqw-9j4j-h8q3` | High | Fixed | Owning `@lhci/cli` path removed; no patched release exists |
| 112 | `@vitest/mocker` | `GHSA-82fw-gwwq-j7x9` | Moderate | Fixed | 4.1.11 |
| 113 | `vitest` | `GHSA-82fw-gwwq-j7x9` | Moderate | Fixed | 4.1.11 |
| 114 | `next` | `GHSA-p293-qw3h-jr36` | Critical | Fixed | Next.js 16.3.4 |
| 115 | `next` | `GHSA-2xp9-vwfh-vxw4` | Critical | Fixed | Next.js 16.3.4 |
| 116 | `js-yaml` | `GHSA-2883-xcg3-v3hh` | High | Fixed | 4.3.2 direct transitive resolution |
| 117 | `js-yaml` | `GHSA-2883-xcg3-v3hh` | High | Fixed | 5.2.3 secondary transitive resolution |
| 118 | `sharp` | `GHSA-rgj7-g3m4-5g8c` | High | Fixed | 0.35.4 through Next.js |

Installed relevant versions were confirmed with `npm ls`: Next.js 16.3.4,
Vitest and `@vitest/mocker` 4.1.11, `js-yaml` 4.3.2 and 5.2.3, and Sharp
0.35.4. `extract-zip`, `@lhci/cli`, `qs`, `ip-address`, `tmp`, `uuid`,
`mysql2`, vulnerable `fast-uri`, vulnerable `brace-expansion`, vulnerable
`nanoid`, and vulnerable `deepmerge-ts` have no installed path in the queried
dependency set.

## Residual Risk and Policy

There is no accepted residual dependency risk for 0.3.0. Both committed audit
policy files contain an empty list. Ten stale exceptions were removed after the
live npm audit proved that none matched a current vulnerability.

Future exceptions fail validation unless they identify the advisory and
package, provide a rationale, name a risk owner, link a follow-up ticket, and
expire within 90 days. An expired, malformed, or unowned exception fails the
security gate even when the current npm report is otherwise clean.

## Verification Commands

```bash
npm run audit:security
npm test -- __tests__/security-audit.test.ts __tests__/extract-zip-remediation.test.ts
npm ls extract-zip @lhci/cli --all
npm run quality
npm test
npm run build
npm run probe:synthetic -- --project=chromium
```

The first three commands are complete and green. The final four are repeated by
the clean-tree release validation and protected production workflow; their
commit-bound results are the release evidence artifact rather than a mutable
claim in this file.
