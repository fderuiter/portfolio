# Page Speed & Core Web Vitals Benchmark Report

**Target URL**: `http://localhost:3000`  
**Generated**: 2026-08-25T04:00:19.351Z  
**Sampling**: 1 warmup + 3 measured runs per route (Median / P95 values reported)

## Route Performance Matrix

| Route                                    | Page / Feature               | TTFB (Median) | FCP (Median) | LCP (Median) |   CLS    | DOMContentLoaded | Full Load | Budget  |
| :--------------------------------------- | :--------------------------- | :-----------: | :----------: | :----------: | :------: | :--------------: | :-------: | :-----: |
| `/`                                      | Homepage (Pretext & Bio)     |   🟢 59.7ms   |   🟢 116ms   |   🟢 116ms   | 🟢 0.000 |     106.4ms      |  108.2ms  | ✅ PASS |
| `/case-studies`                          | Case Studies Index           |   🟢 59.5ms   |   🟢 936ms   |   🟢 936ms   | 🟢 0.000 |     932.8ms      |  933.5ms  | ✅ PASS |
| `/arcade`                                | Arcade Hub                   |   🟢 29.4ms   |   🟢 440ms   |   🟢 440ms   | 🟢 0.000 |     279.4ms      |  285.1ms  | ✅ PASS |
| `/proof`                                 | Formal Proof Studio          |   🟢 58.6ms   |   🟢 112ms   |   🟢 112ms   | 🟢 0.000 |      89.1ms      |  98.4ms   | ✅ PASS |
| `/neuro`                                 | Neuro 3D Simulator           |   🟢 75.1ms   |   🟢 412ms   |   🟢 412ms   | 🟢 0.000 |     283.2ms      |  298.9ms  | ✅ PASS |
| `/crf`                                   | CRF Builder & AST            |  🟢 115.9ms   |   🟢 284ms   |   🟢 284ms   | 🟢 0.000 |     177.1ms      |  372.4ms  | ✅ PASS |
| `/simulator`                             | System Dynamics Simulator    |   🟢 56.4ms   |   🟢 112ms   |   🟢 112ms   | 🟢 0.000 |       94ms       |  94.6ms   | ✅ PASS |
| `/schedule`                              | Schedule / Calendar          |   🟢 63.2ms   |   🟢 280ms   |   🟢 280ms   | 🟢 0.000 |     125.1ms      |  228.3ms  | ✅ PASS |
| `/offline`                               | Offline Fallback View        |   🟢 69.6ms   |   🟢 424ms   |   🟢 424ms   | 🟢 0.000 |     153.6ms      |  327.7ms  | ✅ PASS |
| `/case-studies/clinical-data-mapper`     | CS: Clinical Data Mapper     |   🟢 55.8ms   |   🟢 116ms   |   🟢 116ms   | 🟢 0.000 |     100.1ms      |  100.7ms  | ✅ PASS |
| `/case-studies/cadence-clinical`         | CS: Cadence Clinical         |   🟢 61.8ms   |   🟢 120ms   |   🟢 120ms   | 🟢 0.000 |     109.3ms      |   111ms   | ✅ PASS |
| `/case-studies/schemaflow`               | CS: SchemaFlow               |   🟢 88.7ms   |   🟢 372ms   |   🟢 372ms   | 🟢 0.000 |     343.2ms      |  343.4ms  | ✅ PASS |
| `/case-studies/imednet-python-sdk`       | CS: iMedNet SDK              |    🟢 60ms    |   🟢 308ms   |   🟢 308ms   | 🟢 0.000 |     110.5ms      |  321.9ms  | ✅ PASS |
| `/case-studies/wedding-website`          | CS: Wedding Platform         |   🟢 65.8ms   |   🟢 180ms   |   🟢 180ms   | 🟢 0.000 |     168.5ms      |  169.1ms  | ✅ PASS |
| `/case-studies/hono-kiln`                | CS: Hono-Kiln Runtime        |    🟢 71ms    |   🟢 320ms   |   🟢 320ms   | 🟢 0.000 |     252.1ms      |  291.2ms  | ✅ PASS |
| `/case-studies/inbody-qr-decoder`        | CS: InBody QR Decoder        |   🟢 53.5ms   |   🟢 304ms   |   🟢 304ms   | 🟢 0.000 |     118.6ms      |  185.6ms  | ✅ PASS |
| `/case-studies/oxidizemath`              | CS: OxidizeMath              |   🟢 66.3ms   |   🟢 120ms   |   🟢 120ms   | 🟢 0.000 |     110.4ms      |  111.9ms  | ✅ PASS |
| `/case-studies/ualbf`                    | CS: UALBF Engine             |  🟢 100.1ms   |   🟢 348ms   |   🟢 348ms   | 🟢 0.000 |     273.7ms      |  274.1ms  | ✅ PASS |
| `/case-studies/laser-loon`               | CS: Laser Loon               |   🟢 55.2ms   |   🟢 276ms   |   🟢 276ms   | 🟢 0.000 |     179.8ms      |  201.7ms  | ✅ PASS |
| `/work/laser-loon`                       | CS: Laser Loon Work Route    |   🟢 58.7ms   |   🟢 116ms   |   🟢 116ms   | 🟢 0.000 |     102.5ms      |  103.6ms  | ✅ PASS |
| `/case-studies/sonos-network-controller` | CS: Sonos Network Controller |   🟢 58.2ms   |   🟢 120ms   |   🟢 120ms   | 🟢 0.000 |     102.9ms      |  103.4ms  | ✅ PASS |
| `/case-studies/clintrials`               | CS: clintrials WASM Engine   |   🟢 62.1ms   |   🟢 212ms   |   🟢 212ms   | 🟢 0.000 |     180.3ms      |  180.5ms  | ✅ PASS |
| `/case-studies/equipose-randomization`   | CS: Equipose Randomization   |  🟢 135.9ms   |   🟢 344ms   |   🟢 344ms   | 🟢 0.000 |     189.8ms      |  300.9ms  | ✅ PASS |
| `/case-studies/lambda-wave`              | CS: Lambda-Wave Radar        |   🟢 57.5ms   |   🟢 104ms   |   🟢 104ms   | 🟢 0.000 |      95.3ms      |  95.8ms   | ✅ PASS |
| `/case-studies/duckdeploy`               | CS: DuckDeploy Dynamic UI    |   🟢 61.8ms   |   🟢 252ms   |   🟢 252ms   | 🟢 0.000 |     236.4ms      |  236.4ms  | ✅ PASS |
| `/case-studies/cardiac-risk-modeling`    | CS: Cardiac Risk Modeling    |   🟢 71.8ms   |   🟢 324ms   |   🟢 324ms   | 🟢 0.000 |     261.2ms      |  279.3ms  | ✅ PASS |
| `/case-studies/4glory`                   | CS: 4Glory Sports Analytics  |   🟢 59.2ms   |   🟢 112ms   |   🟢 112ms   | 🟢 0.000 |      97.2ms      |  97.7ms   | ✅ PASS |
| `/case-studies/crf-xl`                   | CS: CRF.xl CDISC Compiler    |   🟢 68.2ms   |   🟢 264ms   |   🟢 264ms   | 🟢 0.000 |     201.4ms      |  201.5ms  | ✅ PASS |
| `/case-studies/promptops`                | CS: PromptOps LLM Framework  |   🟢 66.7ms   |   🟢 288ms   |   🟢 288ms   | 🟢 0.000 |     240.2ms      |  298.1ms  | ✅ PASS |
| `/arcade/working-with-duck`              | Game: Duck Canvas Engine     |   🟢 64.8ms   |   🟢 112ms   |   🟢 112ms   | 🟢 0.000 |     105.7ms      |  106.3ms  | ✅ PASS |
| `/arcade/laser-loon`                     | Game: Laser Loon             |   🟢 70.3ms   |   🟢 284ms   |   🟢 284ms   | 🟢 0.000 |     248.4ms      |  249.1ms  | ✅ PASS |
| `/arcade/quasi-puzzler`                  | Game: Quasi Puzzler          |   🟢 53.3ms   |   🟢 260ms   |   🟢 260ms   | 🟢 0.000 |     123.9ms      |  216.9ms  | ✅ PASS |
| `/arcade/garmin-watch`                   | Game: Garmin Watch           |   🟢 59.7ms   |   🟢 128ms   |   🟢 128ms   | 🟢 0.000 |     110.7ms      |  111.9ms  | ✅ PASS |
| `/arcade/clinical-chaos`                 | Game: Clinical Chaos         |  🟢 146.3ms   |   🟢 440ms   |   🟢 440ms   | 🟢 0.000 |     281.4ms      |  427.1ms  | ✅ PASS |
| `/arcade/retro-labyrinth`                | Game: Retro Labyrinth        |   🟢 52.1ms   |   🟢 244ms   |   🟢 244ms   | 🟢 0.000 |     103.8ms      |  188.2ms  | ✅ PASS |
| `/arcade/meme-vault`                     | Game: Secret Meme Vault      |   🟢 61.4ms   |   🟢 128ms   |   🟢 128ms   | 🟢 0.000 |     115.8ms      |  116.6ms  | ✅ PASS |

## Aggregate Metrics

- **Total Routes Tested**: 36
- **Routes Passing Budget**: 36 / 36 (100%)
- **Fleet Average TTFB**: 69ms
- **Fleet Average LCP**: 259ms
- **Fleet Average Load Duration**: 227ms

## Core Web Vitals Thresholds (Google Web Vitals)

| Metric   | Good (🟢) | Needs Improvement (🟡) | Poor (🔴) |
| :------- | :-------: | :--------------------: | :-------: |
| **TTFB** |  ≤ 800ms  |     800ms - 1800ms     | > 1800ms  |
| **FCP**  | ≤ 1800ms  |    1800ms - 3000ms     | > 3000ms  |
| **LCP**  | ≤ 2500ms  |    2500ms - 4000ms     | > 4000ms  |
| **CLS**  |  ≤ 0.100  |     0.100 - 0.250      |  > 0.250  |
