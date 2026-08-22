# Page Speed & Core Web Vitals Benchmark Report

**Target URL**: `http://localhost:3000`  
**Generated**: 2026-08-22T03:45:12.986Z  
**Sampling**: 1 warmup + 3 measured runs per route (Median / P95 values reported)

## Route Performance Matrix

| Route                                    | Page / Feature               | TTFB (Median) | FCP (Median) | LCP (Median) |   CLS    | DOMContentLoaded | Full Load | Budget  |
| :--------------------------------------- | :--------------------------- | :-----------: | :----------: | :----------: | :------: | :--------------: | :-------: | :-----: |
| `/`                                      | Homepage (Pretext & Bio)     |   🟢 103ms    |   🟢 176ms   |   🟢 176ms   | 🟢 0.000 |     146.6ms      |  146.9ms  | ✅ PASS |
| `/case-studies`                          | Case Studies Index           |   🟢 13.7ms   |   🟢 132ms   |   🟢 132ms   | 🟢 0.000 |      54.8ms      |   218ms   | ✅ PASS |
| `/arcade`                                | Arcade Hub                   |   🟢 14.3ms   |   🟢 88ms    |   🟢 88ms    | 🟢 0.000 |      52.8ms      |  84.8ms   | ✅ PASS |
| `/proof`                                 | Formal Proof Studio          |   🟢 3.8ms    |   🟢 76ms    |   🟢 76ms    | 🟢 0.000 |      10.2ms      |  35.1ms   | ✅ PASS |
| `/neuro`                                 | Neuro 3D Simulator           |   🟢 67.9ms   |   🟢 112ms   |   🟢 112ms   | 🟢 0.000 |      83.7ms      |   84ms    | ✅ PASS |
| `/crf`                                   | CRF Builder & AST            |   🟢 4.8ms    |   🟢 40ms    |   🟢 40ms    | 🟢 0.000 |      10.6ms      |  22.6ms   | ✅ PASS |
| `/simulator`                             | System Dynamics Simulator    |   🟢 4.6ms    |   🟢 48ms    |   🟢 48ms    | 🟢 0.000 |      9.3ms       |  27.9ms   | ✅ PASS |
| `/schedule`                              | Schedule / Calendar          |   🟢 14.1ms   |   🟢 144ms   |   🟢 144ms   | 🟢 0.000 |      51.3ms      |  113.5ms  | ✅ PASS |
| `/offline`                               | Offline Fallback View        |   🟢 3.3ms    |   🟢 36ms    |   🟢 36ms    | 🟢 0.000 |      8.2ms       |  29.1ms   | ✅ PASS |
| `/case-studies/clinical-data-mapper`     | CS: Clinical Data Mapper     |  🟢 101.9ms   |   🟢 148ms   |   🟢 148ms   | 🟢 0.000 |      117ms       |  117.2ms  | ✅ PASS |
| `/case-studies/cadence-clinical`         | CS: Cadence Clinical         |    🟢 5ms     |   🟢 64ms    |   🟢 64ms    | 🟢 0.000 |      13.9ms      |  49.6ms   | ✅ PASS |
| `/case-studies/schemaflow`               | CS: SchemaFlow               |   🟢 62.3ms   |   🟢 104ms   |   🟢 104ms   | 🟢 0.000 |      75.4ms      |  75.5ms   | ✅ PASS |
| `/case-studies/imednet-python-sdk`       | CS: iMedNet SDK              |   🟢 38.9ms   |   🟢 88ms    |   🟢 88ms    | 🟢 0.000 |      78.5ms      |   139ms   | ✅ PASS |
| `/case-studies/wedding-website`          | CS: Wedding Platform         |   🟢 21.2ms   |   🟢 80ms    |   🟢 80ms    | 🟢 0.000 |      31.2ms      |  94.8ms   | ✅ PASS |
| `/case-studies/hono-kiln`                | CS: Hono-Kiln Runtime        |   🟢 75.6ms   |   🟢 152ms   |   🟢 152ms   | 🟢 0.000 |      86.6ms      |  176.9ms  | ✅ PASS |
| `/case-studies/inbody-qr-decoder`        | CS: InBody QR Decoder        |  🟢 100.6ms   |   🟢 144ms   |   🟢 144ms   | 🟢 0.000 |     114.2ms      |  133.2ms  | ✅ PASS |
| `/case-studies/oxidizemath`              | CS: OxidizeMath              |   🟢 6.7ms    |   🟢 48ms    |   🟢 48ms    | 🟢 0.000 |      13.7ms      |  59.3ms   | ✅ PASS |
| `/case-studies/ualbf`                    | CS: UALBF Engine             |  🟢 122.5ms   |   🟢 176ms   |   🟢 176ms   | 🟢 0.000 |     148.4ms      |  148.6ms  | ✅ PASS |
| `/case-studies/laser-loon`               | CS: Laser Loon               |   🟢 18.3ms   |   🟢 92ms    |   🟢 92ms    | 🟢 0.000 |      43.1ms      |  116.9ms  | ✅ PASS |
| `/work/laser-loon`                       | CS: Laser Loon Work Route    |  🟢 103.5ms   |   🟢 152ms   |   🟢 152ms   | 🟢 0.000 |     136.5ms      |  136.8ms  | ✅ PASS |
| `/case-studies/sonos-network-controller` | CS: Sonos Network Controller |  🟢 104.9ms   |   🟢 156ms   |   🟢 156ms   | 🟢 0.000 |     118.6ms      |  127.2ms  | ✅ PASS |
| `/case-studies/clintrials`               | CS: clintrials WASM Engine   |    🟢 10ms    |   🟢 76ms    |   🟢 76ms    | 🟢 0.000 |      18.7ms      |  90.4ms   | ✅ PASS |
| `/case-studies/equipose-randomization`   | CS: Equipose Randomization   |  🟢 104.2ms   |   🟢 144ms   |   🟢 144ms   | 🟢 0.000 |     121.4ms      |  121.6ms  | ✅ PASS |
| `/case-studies/lambda-wave`              | CS: Lambda-Wave Radar        |   🟢 8.2ms    |   🟢 52ms    |   🟢 52ms    | 🟢 0.000 |      22.6ms      |  67.4ms   | ✅ PASS |
| `/case-studies/duckdeploy`               | CS: DuckDeploy Dynamic UI    |   🟢 98.1ms   |   🟢 136ms   |   🟢 136ms   | 🟢 0.000 |     106.1ms      |  117.1ms  | ✅ PASS |
| `/case-studies/cardiac-risk-modeling`    | CS: Cardiac Risk Modeling    |   🟢 5.2ms    |   🟢 44ms    |   🟢 44ms    | 🟢 0.000 |      17.3ms      |  50.4ms   | ✅ PASS |
| `/case-studies/4glory`                   | CS: 4Glory Sports Analytics  |  🟢 104.8ms   |   🟢 140ms   |   🟢 140ms   | 🟢 0.000 |     111.2ms      |  111.3ms  | ✅ PASS |
| `/case-studies/crf-xl`                   | CS: CRF.xl CDISC Compiler    |   🟢 11.1ms   |   🟢 64ms    |   🟢 64ms    | 🟢 0.000 |      22.8ms      |  64.8ms   | ✅ PASS |
| `/case-studies/promptops`                | CS: PromptOps LLM Framework  |   🟢 98.4ms   |   🟢 136ms   |   🟢 136ms   | 🟢 0.000 |     107.7ms      |  107.8ms  | ✅ PASS |
| `/arcade/working-with-duck`              | Game: Duck Canvas Engine     |   🟢 94.6ms   |   🟢 132ms   |   🟢 132ms   | 🟢 0.000 |     100.2ms      |   104ms   | ✅ PASS |
| `/arcade/laser-loon`                     | Game: Laser Loon             |   🟢 4.2ms    |   🟢 48ms    |   🟢 48ms    | 🟢 0.000 |      9.5ms       |  30.8ms   | ✅ PASS |
| `/arcade/quasi-puzzler`                  | Game: Quasi Puzzler          |   🟢 92.9ms   |   🟢 128ms   |   🟢 128ms   | 🟢 0.000 |      99.1ms      |  99.3ms   | ✅ PASS |
| `/arcade/garmin-watch`                   | Game: Garmin Watch           |   🟢 4.5ms    |   🟢 52ms    |   🟢 52ms    | 🟢 0.000 |      10.5ms      |   25ms    | ✅ PASS |
| `/arcade/clinical-chaos`                 | Game: Clinical Chaos         |   🟢 4.4ms    |   🟢 36ms    |   🟢 36ms    | 🟢 0.000 |      11.4ms      |   34ms    | ✅ PASS |
| `/arcade/retro-labyrinth`                | Game: Retro Labyrinth        |   🟢 109ms    |   🟢 144ms   |   🟢 144ms   | 🟢 0.000 |     117.2ms      |  117.3ms  | ✅ PASS |
| `/arcade/meme-vault`                     | Game: Secret Meme Vault      |   🟢 4.8ms    |   🟢 60ms    |   🟢 60ms    | 🟢 0.000 |      10.5ms      |  23.2ms   | ✅ PASS |

## Aggregate Metrics

- **Total Routes Tested**: 36
- **Routes Passing Budget**: 36 / 36 (100%)
- **Fleet Average TTFB**: 48ms
- **Fleet Average LCP**: 101ms
- **Fleet Average Load Duration**: 92ms

## Core Web Vitals Thresholds (Google Web Vitals)

| Metric   | Good (🟢) | Needs Improvement (🟡) | Poor (🔴) |
| :------- | :-------: | :--------------------: | :-------: |
| **TTFB** |  ≤ 800ms  |     800ms - 1800ms     | > 1800ms  |
| **FCP**  | ≤ 1800ms  |    1800ms - 3000ms     | > 3000ms  |
| **LCP**  | ≤ 2500ms  |    2500ms - 4000ms     | > 4000ms  |
| **CLS**  |  ≤ 0.100  |     0.100 - 0.250      |  > 0.250  |
