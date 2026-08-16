# Page Speed & Core Web Vitals Benchmark Report

**Target URL**: `http://localhost:3000`  
**Generated**: 2026-08-16T02:29:07.904Z  
**Sampling**: 1 warmup + 3 measured runs per route (Median / P95 values reported)

## Route Performance Matrix

| Route | Page / Feature | TTFB (Median) | FCP (Median) | LCP (Median) | CLS | DOMContentLoaded | Full Load | Budget |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `/` | Homepage (Pretext & Bio) | 🟢 3.5ms | 🟢 68ms | 🟢 68ms | 🟢 0.000 | 13.4ms | 34.7ms | ✅ PASS |
| `/case-studies` | Case Studies Index | 🟢 1.6ms | 🟢 40ms | 🟢 40ms | 🟢 0.000 | 8.4ms | 10.3ms | ✅ PASS |
| `/arcade` | Arcade Hub | 🟢 2.3ms | 🟢 60ms | 🟢 60ms | 🟢 0.000 | 10.8ms | 36.4ms | ✅ PASS |
| `/proof` | Formal Proof Studio | 🟢 1.6ms | 🟢 36ms | 🟢 36ms | 🟢 0.000 | 5.7ms | 13ms | ✅ PASS |
| `/neuro` | Neuro 3D Simulator | 🟢 1.3ms | 🟢 40ms | 🟢 40ms | 🟢 0.000 | 6.2ms | 14.2ms | ✅ PASS |
| `/crf` | CRF Builder & AST | 🟢 1.1ms | 🟢 52ms | 🟢 52ms | 🟢 0.000 | 6.5ms | 14.5ms | ✅ PASS |
| `/simulator` | System Dynamics Simulator | 🟢 1.8ms | 🟢 56ms | 🟢 56ms | 🟢 0.000 | 8.4ms | 28.1ms | ✅ PASS |
| `/schedule` | Schedule / Calendar | 🟢 2ms | 🟢 52ms | 🟢 52ms | 🟢 0.000 | 11.2ms | 35.6ms | ✅ PASS |
| `/case-studies/clinical-data-mapper` | CS: Clinical Data Mapper | 🟢 2ms | 🟢 44ms | 🟢 44ms | 🟢 0.000 | 9.3ms | 28.9ms | ✅ PASS |
| `/case-studies/cadence-clinical` | CS: Cadence Clinical | 🟢 1.6ms | 🟢 44ms | 🟢 44ms | 🟢 0.000 | 7ms | 21.4ms | ✅ PASS |
| `/case-studies/schemaflow` | CS: SchemaFlow | 🟢 2.6ms | 🟢 56ms | 🟢 56ms | 🟢 0.000 | 12.3ms | 42.4ms | ✅ PASS |
| `/case-studies/imednet-python-sdk` | CS: iMedNet SDK | 🟢 2.4ms | 🟢 56ms | 🟢 56ms | 🟢 0.000 | 12.5ms | 39.2ms | ✅ PASS |
| `/case-studies/wedding-website` | CS: Wedding Platform | 🟢 2.8ms | 🟢 48ms | 🟢 48ms | 🟢 0.000 | 12.2ms | 25.6ms | ✅ PASS |
| `/arcade/working-with-duck` | Game: Duck Canvas Engine | 🟢 2.2ms | 🟢 64ms | 🟢 64ms | 🟢 0.000 | 11.1ms | 36.5ms | ✅ PASS |
| `/arcade/laser-loon` | Game: Laser Loon | 🟢 1.9ms | 🟢 40ms | 🟢 40ms | 🟢 0.000 | 11ms | 25.2ms | ✅ PASS |
| `/arcade/quasi-puzzler` | Game: Quasi Puzzler | 🟢 2.5ms | 🟢 56ms | 🟢 56ms | 🟢 0.000 | 13ms | 42.6ms | ✅ PASS |
| `/arcade/garmin-watch` | Game: Garmin Watch | 🟢 2ms | 🟢 48ms | 🟢 48ms | 🟢 0.000 | 11.6ms | 25.2ms | ✅ PASS |
| `/arcade/clinical-chaos` | Game: Clinical Chaos | 🟢 2.2ms | 🟢 44ms | 🟢 44ms | 🟢 0.000 | 11.5ms | 25.9ms | ✅ PASS |
| `/arcade/retro-labyrinth` | Game: Retro Labyrinth | 🟢 2.5ms | 🟢 64ms | 🟢 64ms | 🟢 0.000 | 12.5ms | 26.7ms | ✅ PASS |

## Aggregate Metrics

- **Total Routes Tested**: 19
- **Routes Passing Budget**: 19 / 19 (100%)
- **Fleet Average TTFB**: 2ms
- **Fleet Average LCP**: 51ms
- **Fleet Average Load Duration**: 28ms

## Core Web Vitals Thresholds (Google Web Vitals)

| Metric | Good (🟢) | Needs Improvement (🟡) | Poor (🔴) |
| :--- | :---: | :---: | :---: |
| **TTFB** | ≤ 800ms | 800ms - 1800ms | > 1800ms |
| **FCP** | ≤ 1800ms | 1800ms - 3000ms | > 3000ms |
| **LCP** | ≤ 2500ms | 2500ms - 4000ms | > 4000ms |
| **CLS** | ≤ 0.100 | 0.100 - 0.250 | > 0.250 |
