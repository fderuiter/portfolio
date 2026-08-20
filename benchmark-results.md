# Page Speed & Core Web Vitals Benchmark Report

**Target URL**: `http://localhost:3000`  
**Generated**: 2026-08-20T17:12:21.174Z  
**Sampling**: 1 warmup + 3 measured runs per route (Median / P95 values reported)

## Route Performance Matrix

| Route | Page / Feature | TTFB (Median) | FCP (Median) | LCP (Median) | CLS | DOMContentLoaded | Full Load | Budget |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `/arcade` | Arcade Hub | 🟢 70.2ms | 🟢 116ms | 🟢 116ms | 🟢 0.000 | 95.1ms | 95.4ms | ✅ PASS |
| `/arcade/working-with-duck` | Game: Duck Canvas Engine | 🟢 85.3ms | 🟢 244ms | 🟢 244ms | 🟢 0.000 | 218ms | 218.1ms | ✅ PASS |
| `/arcade/laser-loon` | Game: Laser Loon | 🟢 8.9ms | 🟢 148ms | 🟢 148ms | 🟢 0.000 | 33.1ms | 180.5ms | ✅ PASS |
| `/arcade/quasi-puzzler` | Game: Quasi Puzzler | 🟢 78.3ms | 🟢 120ms | 🟢 120ms | 🟢 0.000 | 109ms | 109.8ms | ✅ PASS |
| `/arcade/garmin-watch` | Game: Garmin Watch | 🟢 8.3ms | 🟢 152ms | 🟢 152ms | 🟢 0.000 | 35.3ms | 158.9ms | ✅ PASS |
| `/arcade/clinical-chaos` | Game: Clinical Chaos | 🟢 75ms | 🟢 124ms | 🟢 124ms | 🟢 0.000 | 96.9ms | 112.6ms | ✅ PASS |
| `/arcade/retro-labyrinth` | Game: Retro Labyrinth | 🟢 93.8ms | 🟢 140ms | 🟢 140ms | 🟢 0.000 | 114.2ms | 156.6ms | ✅ PASS |
| `/arcade/meme-vault` | Game: Secret Meme Vault | 🟢 8.9ms | 🟢 212ms | 🟢 212ms | 🟢 0.000 | 31.6ms | 267.7ms | ✅ PASS |

## Aggregate Metrics

- **Total Routes Tested**: 8
- **Routes Passing Budget**: 8 / 8 (100%)
- **Fleet Average TTFB**: 54ms
- **Fleet Average LCP**: 157ms
- **Fleet Average Load Duration**: 162ms

## Core Web Vitals Thresholds (Google Web Vitals)

| Metric | Good (🟢) | Needs Improvement (🟡) | Poor (🔴) |
| :--- | :---: | :---: | :---: |
| **TTFB** | ≤ 800ms | 800ms - 1800ms | > 1800ms |
| **FCP** | ≤ 1800ms | 1800ms - 3000ms | > 3000ms |
| **LCP** | ≤ 2500ms | 2500ms - 4000ms | > 4000ms |
| **CLS** | ≤ 0.100 | 0.100 - 0.250 | > 0.250 |
