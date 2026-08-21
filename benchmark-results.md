# Page Speed & Core Web Vitals Benchmark Report

**Target URL**: `http://localhost:3000`  
**Generated**: 2026-08-21T21:19:55.585Z  
**Sampling**: 1 warmup + 3 measured runs per route (Median / P95 values reported)

## Route Performance Matrix

| Route                                    | Page / Feature               | TTFB (Median) | FCP (Median) | LCP (Median) |   CLS    | DOMContentLoaded | Full Load | Budget  |
| :--------------------------------------- | :--------------------------- | :-----------: | :----------: | :----------: | :------: | :--------------: | :-------: | :-----: |
| `/`                                      | Homepage (Pretext & Bio)     |   🟢 3.9ms    |   🟢 80ms    |   🟢 80ms    | 🟢 0.000 |      13.8ms      |   91ms    | ✅ PASS |
| `/case-studies`                          | Case Studies Index           |   🟢 7.7ms    |   🟢 132ms   |   🟢 132ms   | 🟢 0.000 |      23.3ms      |  232.4ms  | ✅ PASS |
| `/arcade`                                | Arcade Hub                   |   🟢 4.1ms    |   🟢 84ms    |   🟢 84ms    | 🟢 0.000 |      11.4ms      |  61.2ms   | ✅ PASS |
| `/proof`                                 | Formal Proof Studio          |   🟢 3.4ms    |   🟢 72ms    |   🟢 72ms    | 🟢 0.000 |      10.9ms      |  58.1ms   | ✅ PASS |
| `/neuro`                                 | Neuro 3D Simulator           |    🟢 4ms     |   🟢 84ms    |   🟢 84ms    | 🟢 0.000 |      28.4ms      |   171ms   | ✅ PASS |
| `/crf`                                   | CRF Builder & AST            |   🟢 2.5ms    |   🟢 8.8ms   |   🟢 8.8ms   | 🟢 0.000 |      8.8ms       |  37.2ms   | ✅ PASS |
| `/simulator`                             | System Dynamics Simulator    |   🟢 76.3ms   |   🟢 140ms   |   🟢 140ms   | 🟢 0.000 |      84.5ms      |  285.4ms  | ✅ PASS |
| `/schedule`                              | Schedule / Calendar          |   🟢 3.2ms    |   🟢 80ms    |   🟢 80ms    | 🟢 0.000 |      11.3ms      |  56.3ms   | ✅ PASS |
| `/offline`                               | Offline Fallback View        |   🟢 54.8ms   |   🟢 128ms   |   🟢 128ms   | 🟢 0.000 |      72.5ms      |  140.7ms  | ✅ PASS |
| `/case-studies/clinical-data-mapper`     | CS: Clinical Data Mapper     |   🟢 14.1ms   |   🟢 80ms    |   🟢 80ms    | 🟢 0.000 |      22.3ms      |  91.3ms   | ✅ PASS |
| `/case-studies/cadence-clinical`         | CS: Cadence Clinical         |   🟢 3.9ms    |   🟢 68ms    |   🟢 68ms    | 🟢 0.000 |      11.6ms      |  64.2ms   | ✅ PASS |
| `/case-studies/schemaflow`               | CS: SchemaFlow               |   🟢 3.6ms    |   🟢 60ms    |   🟢 60ms    | 🟢 0.000 |       12ms       |  66.5ms   | ✅ PASS |
| `/case-studies/imednet-python-sdk`       | CS: iMedNet SDK              |   🟢 3.8ms    |   🟢 72ms    |   🟢 72ms    | 🟢 0.000 |      13.5ms      |  63.7ms   | ✅ PASS |
| `/case-studies/wedding-website`          | CS: Wedding Platform         |   🟢 3.6ms    |   🟢 64ms    |   🟢 64ms    | 🟢 0.000 |      11.3ms      |  66.3ms   | ✅ PASS |
| `/case-studies/hono-kiln`                | CS: Hono-Kiln Runtime        |   🟢 4.3ms    |   🟢 56ms    |   🟢 56ms    | 🟢 0.000 |      12.4ms      |  59.9ms   | ✅ PASS |
| `/case-studies/inbody-qr-decoder`        | CS: InBody QR Decoder        |   🟢 3.7ms    |   🟢 56ms    |   🟢 56ms    | 🟢 0.000 |      11.2ms      |  61.1ms   | ✅ PASS |
| `/case-studies/oxidizemath`              | CS: OxidizeMath              |   🟢 3.9ms    |   🟢 72ms    |   🟢 72ms    | 🟢 0.000 |      11.5ms      |  66.6ms   | ✅ PASS |
| `/case-studies/ualbf`                    | CS: UALBF Engine             |   🟢 6.6ms    |   🟢 60ms    |   🟢 60ms    | 🟢 0.000 |      14.3ms      |  113.4ms  | ✅ PASS |
| `/case-studies/laser-loon`               | CS: Laser Loon               |   🟢 7.9ms    |   🟢 68ms    |   🟢 68ms    | 🟢 0.000 |      16.4ms      |  79.4ms   | ✅ PASS |
| `/work/laser-loon`                       | CS: Laser Loon Work Route    |   🟢 3.2ms    |   🟢 72ms    |   🟢 72ms    | 🟢 0.000 |      12.8ms      |   63ms    | ✅ PASS |
| `/case-studies/sonos-network-controller` | CS: Sonos Network Controller |   🟢 4.3ms    |   🟢 68ms    |   🟢 68ms    | 🟢 0.000 |      12.5ms      |  66.1ms   | ✅ PASS |
| `/case-studies/clintrials`               | CS: clintrials WASM Engine   |   🟢 4.1ms    |   🟢 64ms    |   🟢 64ms    | 🟢 0.000 |      11.6ms      |  66.8ms   | ✅ PASS |
| `/case-studies/equipose-randomization`   | CS: Equipose Randomization   |   🟢 3.8ms    |   🟢 64ms    |   🟢 64ms    | 🟢 0.000 |      11.7ms      |  67.2ms   | ✅ PASS |
| `/case-studies/lambda-wave`              | CS: Lambda-Wave Radar        |   🟢 3.6ms    |   🟢 60ms    |   🟢 60ms    | 🟢 0.000 |      11.6ms      |  62.1ms   | ✅ PASS |
| `/case-studies/duckdeploy`               | CS: DuckDeploy Dynamic UI    |   🟢 3.9ms    |   🟢 60ms    |   🟢 60ms    | 🟢 0.000 |       13ms       |  66.1ms   | ✅ PASS |
| `/case-studies/cardiac-risk-modeling`    | CS: Cardiac Risk Modeling    |   🟢 3.3ms    |   🟢 56ms    |   🟢 56ms    | 🟢 0.000 |      12.2ms      |  64.7ms   | ✅ PASS |
| `/case-studies/4glory`                   | CS: 4Glory Sports Analytics  |   🟢 3.5ms    |   🟢 68ms    |   🟢 68ms    | 🟢 0.000 |      11.7ms      |  63.7ms   | ✅ PASS |
| `/case-studies/crf-xl`                   | CS: CRF.xl CDISC Compiler    |   🟢 3.8ms    |   🟢 72ms    |   🟢 72ms    | 🟢 0.000 |       12ms       |  63.8ms   | ✅ PASS |
| `/case-studies/promptops`                | CS: PromptOps LLM Framework  |   🟢 3.2ms    |   🟢 60ms    |   🟢 60ms    | 🟢 0.000 |      11.2ms      |  65.5ms   | ✅ PASS |
| `/arcade/working-with-duck`              | Game: Duck Canvas Engine     |   🟢 3.8ms    |   🟢 56ms    |   🟢 56ms    | 🟢 0.000 |      10.5ms      |  52.2ms   | ✅ PASS |
| `/arcade/laser-loon`                     | Game: Laser Loon             |   🟢 3.6ms    |   🟢 60ms    |   🟢 60ms    | 🟢 0.000 |      10.7ms      |  50.5ms   | ✅ PASS |
| `/arcade/quasi-puzzler`                  | Game: Quasi Puzzler          |   🟢 3.4ms    |   🟢 68ms    |   🟢 68ms    | 🟢 0.000 |      11.9ms      |  57.3ms   | ✅ PASS |
| `/arcade/garmin-watch`                   | Game: Garmin Watch           |   🟢 3.5ms    |   🟢 52ms    |   🟢 52ms    | 🟢 0.000 |      10.5ms      |  55.5ms   | ✅ PASS |
| `/arcade/clinical-chaos`                 | Game: Clinical Chaos         |   🟢 3.1ms    |   🟢 52ms    |   🟢 52ms    | 🟢 0.000 |      9.4ms       |   46ms    | ✅ PASS |
| `/arcade/retro-labyrinth`                | Game: Retro Labyrinth        |   🟢 3.7ms    |   🟢 60ms    |   🟢 60ms    | 🟢 0.000 |      10.2ms      |  50.8ms   | ✅ PASS |
| `/arcade/meme-vault`                     | Game: Secret Meme Vault      |   🟢 3.8ms    |   🟢 76ms    |   🟢 76ms    | 🟢 0.000 |      11.1ms      |  63.1ms   | ✅ PASS |

## Aggregate Metrics

- **Total Routes Tested**: 36
- **Routes Passing Budget**: 36 / 36 (100%)
- **Fleet Average TTFB**: 8ms
- **Fleet Average LCP**: 70ms
- **Fleet Average Load Duration**: 80ms

## Core Web Vitals Thresholds (Google Web Vitals)

| Metric   | Good (🟢) | Needs Improvement (🟡) | Poor (🔴) |
| :------- | :-------: | :--------------------: | :-------: |
| **TTFB** |  ≤ 800ms  |     800ms - 1800ms     | > 1800ms  |
| **FCP**  | ≤ 1800ms  |    1800ms - 3000ms     | > 3000ms  |
| **LCP**  | ≤ 2500ms  |    2500ms - 4000ms     | > 4000ms  |
| **CLS**  |  ≤ 0.100  |     0.100 - 0.250      |  > 0.250  |
