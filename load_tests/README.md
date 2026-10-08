# NanoAnalyzer Baseline & Load Testing Suite

This directory contains the automated performance and load testing framework for the **NanoAnalyzer** project, built using **Grafana k6** and an automated Python orchestration engine.

---

## Architecture & Tested Flow

The test suite exercises the actual production API endpoints of NanoAnalyzer:
1. **Health Check**: `GET /api/health.php` — verifies service availability.
2. **User Authentication**: `POST /api/auth.php` — authenticates with researcher credentials (`alex@nanoanalyzer.io` / `researcher123`) and retrieves the session token / user ID.
3. **Dataset Listing**: `GET /api/datasets.php` — retrieves user's nanoparticle datasets.
4. **Prediction Simulation**: `POST /api/predict.php` — executes biophysical cellular uptake calculation model with varying nanoparticle sizes (35–80nm) and materials (Gold, Liposome, Silica, PLGA, Iron Oxide).
5. **Retrieve Result**: `GET /api/results.php?id=<result_id>` — fetches simulation results by the returned result ID.

---

## Test Scenarios

### Scenario A: Baseline Test (`baseline_test.js`)
- **Virtual Users (VUs)**: 5 concurrent users
- **Duration**: 30 seconds
- **Purpose**: Measure normal baseline system latency, throughput, and operational stability under light load.

### Scenario B: Load Test (`load_test.js`)
- **Virtual Users (VUs)**: 100 concurrent users (Peak)
- **Duration**: 1 minute (60 seconds)
- **Ramp-Up Strategy**: Gradual 4-stage ramp-up:
  - `0s - 15s`: Ramp up from 0 to 25 VUs (warm-up)
  - `15s - 30s`: Scale from 25 to 75 VUs
  - `30s - 45s`: Sustain 100 peak concurrent VUs
  - `45s - 60s`: Controlled ramp down to 0 VUs
- **Purpose**: Stress test system capacity, verify zero 5xx server errors, measure P95 latency and throughput under peak concurrent load.

---

## Predefined Acceptance Criteria

Before running tests, the following thresholds are defined:
- **Error Rate**: &le; 1.0%
- **P95 Response Time**: &le; 1000.0 ms (1.0 second)
- **HTTP 5xx Server Errors**: 0 (zero tolerance)
- **Connection / Timeout Failures**: 0 errors
- **System Availability**: System remains online throughout the test

---

## Project Structure

```
load_tests/
├── config.json               # Test environment configuration, endpoints, thresholds
├── baseline_test.js          # k6 script for Scenario A (Baseline)
├── load_test.js              # k6 script for Scenario B (100 VU Load Test)
├── run_tests.py              # Automated Python runner, metric aggregator & reporter
├── README.md                 # Documentation
├── results/                  # Generated machine-readable results
│   ├── baseline_summary.json # Raw k6 baseline summary
│   ├── baseline_results.json # Parsed baseline JSON metrics
│   ├── baseline_results.csv  # Parsed baseline CSV metrics
│   ├── load_summary.json     # Raw k6 load test summary
│   ├── load_results.json     # Parsed load test JSON metrics
│   └── load_results.csv      # Parsed load test CSV metrics
└── reports/                  # Generated human-readable reports
    ├── PERFORMANCE_REPORT.md # Markdown performance report
    └── performance_report.html # Modern responsive HTML report
```

---

## How to Run

### Automated Suite (Recommended)

Run the Python orchestrator, which checks preflight health, executes both tests, collects metrics, and generates JSON, CSV, Markdown, and HTML reports:

```powershell
python load_tests/run_tests.py
```

### Manual / Individual Execution via k6

Run Scenario A (Baseline):
```powershell
.\k6.exe run load_tests/baseline_test.js
```

Run Scenario B (Load Test - 100 VUs, 1 min):
```powershell
.\k6.exe run load_tests/load_test.js
```

Targeting a custom base URL:
```powershell
.\k6.exe run -e BASE_URL="http://your-server-ip/nanoanalyzer" load_tests/load_test.js
```
