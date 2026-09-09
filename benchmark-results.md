# Page Speed & Core Web Vitals Benchmark Report

**Target URL**: `http://localhost:3000`  
**Generated**: 2026-09-08T21:49:53.203Z  
**Sampling**: 1 warmup + 3 measured runs per route (Median / P95 values reported)

## Route Performance Matrix

| Route                                    | Page / Feature               | TTFB (Median) | FCP (Median) | LCP (Median) |   CLS    | DOMContentLoaded | Full Load | Budget  |
| :--------------------------------------- | :--------------------------- | :-----------: | :----------: | :----------: | :------: | :--------------: | :-------: | :-----: |
| `/`                                      | Homepage (Pretext & Bio)     |   🟢 92.5ms   |   🟢 124ms   |   🟢 124ms   | 🟢 0.000 |     111.7ms      |  111.9ms  | ✅ PASS |
| `/case-studies`                          | Case Studies Index           |  🟢 106.7ms   |   🟢 124ms   |   🟢 124ms   | 🟢 0.000 |     116.8ms      |  146.5ms  | ✅ PASS |
| `/arcade`                                | Arcade Hub                   |   🟢 5.4ms    |   🟢 64ms    |   🟢 64ms    | 🟢 0.000 |      10.6ms      |  33.6ms   | ✅ PASS |
| `/proof`                                 | Formal Proof Studio          |   🟢 3.7ms    |   🟢 44ms    |   🟢 44ms    | 🟢 0.000 |      8.8ms       |  31.2ms   | ✅ PASS |
| `/neuro`                                 | Neuro 3D Simulator           |  🟢 112.6ms   |   🟢 132ms   |   🟢 132ms   | 🟢 0.000 |     119.4ms      |  119.5ms  | ✅ PASS |
| `/crf`                                   | CRF Builder & AST            |   🟢 4.2ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      8.7ms       |  27.6ms   | ✅ PASS |
| `/simulator`                             | System Dynamics Simulator    |   🟢 98.5ms   |   🟢 124ms   |   🟢 124ms   | 🟢 0.000 |     115.7ms      |  115.8ms  | ✅ PASS |
| `/schedule`                              | Schedule / Calendar          |   🟢 3.3ms    |   🟢 52ms    |   🟢 52ms    | 🟢 0.000 |      8.3ms       |  31.1ms   | ✅ PASS |
| `/offline`                               | Offline Fallback View        |   🟢 3.4ms    |   🟢 44ms    |   🟢 44ms    | 🟢 0.000 |       8ms        |   29ms    | ✅ PASS |
| `/case-studies/clinical-data-mapper`     | CS: Clinical Data Mapper     |   🟢 11.3ms   |   🟢 80ms    |   🟢 80ms    | 🟢 0.000 |      31.1ms      |  102.7ms  | ✅ PASS |
| `/case-studies/cadence-clinical`         | CS: Cadence Clinical         |   🟢 4.3ms    |   🟢 48ms    |   🟢 48ms    | 🟢 0.000 |      10.2ms      |   55ms    | ✅ PASS |
| `/case-studies/schemaflow`               | CS: SchemaFlow               |   🟢 95.6ms   |   🟢 116ms   |   🟢 116ms   | 🟢 0.000 |     105.9ms      |  113.7ms  | ✅ PASS |
| `/case-studies/imednet-python-sdk`       | CS: iMedNet SDK              |  🟢 112.5ms   |   🟢 144ms   |   🟢 144ms   | 🟢 0.000 |     137.4ms      |  137.4ms  | ✅ PASS |
| `/case-studies/wedding-website`          | CS: Wedding Platform         |   🟢 3.9ms    |   🟢 40ms    |   🟢 40ms    | 🟢 0.000 |      9.7ms       |  53.7ms   | ✅ PASS |
| `/case-studies/hono-kiln`                | CS: Hono-Kiln Runtime        |  🟢 101.2ms   |   🟢 796ms   |   🟢 796ms   | 🟢 0.000 |     791.3ms      |  791.3ms  | ✅ PASS |
| `/case-studies/inbody-qr-decoder`        | CS: InBody QR Decoder        |   🟢 15.7ms   |   🟢 84ms    |   🟢 84ms    | 🟢 0.000 |       76ms       |  118.6ms  | ✅ PASS |
| `/case-studies/oxidizemath`              | CS: OxidizeMath              |   🟢 3.6ms    |   🟢 44ms    |   🟢 44ms    | 🟢 0.000 |      9.3ms       |  49.3ms   | ✅ PASS |
| `/case-studies/ualbf`                    | CS: UALBF Engine             |  🟢 102.8ms   |   🟢 124ms   |   🟢 124ms   | 🟢 0.000 |     109.8ms      |  113.8ms  | ✅ PASS |
| `/case-studies/laser-loon`               | CS: Laser Loon               |   🟢 91.5ms   |   🟢 152ms   |   🟢 152ms   | 🟢 0.000 |     146.8ms      |  146.8ms  | ✅ PASS |
| `/work/laser-loon`                       | CS: Laser Loon Work Route    |   🟢 85.5ms   |   🟢 104ms   |   🟢 104ms   | 🟢 0.000 |      91.4ms      |  113.4ms  | ✅ PASS |
| `/case-studies/sonos-network-controller` | CS: Sonos Network Controller |   🟢 7.9ms    |   🟢 80ms    |   🟢 80ms    | 🟢 0.000 |       30ms       |  104.4ms  | ✅ PASS |
| `/case-studies/clintrials`               | CS: clintrials WASM Engine   |   🟢 3.9ms    |   🟢 40ms    |   🟢 40ms    | 🟢 0.000 |      9.7ms       |  44.4ms   | ✅ PASS |
| `/case-studies/equipose-randomization`   | CS: Equipose Randomization   |  🟢 100.9ms   |   🟢 116ms   |   🟢 116ms   | 🟢 0.000 |     109.1ms      |  118.6ms  | ✅ PASS |
| `/case-studies/lambda-wave`              | CS: Lambda-Wave Radar        |  🟢 101.5ms   |   🟢 516ms   |   🟢 516ms   | 🟢 0.000 |     510.2ms      |  510.2ms  | ✅ PASS |
| `/case-studies/duckdeploy`               | CS: DuckDeploy Dynamic UI    |   🟢 6.3ms    |   🟢 56ms    |   🟢 56ms    | 🟢 0.000 |      38.3ms      |  63.8ms   | ✅ PASS |
| `/case-studies/cardiac-risk-modeling`    | CS: Cardiac Risk Modeling    |   🟢 4.1ms    |   🟢 36ms    |   🟢 36ms    | 🟢 0.000 |      15.3ms      |  52.6ms   | ✅ PASS |
| `/case-studies/4glory`                   | CS: 4Glory Sports Analytics  |   🟢 15.3ms   |   🟢 120ms   |   🟢 120ms   | 🟢 0.000 |      62.5ms      |  109.8ms  | ✅ PASS |
| `/case-studies/crf-xl`                   | CS: CRF.xl CDISC Compiler    |   🟢 7.2ms    |   🟢 48ms    |   🟢 48ms    | 🟢 0.000 |       19ms       |   83ms    | ✅ PASS |
| `/case-studies/promptops`                | CS: PromptOps LLM Framework  |  🟢 101.5ms   |   🟢 124ms   |   🟢 124ms   | 🟢 0.000 |     113.1ms      |  132.7ms  | ✅ PASS |
| `/arcade/working-with-duck`              | Game: Duck Canvas Engine     |   🟢 98.3ms   |   🟢 116ms   |   🟢 116ms   | 🟢 0.000 |     108.1ms      |  108.4ms  | ✅ PASS |
| `/arcade/laser-loon`                     | Game: Laser Loon             |   🟢 2.9ms    |   🟢 36ms    |   🟢 36ms    | 🟢 0.000 |      7.6ms       |  29.2ms   | ✅ PASS |
| `/arcade/quasi-puzzler`                  | Game: Quasi Puzzler          |    🟢 96ms    |   🟢 116ms   |   🟢 116ms   | 🟢 0.000 |     105.9ms      |  106.1ms  | ✅ PASS |
| `/arcade/garmin-watch`                   | Game: Garmin Watch           |   🟢 3.3ms    |   🟢 40ms    |   🟢 40ms    | 🟢 0.000 |      8.6ms       |  29.4ms   | ✅ PASS |
| `/arcade/clinical-chaos`                 | Game: Clinical Chaos         |   🟢 3.2ms    |   🟢 40ms    |   🟢 40ms    | 🟢 0.000 |      7.8ms       |  18.2ms   | ✅ PASS |
| `/arcade/retro-labyrinth`                | Game: Retro Labyrinth        |  🟢 105.4ms   |   🟢 124ms   |   🟢 124ms   | 🟢 0.000 |     116.4ms      |  116.6ms  | ✅ PASS |
| `/arcade/meme-vault`                     | Game: Secret Meme Vault      |   🟢 3.5ms    |   🟢 48ms    |   🟢 48ms    | 🟢 0.000 |      8.7ms       |  35.4ms   | ✅ PASS |

## Aggregate Metrics

- **Total Routes Tested**: 36
- **Routes Passing Budget**: 36 / 36 (100%)
- **Fleet Average TTFB**: 48ms
- **Fleet Average LCP**: 115ms
- **Fleet Average Load Duration**: 114ms

## Core Web Vitals Thresholds (Google Web Vitals)

| Metric   | Good (🟢) | Needs Improvement (🟡) | Poor (🔴) |
| :------- | :-------: | :--------------------: | :-------: |
| **TTFB** |  ≤ 800ms  |     800ms - 1800ms     | > 1800ms  |
| **FCP**  | ≤ 1800ms  |    1800ms - 3000ms     | > 3000ms  |
| **LCP**  | ≤ 2500ms  |    2500ms - 4000ms     | > 4000ms  |
| **CLS**  |  ≤ 0.100  |     0.100 - 0.250      |  > 0.250  |
