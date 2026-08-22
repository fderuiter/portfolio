# Page Speed & Core Web Vitals Benchmark Report

**Target URL**: `http://localhost:3000`  
**Generated**: 2026-08-21T23:58:34.044Z  
**Sampling**: 1 warmup + 3 measured runs per route (Median / P95 values reported)

## Route Performance Matrix

| Route                                    | Page / Feature               | TTFB (Median) | FCP (Median) | LCP (Median) |   CLS    | DOMContentLoaded | Full Load | Budget  |
| :--------------------------------------- | :--------------------------- | :-----------: | :----------: | :----------: | :------: | :--------------: | :-------: | :-----: |
| `/`                                      | Homepage (Pretext & Bio)     |   🟢 8.7ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      30.1ms      |  30.1ms   | ✅ PASS |
| `/case-studies`                          | Case Studies Index           |   🟢 9.6ms    |   🟢 40ms    |   🟢 40ms    | 🟢 0.000 |      28.3ms      |  38.5ms   | ✅ PASS |
| `/arcade`                                | Arcade Hub                   |   🟢 7.6ms    |   🟢 28ms    |   🟢 28ms    | 🟢 0.000 |      25.5ms      |  25.6ms   | ✅ PASS |
| `/proof`                                 | Formal Proof Studio          |   🟢 7.2ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      23.4ms      |  23.7ms   | ✅ PASS |
| `/neuro`                                 | Neuro 3D Simulator           |   🟢 8.1ms    |   🟢 28ms    |   🟢 28ms    | 🟢 0.000 |       23ms       |  23.2ms   | ✅ PASS |
| `/crf`                                   | CRF Builder & AST            |   🟢 8.2ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      20.7ms      |  24.2ms   | ✅ PASS |
| `/simulator`                             | System Dynamics Simulator    |   🟢 7.4ms    |   🟢 28ms    |   🟢 28ms    | 🟢 0.000 |      22.6ms      |  22.7ms   | ✅ PASS |
| `/schedule`                              | Schedule / Calendar          |   🟢 7.1ms    |   🟢 28ms    |   🟢 28ms    | 🟢 0.000 |      23.6ms      |  23.7ms   | ✅ PASS |
| `/offline`                               | Offline Fallback View        |   🟢 7.1ms    |   🟢 28ms    |   🟢 28ms    | 🟢 0.000 |      22.7ms      |  22.8ms   | ✅ PASS |
| `/case-studies/clinical-data-mapper`     | CS: Clinical Data Mapper     |   🟢 7.9ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      25.7ms      |   26ms    | ✅ PASS |
| `/case-studies/cadence-clinical`         | CS: Cadence Clinical         |   🟢 8.7ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      25.6ms      |  25.8ms   | ✅ PASS |
| `/case-studies/schemaflow`               | CS: SchemaFlow               |   🟢 7.9ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |       25ms       |   25ms    | ✅ PASS |
| `/case-studies/imednet-python-sdk`       | CS: iMedNet SDK              |   🟢 7.3ms    |   🟢 28ms    |   🟢 28ms    | 🟢 0.000 |      26.2ms      |  26.3ms   | ✅ PASS |
| `/case-studies/wedding-website`          | CS: Wedding Platform         |   🟢 7.4ms    |   🟢 28ms    |   🟢 28ms    | 🟢 0.000 |      25.5ms      |  25.6ms   | ✅ PASS |
| `/case-studies/hono-kiln`                | CS: Hono-Kiln Runtime        |   🟢 7.8ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      26.4ms      |  26.4ms   | ✅ PASS |
| `/case-studies/inbody-qr-decoder`        | CS: InBody QR Decoder        |   🟢 8.7ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      26.1ms      |  26.2ms   | ✅ PASS |
| `/case-studies/oxidizemath`              | CS: OxidizeMath              |   🟢 6.9ms    |   🟢 28ms    |   🟢 28ms    | 🟢 0.000 |      24.5ms      |  24.8ms   | ✅ PASS |
| `/case-studies/ualbf`                    | CS: UALBF Engine             |   🟢 8.3ms    |   🟢 28ms    |   🟢 28ms    | 🟢 0.000 |      25.8ms      |  25.9ms   | ✅ PASS |
| `/case-studies/laser-loon`               | CS: Laser Loon               |   🟢 7.2ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      26.5ms      |  26.6ms   | ✅ PASS |
| `/work/laser-loon`                       | CS: Laser Loon Work Route    |   🟢 7.8ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      26.2ms      |  26.3ms   | ✅ PASS |
| `/case-studies/sonos-network-controller` | CS: Sonos Network Controller |   🟢 7.7ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      24.2ms      |  24.3ms   | ✅ PASS |
| `/case-studies/clintrials`               | CS: clintrials WASM Engine   |   🟢 8.3ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      22.3ms      |  23.2ms   | ✅ PASS |
| `/case-studies/equipose-randomization`   | CS: Equipose Randomization   |   🟢 8.1ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      26.1ms      |  26.2ms   | ✅ PASS |
| `/case-studies/lambda-wave`              | CS: Lambda-Wave Radar        |   🟢 7.3ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      26.2ms      |  26.3ms   | ✅ PASS |
| `/case-studies/duckdeploy`               | CS: DuckDeploy Dynamic UI    |   🟢 6.9ms    |   🟢 28ms    |   🟢 28ms    | 🟢 0.000 |       24ms       |  24.1ms   | ✅ PASS |
| `/case-studies/cardiac-risk-modeling`    | CS: Cardiac Risk Modeling    |   🟢 8.5ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      27.2ms      |  27.3ms   | ✅ PASS |
| `/case-studies/4glory`                   | CS: 4Glory Sports Analytics  |   🟢 7.1ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      26.3ms      |  26.4ms   | ✅ PASS |
| `/case-studies/crf-xl`                   | CS: CRF.xl CDISC Compiler    |   🟢 8.2ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      25.8ms      |  25.8ms   | ✅ PASS |
| `/case-studies/promptops`                | CS: PromptOps LLM Framework  |   🟢 7.1ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      21.7ms      |  22.6ms   | ✅ PASS |
| `/arcade/working-with-duck`              | Game: Duck Canvas Engine     |   🟢 6.9ms    |   🟢 28ms    |   🟢 28ms    | 🟢 0.000 |      23.3ms      |  23.4ms   | ✅ PASS |
| `/arcade/laser-loon`                     | Game: Laser Loon             |   🟢 7.9ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      21.3ms      |  22.9ms   | ✅ PASS |
| `/arcade/quasi-puzzler`                  | Game: Quasi Puzzler          |    🟢 7ms     |   🟢 28ms    |   🟢 28ms    | 🟢 0.000 |      18.9ms      |  20.4ms   | ✅ PASS |
| `/arcade/garmin-watch`                   | Game: Garmin Watch           |   🟢 6.1ms    |   🟢 24ms    |   🟢 24ms    | 🟢 0.000 |      20.2ms      |  20.4ms   | ✅ PASS |
| `/arcade/clinical-chaos`                 | Game: Clinical Chaos         |   🟢 7.6ms    |   🟢 28ms    |   🟢 28ms    | 🟢 0.000 |      20.3ms      |   25ms    | ✅ PASS |
| `/arcade/retro-labyrinth`                | Game: Retro Labyrinth        |   🟢 7.6ms    |   🟢 28ms    |   🟢 28ms    | 🟢 0.000 |      23.3ms      |  23.7ms   | ✅ PASS |
| `/arcade/meme-vault`                     | Game: Secret Meme Vault      |   🟢 8.5ms    |   🟢 32ms    |   🟢 32ms    | 🟢 0.000 |      21.7ms      |  22.7ms   | ✅ PASS |

## Aggregate Metrics

- **Total Routes Tested**: 36
- **Routes Passing Budget**: 36 / 36 (100%)
- **Fleet Average TTFB**: 8ms
- **Fleet Average LCP**: 30ms
- **Fleet Average Load Duration**: 25ms

## Core Web Vitals Thresholds (Google Web Vitals)

| Metric   | Good (🟢) | Needs Improvement (🟡) | Poor (🔴) |
| :------- | :-------: | :--------------------: | :-------: |
| **TTFB** |  ≤ 800ms  |     800ms - 1800ms     | > 1800ms  |
| **FCP**  | ≤ 1800ms  |    1800ms - 3000ms     | > 3000ms  |
| **LCP**  | ≤ 2500ms  |    2500ms - 4000ms     | > 4000ms  |
| **CLS**  |  ≤ 0.100  |     0.100 - 0.250      |  > 0.250  |
