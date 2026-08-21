# Page Speed & Core Web Vitals Benchmark Report

**Target URL**: `http://localhost:3000`  
**Generated**: 2026-08-21T17:52:00.905Z  
**Sampling**: 1 warmup + 3 measured runs per route (Median / P95 values reported)

## Route Performance Matrix

| Route | Page / Feature | TTFB (Median) | FCP (Median) | LCP (Median) | CLS | DOMContentLoaded | Full Load | Budget |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `/` | Homepage (Pretext & Bio) | 🟢 8.2ms | 🟢 88ms | 🟢 88ms | 🟢 0.000 | 18.5ms | 122.1ms | ✅ PASS |
| `/case-studies` | Case Studies Index | 🟢 8.7ms | 🟢 152ms | 🟢 152ms | 🟢 0.000 | 29.8ms | 258.4ms | ✅ PASS |
| `/arcade` | Arcade Hub | 🟢 3.9ms | 🟢 100ms | 🟢 100ms | 🟢 0.000 | 13.5ms | 89.5ms | ✅ PASS |
| `/proof` | Formal Proof Studio | 🟢 5ms | 🟢 68ms | 🟢 68ms | 🟢 0.000 | 13.3ms | 62.9ms | ✅ PASS |
| `/neuro` | Neuro 3D Simulator | 🟢 6.8ms | 🟢 332ms | 🟢 332ms | 🟢 0.000 | 286.9ms | 1497.7ms | ✅ PASS |
| `/crf` | CRF Builder & AST | 🟢 3.9ms | 🟢 64ms | 🟢 64ms | 🟢 0.000 | 12.1ms | 76ms | ✅ PASS |
| `/simulator` | System Dynamics Simulator | 🟢 11.8ms | 🟢 84ms | 🟢 84ms | 🟢 0.000 | 32.3ms | 73.7ms | ✅ PASS |
| `/schedule` | Schedule / Calendar | 🟢 3.2ms | 🟢 84ms | 🟢 84ms | 🟢 0.000 | 11ms | 83.3ms | ✅ PASS |
| `/offline` | Offline Fallback View | 🟢 3.7ms | 🟢 80ms | 🟢 80ms | 🟢 0.000 | 11.1ms | 57.6ms | ✅ PASS |
| `/case-studies/clinical-data-mapper` | CS: Clinical Data Mapper | 🟢 3.6ms | 🟢 80ms | 🟢 80ms | 🟢 0.000 | 12.8ms | 78.1ms | ✅ PASS |
| `/case-studies/cadence-clinical` | CS: Cadence Clinical | 🟢 3.6ms | 🟢 76ms | 🟢 76ms | 🟢 0.000 | 13.1ms | 76.3ms | ✅ PASS |
| `/case-studies/schemaflow` | CS: SchemaFlow | 🟢 4.1ms | 🟢 84ms | 🟢 84ms | 🟢 0.000 | 14.3ms | 86.7ms | ✅ PASS |
| `/case-studies/imednet-python-sdk` | CS: iMedNet SDK | 🟢 3.8ms | 🟢 76ms | 🟢 76ms | 🟢 0.000 | 13.4ms | 79.4ms | ✅ PASS |
| `/case-studies/wedding-website` | CS: Wedding Platform | 🟢 4.2ms | 🟢 84ms | 🟢 84ms | 🟢 0.000 | 15.9ms | 80.1ms | ✅ PASS |
| `/case-studies/hono-kiln` | CS: Hono-Kiln Runtime | 🟢 4.1ms | 🟢 68ms | 🟢 68ms | 🟢 0.000 | 12.6ms | 69.3ms | ✅ PASS |
| `/case-studies/inbody-qr-decoder` | CS: InBody QR Decoder | 🟢 3.2ms | 🟢 68ms | 🟢 68ms | 🟢 0.000 | 11.7ms | 72.1ms | ✅ PASS |
| `/case-studies/oxidizemath` | CS: OxidizeMath | 🟢 3.8ms | 🟢 84ms | 🟢 84ms | 🟢 0.000 | 14.3ms | 85.8ms | ✅ PASS |
| `/case-studies/ualbf` | CS: UALBF Engine | 🟢 9.9ms | 🟢 84ms | 🟢 84ms | 🟢 0.000 | 20.2ms | 98.2ms | ✅ PASS |
| `/case-studies/laser-loon` | CS: Laser Loon | 🟢 3.3ms | 🟢 84ms | 🟢 84ms | 🟢 0.000 | 14.3ms | 86.5ms | ✅ PASS |
| `/work/laser-loon` | CS: Laser Loon Work Route | 🟢 3.6ms | 🟢 88ms | 🟢 88ms | 🟢 0.000 | 14ms | 87.1ms | ✅ PASS |
| `/case-studies/sonos-network-controller` | CS: Sonos Network Controller | 🟢 3.3ms | 🟢 80ms | 🟢 80ms | 🟢 0.000 | 13.5ms | 84.5ms | ✅ PASS |
| `/case-studies/clintrials` | CS: clintrials WASM Engine | 🟢 3.3ms | 🟢 84ms | 🟢 84ms | 🟢 0.000 | 13.1ms | 74.8ms | ✅ PASS |
| `/case-studies/equipose-randomization` | CS: Equipose Randomization | 🟢 4.3ms | 🟢 84ms | 🟢 84ms | 🟢 0.000 | 14.1ms | 77.9ms | ✅ PASS |
| `/case-studies/lambda-wave` | CS: Lambda-Wave Radar | 🟢 2.8ms | 🟢 64ms | 🟢 64ms | 🟢 0.000 | 11.3ms | 70.1ms | ✅ PASS |
| `/case-studies/duckdeploy` | CS: DuckDeploy Dynamic UI | 🟢 3ms | 🟢 60ms | 🟢 60ms | 🟢 0.000 | 11.7ms | 63.6ms | ✅ PASS |
| `/case-studies/cardiac-risk-modeling` | CS: Cardiac Risk Modeling | 🟢 7.8ms | 🟢 76ms | 🟢 76ms | 🟢 0.000 | 16.5ms | 70.1ms | ✅ PASS |
| `/case-studies/4glory` | CS: 4Glory Sports Analytics | 🟢 2.2ms | 🟢 60ms | 🟢 60ms | 🟢 0.000 | 9.7ms | 59.7ms | ✅ PASS |
| `/case-studies/crf-xl` | CS: CRF.xl CDISC Compiler | 🟢 3.3ms | 🟢 72ms | 🟢 72ms | 🟢 0.000 | 11.3ms | 64.7ms | ✅ PASS |
| `/case-studies/promptops` | CS: PromptOps LLM Framework | 🟢 4.6ms | 🟢 72ms | 🟢 72ms | 🟢 0.000 | 12.6ms | 62.2ms | ✅ PASS |
| `/arcade/working-with-duck` | Game: Duck Canvas Engine | 🟢 21.7ms | 🟢 68ms | 🟢 68ms | 🟢 0.000 | 28.7ms | 70.1ms | ✅ PASS |
| `/arcade/laser-loon` | Game: Laser Loon | 🟢 7.3ms | 🟢 68ms | 🟢 68ms | 🟢 0.000 | 14ms | 53ms | ✅ PASS |
| `/arcade/quasi-puzzler` | Game: Quasi Puzzler | 🟢 3.2ms | 🟢 44ms | 🟢 44ms | 🟢 0.000 | 9.4ms | 48.5ms | ✅ PASS |
| `/arcade/garmin-watch` | Game: Garmin Watch | 🟢 10.7ms | 🟢 64ms | 🟢 64ms | 🟢 0.000 | 17ms | 55.1ms | ✅ PASS |
| `/arcade/clinical-chaos` | Game: Clinical Chaos | 🟢 12.5ms | 🟢 60ms | 🟢 60ms | 🟢 0.000 | 18.6ms | 57.3ms | ✅ PASS |
| `/arcade/retro-labyrinth` | Game: Retro Labyrinth | 🟢 9.6ms | 🟢 56ms | 🟢 56ms | 🟢 0.000 | 16.1ms | 57ms | ✅ PASS |
| `/arcade/meme-vault` | Game: Secret Meme Vault | 🟢 9.7ms | 🟢 84ms | 🟢 84ms | 🟢 0.000 | 15.7ms | 56.4ms | ✅ PASS |

## Aggregate Metrics

- **Total Routes Tested**: 36
- **Routes Passing Budget**: 36 / 36 (100%)
- **Fleet Average TTFB**: 6ms
- **Fleet Average LCP**: 84ms
- **Fleet Average Load Duration**: 118ms

## Core Web Vitals Thresholds (Google Web Vitals)

| Metric | Good (🟢) | Needs Improvement (🟡) | Poor (🔴) |
| :--- | :---: | :---: | :---: |
| **TTFB** | ≤ 800ms | 800ms - 1800ms | > 1800ms |
| **FCP** | ≤ 1800ms | 1800ms - 3000ms | > 3000ms |
| **LCP** | ≤ 2500ms | 2500ms - 4000ms | > 4000ms |
| **CLS** | ≤ 0.100 | 0.100 - 0.250 | > 0.250 |
