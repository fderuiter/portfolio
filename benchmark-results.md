# Page Speed & Core Web Vitals Benchmark Report

**Target URL**: `http://localhost:3000`  
**Generated**: 2026-08-21T21:58:48.541Z  
**Sampling**: 1 warmup + 3 measured runs per route (Median / P95 values reported)

## Route Performance Matrix

| Route                                    | Page / Feature               | TTFB (Median) | FCP (Median) | LCP (Median) |   CLS    | DOMContentLoaded | Full Load | Budget  |
| :--------------------------------------- | :--------------------------- | :-----------: | :----------: | :----------: | :------: | :--------------: | :-------: | :-----: |
| `/`                                      | Homepage (Pretext & Bio)     |   🟢 2.7ms    |   🟢 52ms    |   🟢 52ms    | 🟢 0.000 |      9.4ms       |  67.1ms   | ✅ PASS |
| `/case-studies`                          | Case Studies Index           |   🟢 2.9ms    |   🟢 96ms    |   🟢 96ms    | 🟢 0.000 |      13.7ms      |  129.2ms  | ✅ PASS |
| `/arcade`                                | Arcade Hub                   |   🟢 1.7ms    |   🟢 64ms    |   🟢 64ms    | 🟢 0.000 |      6.2ms       |  37.3ms   | ✅ PASS |
| `/proof`                                 | Formal Proof Studio          |   🟢 1.5ms    |   🟢 64ms    |   🟢 64ms    | 🟢 0.000 |      6.2ms       |  42.8ms   | ✅ PASS |
| `/neuro`                                 | Neuro 3D Simulator           |   🟢 2.1ms    |   🟢 96ms    |   🟢 96ms    | 🟢 0.000 |      38.8ms      |  95.2ms   | ✅ PASS |
| `/crf`                                   | CRF Builder & AST            |   🟢 2.2ms    |   🟢 52ms    |   🟢 52ms    | 🟢 0.000 |      9.1ms       |  45.8ms   | ✅ PASS |
| `/simulator`                             | System Dynamics Simulator    |    🟢 2ms     |   🟢 40ms    |   🟢 40ms    | 🟢 0.000 |      7.6ms       |   32ms    | ✅ PASS |
| `/schedule`                              | Schedule / Calendar          |   🟢 2.9ms    |   🟢 60ms    |   🟢 60ms    | 🟢 0.000 |      10.9ms      |  46.6ms   | ✅ PASS |
| `/offline`                               | Offline Fallback View        |    🟢 2ms     |   🟢 48ms    |   🟢 48ms    | 🟢 0.000 |      7.6ms       |  36.7ms   | ✅ PASS |
| `/case-studies/clinical-data-mapper`     | CS: Clinical Data Mapper     |   🟢 2.6ms    |   🟢 60ms    |   🟢 60ms    | 🟢 0.000 |      10.9ms      |  48.7ms   | ✅ PASS |
| `/case-studies/cadence-clinical`         | CS: Cadence Clinical         |   🟢 3.4ms    |   🟢 44ms    |   🟢 44ms    | 🟢 0.000 |      11.2ms      |  47.5ms   | ✅ PASS |
| `/case-studies/schemaflow`               | CS: SchemaFlow               |   🟢 2.6ms    |   🟢 52ms    |   🟢 52ms    | 🟢 0.000 |      10.4ms      |  49.5ms   | ✅ PASS |
| `/case-studies/imednet-python-sdk`       | CS: iMedNet SDK              |   🟢 2.6ms    |   🟢 44ms    |   🟢 44ms    | 🟢 0.000 |      10.7ms      |  47.7ms   | ✅ PASS |
| `/case-studies/wedding-website`          | CS: Wedding Platform         |   🟢 2.8ms    |   🟢 52ms    |   🟢 52ms    | 🟢 0.000 |      11.1ms      |  49.9ms   | ✅ PASS |
| `/case-studies/hono-kiln`                | CS: Hono-Kiln Runtime        |   🟢 3.3ms    |   🟢 60ms    |   🟢 60ms    | 🟢 0.000 |      11.7ms      |  48.8ms   | ✅ PASS |
| `/case-studies/inbody-qr-decoder`        | CS: InBody QR Decoder        |   🟢 2.6ms    |   🟢 60ms    |   🟢 60ms    | 🟢 0.000 |      10.3ms      |  51.2ms   | ✅ PASS |
| `/case-studies/oxidizemath`              | CS: OxidizeMath              |   🟢 4.1ms    |   🟢 48ms    |   🟢 48ms    | 🟢 0.000 |      10.5ms      |  47.8ms   | ✅ PASS |
| `/case-studies/ualbf`                    | CS: UALBF Engine             |   🟢 2.3ms    |   🟢 56ms    |   🟢 56ms    | 🟢 0.000 |      9.5ms       |  47.6ms   | ✅ PASS |
| `/case-studies/laser-loon`               | CS: Laser Loon               |   🟢 2.5ms    |   🟢 56ms    |   🟢 56ms    | 🟢 0.000 |      10.7ms      |  50.1ms   | ✅ PASS |
| `/work/laser-loon`                       | CS: Laser Loon Work Route    |   🟢 2.3ms    |   🟢 52ms    |   🟢 52ms    | 🟢 0.000 |       10ms       |  51.9ms   | ✅ PASS |
| `/case-studies/sonos-network-controller` | CS: Sonos Network Controller |   🟢 3.1ms    |   🟢 56ms    |   🟢 56ms    | 🟢 0.000 |       11ms       |   54ms    | ✅ PASS |
| `/case-studies/clintrials`               | CS: clintrials WASM Engine   |   🟢 2.9ms    |   🟢 60ms    |   🟢 60ms    | 🟢 0.000 |      11.3ms      |  51.8ms   | ✅ PASS |
| `/case-studies/equipose-randomization`   | CS: Equipose Randomization   |    🟢 2ms     |   🟢 48ms    |   🟢 48ms    | 🟢 0.000 |      9.2ms       |  45.7ms   | ✅ PASS |
| `/case-studies/lambda-wave`              | CS: Lambda-Wave Radar        |   🟢 1.9ms    |   🟢 40ms    |   🟢 40ms    | 🟢 0.000 |       8ms        |  42.6ms   | ✅ PASS |
| `/case-studies/duckdeploy`               | CS: DuckDeploy Dynamic UI    |   🟢 1.7ms    |   🟢 56ms    |   🟢 56ms    | 🟢 0.000 |      7.8ms       |  43.2ms   | ✅ PASS |
| `/case-studies/cardiac-risk-modeling`    | CS: Cardiac Risk Modeling    |   🟢 1.8ms    |   🟢 60ms    |   🟢 60ms    | 🟢 0.000 |      9.2ms       |  49.4ms   | ✅ PASS |
| `/case-studies/4glory`                   | CS: 4Glory Sports Analytics  |    🟢 3ms     |   🟢 56ms    |   🟢 56ms    | 🟢 0.000 |      12.3ms      |  49.9ms   | ✅ PASS |
| `/case-studies/crf-xl`                   | CS: CRF.xl CDISC Compiler    |   🟢 2.7ms    |   🟢 52ms    |   🟢 52ms    | 🟢 0.000 |      11.4ms      |  50.3ms   | ✅ PASS |
| `/case-studies/promptops`                | CS: PromptOps LLM Framework  |   🟢 2.8ms    |   🟢 60ms    |   🟢 60ms    | 🟢 0.000 |      11.5ms      |  52.6ms   | ✅ PASS |
| `/arcade/working-with-duck`              | Game: Duck Canvas Engine     |   🟢 3.1ms    |   🟢 52ms    |   🟢 52ms    | 🟢 0.000 |      11.5ms      |  46.5ms   | ✅ PASS |
| `/arcade/laser-loon`                     | Game: Laser Loon             |   🟢 2.2ms    |   🟢 56ms    |   🟢 56ms    | 🟢 0.000 |      9.9ms       |  41.8ms   | ✅ PASS |
| `/arcade/quasi-puzzler`                  | Game: Quasi Puzzler          |   🟢 2.7ms    |   🟢 56ms    |   🟢 56ms    | 🟢 0.000 |       10ms       |  40.8ms   | ✅ PASS |
| `/arcade/garmin-watch`                   | Game: Garmin Watch           |   🟢 2.7ms    |   🟢 52ms    |   🟢 52ms    | 🟢 0.000 |      10.1ms      |   42ms    | ✅ PASS |
| `/arcade/clinical-chaos`                 | Game: Clinical Chaos         |   🟢 2.7ms    |   🟢 44ms    |   🟢 44ms    | 🟢 0.000 |      10.3ms      |  40.9ms   | ✅ PASS |
| `/arcade/retro-labyrinth`                | Game: Retro Labyrinth        |   🟢 2.8ms    |   🟢 60ms    |   🟢 60ms    | 🟢 0.000 |      10.3ms      |  43.2ms   | ✅ PASS |
| `/arcade/meme-vault`                     | Game: Secret Meme Vault      |   🟢 2.7ms    |   🟢 68ms    |   🟢 68ms    | 🟢 0.000 |      10.3ms      |  46.6ms   | ✅ PASS |

## Aggregate Metrics

- **Total Routes Tested**: 36
- **Routes Passing Budget**: 36 / 36 (100%)
- **Fleet Average TTFB**: 3ms
- **Fleet Average LCP**: 56ms
- **Fleet Average Load Duration**: 50ms

## Core Web Vitals Thresholds (Google Web Vitals)

| Metric   | Good (🟢) | Needs Improvement (🟡) | Poor (🔴) |
| :------- | :-------: | :--------------------: | :-------: |
| **TTFB** |  ≤ 800ms  |     800ms - 1800ms     | > 1800ms  |
| **FCP**  | ≤ 1800ms  |    1800ms - 3000ms     | > 3000ms  |
| **LCP**  | ≤ 2500ms  |    2500ms - 4000ms     | > 4000ms  |
| **CLS**  |  ≤ 0.100  |     0.100 - 0.250      |  > 0.250  |
