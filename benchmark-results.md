# Page Speed & Core Web Vitals Benchmark Report

**Target URL**: `http://localhost:3000`  
**Generated**: 2026-09-09T16:55:27.870Z  
**Sampling**: 1 warmup + 3 measured runs per route (Median / P95 values reported)

## Route Performance Matrix

| Route                                    | Page / Feature               | TTFB (Median) | FCP (Median) | LCP (Median) |   CLS    | DOMContentLoaded | Full Load | Budget  |
| :--------------------------------------- | :--------------------------- | :-----------: | :----------: | :----------: | :------: | :--------------: | :-------: | :-----: |
| `/`                                      | Homepage (Pretext & Bio)     |  🟢 117.2ms   |   🟢 152ms   |   🟢 152ms   | 🟢 0.000 |     139.6ms      |  139.7ms  | ✅ PASS |
| `/case-studies`                          | Case Studies Index           |   🟢 12.4ms   |   🟢 92ms    |   🟢 92ms    | 🟢 0.000 |      26.3ms      |  61.1ms   | ✅ PASS |
| `/arcade`                                | Arcade Hub                   |   🟢 95.7ms   |   🟢 112ms   |   🟢 112ms   | 🟢 0.000 |     103.5ms      |  104.2ms  | ✅ PASS |
| `/proof`                                 | Formal Proof Studio          |   🟢 8.7ms    |   🟢 56ms    |   🟢 56ms    | 🟢 0.000 |       14ms       |  27.8ms   | ✅ PASS |
| `/neuro`                                 | Neuro 3D Simulator           |  🟢 104.2ms   |   🟢 116ms   |   🟢 116ms   | 🟢 0.000 |      110ms       |  110.2ms  | ✅ PASS |
| `/crf`                                   | CRF Builder & AST            |   🟢 5.5ms    |   🟢 56ms    |   🟢 56ms    | 🟢 0.000 |       23ms       |  33.6ms   | ✅ PASS |
| `/simulator`                             | System Dynamics Simulator    |    🟢 18ms    |   🟢 44ms    |   🟢 44ms    | 🟢 0.000 |      23.3ms      |   41ms    | ✅ PASS |
| `/schedule`                              | Schedule / Calendar          |   🟢 99.1ms   |   🟢 112ms   |   🟢 112ms   | 🟢 0.000 |     106.6ms      |  106.8ms  | ✅ PASS |
| `/offline`                               | Offline Fallback View        |   🟢 3.3ms    |   🟢 48ms    |   🟢 48ms    | 🟢 0.000 |      8.9ms       |   19ms    | ✅ PASS |
| `/case-studies/clinical-data-mapper`     | CS: Clinical Data Mapper     |   🟢 99.7ms   |   🟢 124ms   |   🟢 124ms   | 🟢 0.000 |     108.3ms      |  108.4ms  | ✅ PASS |
| `/case-studies/cadence-clinical`         | CS: Cadence Clinical         |   🟢 10.2ms   |   🟢 52ms    |   🟢 52ms    | 🟢 0.000 |      16.3ms      |  39.8ms   | ✅ PASS |
| `/case-studies/schemaflow`               | CS: SchemaFlow               |   🟢 5.8ms    |   🟢 44ms    |   🟢 44ms    | 🟢 0.000 |      11.4ms      |  33.6ms   | ✅ PASS |
| `/case-studies/imednet-python-sdk`       | CS: iMedNet SDK              |   🟢 84.5ms   |   🟢 100ms   |   🟢 100ms   | 🟢 0.000 |      96.7ms      |  112.8ms  | ✅ PASS |
| `/case-studies/wedding-website`          | CS: Wedding Platform         |   🟢 9.2ms    |   🟢 48ms    |   🟢 48ms    | 🟢 0.000 |      15.1ms      |   34ms    | ✅ PASS |
| `/case-studies/hono-kiln`                | CS: Hono-Kiln Runtime        |   🟢 95.9ms   |   🟢 128ms   |   🟢 128ms   | 🟢 0.000 |     118.8ms      |  118.9ms  | ✅ PASS |
| `/case-studies/inbody-qr-decoder`        | CS: InBody QR Decoder        |  🟢 111.9ms   |   🟢 188ms   |   🟢 188ms   | 🟢 0.000 |     181.3ms      |  181.3ms  | ✅ PASS |
| `/case-studies/oxidizemath`              | CS: OxidizeMath              |    🟢 48ms    |   🟢 108ms   |   🟢 108ms   | 🟢 0.000 |      58.3ms      |  108.4ms  | ✅ PASS |
| `/case-studies/ualbf`                    | CS: UALBF Engine             |   🟢 8.7ms    |   🟢 48ms    |   🟢 48ms    | 🟢 0.000 |      14.4ms      |  38.3ms   | ✅ PASS |
| `/case-studies/laser-loon`               | CS: Laser Loon               |    🟢 93ms    |   🟢 112ms   |   🟢 112ms   | 🟢 0.000 |      99.8ms      |  117.8ms  | ✅ PASS |
| `/work/laser-loon`                       | CS: Laser Loon Work Route    |  🟢 101.3ms   |   🟢 120ms   |   🟢 120ms   | 🟢 0.000 |     106.6ms      |  106.7ms  | ✅ PASS |
| `/case-studies/sonos-network-controller` | CS: Sonos Network Controller |  🟢 109.2ms   |   🟢 128ms   |   🟢 128ms   | 🟢 0.000 |     118.4ms      |  118.6ms  | ✅ PASS |
| `/case-studies/clintrials`               | CS: clintrials WASM Engine   |   🟢 3.8ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      9.3ms       |  30.4ms   | ✅ PASS |
| `/case-studies/equipose-randomization`   | CS: Equipose Randomization   |  🟢 102.7ms   |   🟢 160ms   |   🟢 160ms   | 🟢 0.000 |     155.4ms      |  155.4ms  | ✅ PASS |
| `/case-studies/lambda-wave`              | CS: Lambda-Wave Radar        |   🟢 29.1ms   |   🟢 80ms    |   🟢 80ms    | 🟢 0.000 |      72.7ms      |  104.2ms  | ✅ PASS |
| `/case-studies/duckdeploy`               | CS: DuckDeploy Dynamic UI    |   🟢 4.4ms    |   🟢 40ms    |   🟢 40ms    | 🟢 0.000 |       15ms       |  17.4ms   | ✅ PASS |
| `/case-studies/cardiac-risk-modeling`    | CS: Cardiac Risk Modeling    |  🟢 101.9ms   |   🟢 120ms   |   🟢 120ms   | 🟢 0.000 |     110.5ms      |  110.6ms  | ✅ PASS |
| `/case-studies/4glory`                   | CS: 4Glory Sports Analytics  |   🟢 28.7ms   |   🟢 72ms    |   🟢 72ms    | 🟢 0.000 |      40.2ms      |  42.7ms   | ✅ PASS |
| `/case-studies/crf-xl`                   | CS: CRF.xl CDISC Compiler    |   🟢 98.6ms   |   🟢 116ms   |   🟢 116ms   | 🟢 0.000 |     107.7ms      |  107.9ms  | ✅ PASS |
| `/case-studies/promptops`                | CS: PromptOps LLM Framework  |   🟢 3.7ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |       9ms        |  24.6ms   | ✅ PASS |
| `/arcade/working-with-duck`              | Game: Duck Canvas Engine     |   🟢 100ms    |   🟢 120ms   |   🟢 120ms   | 🟢 0.000 |     105.8ms      |  106.1ms  | ✅ PASS |
| `/arcade/laser-loon`                     | Game: Laser Loon             |   🟢 3.8ms    |   🟢 40ms    |   🟢 40ms    | 🟢 0.000 |      8.3ms       |  18.5ms   | ✅ PASS |
| `/arcade/quasi-puzzler`                  | Game: Quasi Puzzler          |  🟢 102.1ms   |   🟢 116ms   |   🟢 116ms   | 🟢 0.000 |     107.6ms      |  107.6ms  | ✅ PASS |
| `/arcade/garmin-watch`                   | Game: Garmin Watch           |   🟢 4.3ms    |   🟢 44ms    |   🟢 44ms    | 🟢 0.000 |      12.8ms      |  19.7ms   | ✅ PASS |
| `/arcade/clinical-chaos`                 | Game: Clinical Chaos         |   🟢 4.1ms    |   🟢 40ms    |   🟢 40ms    | 🟢 0.000 |      10.5ms      |  32.2ms   | ✅ PASS |
| `/arcade/retro-labyrinth`                | Game: Retro Labyrinth        |  🟢 107.1ms   |   🟢 128ms   |   🟢 128ms   | 🟢 0.000 |     120.6ms      |  120.8ms  | ✅ PASS |
| `/arcade/meme-vault`                     | Game: Secret Meme Vault      |   🟢 4.9ms    |   🟢 52ms    |   🟢 52ms    | 🟢 0.000 |      11.3ms      |  37.2ms   | ✅ PASS |

## Aggregate Metrics

- **Total Routes Tested**: 36
- **Routes Passing Budget**: 36 / 36 (100%)
- **Fleet Average TTFB**: 54ms
- **Fleet Average LCP**: 88ms
- **Fleet Average Load Duration**: 78ms

## Core Web Vitals Thresholds (Google Web Vitals)

| Metric   | Good (🟢) | Needs Improvement (🟡) | Poor (🔴) |
| :------- | :-------: | :--------------------: | :-------: |
| **TTFB** |  ≤ 800ms  |     800ms - 1800ms     | > 1800ms  |
| **FCP**  | ≤ 1800ms  |    1800ms - 3000ms     | > 3000ms  |
| **LCP**  | ≤ 2500ms  |    2500ms - 4000ms     | > 4000ms  |
| **CLS**  |  ≤ 0.100  |     0.100 - 0.250      |  > 0.250  |
