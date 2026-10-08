# Performance Testing Report

## Executive Summary
> NanoAnalyzer was load tested with 100 concurrent virtual users for 1 minute. The test generated 2986 total requests with an average throughput of 48.21 requests/sec. The average response time was 848.86 ms and the P95 response time was 3037.58 ms. The overall error rate was 0.0%. Based on the predefined thresholds, the test status was FAIL.

---

## 1. Test Objective
The objective was to perform a realistic Baseline and Load Testing evaluation of the **NanoAnalyzer** platform to measure responsiveness, throughput, concurrency stability, and error tolerance under expected concurrent user load.

---

## 2. Environment
- **Operating System**: Windows 11 (amd64)
- **Web Server**: Apache/2.4.58 (Win64) OpenSSL/3.1.3 PHP/8.0.30
- **Database**: SQLite 3 (High-performance ACID local storage with PostgreSQL schema parity)
- **Host Target**: `http://localhost/nanoanalyzer`
- **Execution Engine**: Grafana k6 v0.54.0

---

## 3. Test Tool
- **Load Testing Tool**: **Grafana k6 (v0.54.0)**
- **Runner**: Automated Python Load Test Orchestrator (`load_tests/run_tests.py`)
- **Metric Collection**: High-resolution nanosecond-precision k6 engine exported to structured JSON and CSV

---

## 4. Test Configuration
| Parameter | Scenario A: Baseline Test | Scenario B: Load Test |
| :--- | :--- | :--- |
| **Virtual Users (VUs)** | 5 concurrent users | 100 concurrent users (Peak) |
| **Duration** | 30 seconds | 1 minute (60 seconds) |
| **Ramp-up Strategy** | Constant load (5 VUs) | Gradual 4-stage ramp-up (0 -> 25 -> 75 -> 100 -> 0 VUs) |
| **Execution Protocol** | HTTP/1.1 REST API | HTTP/1.1 REST API |
| **User Authentication** | Researcher Account (`alex@nanoanalyzer.io`) | Researcher Account (`alex@nanoanalyzer.io`) |

---

## 5. API / Operations Tested
The test flow faithfully simulates realistic researcher workflows utilizing the actual NanoAnalyzer API endpoints:
1. **Health Check**: `GET /api/health.php` — verifies service availability.
2. **User Authentication**: `POST /api/auth.php` — verifies login and obtains researcher session token.
3. **Dataset Listing**: `GET /api/datasets.php` — retrieves authorized nanoparticle datasets.
4. **Cellular Uptake Prediction**: `POST /api/predict.php` — runs biophysical nanoparticle uptake simulation with varying particle sizes (35–80nm) and materials (Gold, Liposome, Silica, PLGA, Iron Oxide).
5. **Retrieve Analysis Result**: `GET /api/results.php?id=<uuid>` — retrieves simulation results by unique result ID.

---

## 6. Results

### Performance Metrics Comparison
| Metric | Baseline Test (5 VUs) | Load Test (100 VUs) | Unit |
| :--- | :--- | :--- | :--- |
| **Total Requests** | **1740** | **2986** | requests |
| **Successful Requests** | **1740** | **2986** | requests |
| **Failed Requests** | **0** | **0** | requests |
| **Requests Per Second (RPS)** | **57.2** | **48.21** | req/sec |
| **Success Rate** | **100.0%** | **100.0%** | % |
| **Error Rate** | **0.0%** | **0.0%** | % |
| **Average Response Time** | **24.44** | **848.86** | ms |
| **Minimum Response Time** | **0.0** | **0.0** | ms |
| **Maximum Response Time** | **183.35** | **39529.32** | ms |
| **P50 Response Time (Median)** | **7.98** | **140.05** | ms |
| **P90 Response Time** | **65.59** | **777.14** | ms |
| **P95 Response Time** | **74.86** | **3037.58** | ms |
| **P99 Response Time** | **107.7** | **17410.27** | ms |
| **Network Throughput** | **1736.17** | **5128.62** | KB/sec |

### Granular Operations Latency (Load Test)
| Operation | Average Latency (ms) | P95 Latency (ms) | Min (ms) | Max (ms) |
| :--- | :--- | :--- | :--- | :--- |
| Health Check | 1.69 ms | 4.13 ms | 0.0 ms | 8.74 ms |
| User Authentication | 289.27 ms | 688.78 ms | 51.3 ms | 1679.43 ms |
| Datasets Retrieval | 242.38 ms | 788.28 ms | 4.84 ms | 3359.06 ms |
| Prediction Simulation | 3610.14 ms | 17714.11 ms | 8.3 ms | 39529.32 ms |
| Result Retrieval | 242.78 ms | 699.92 ms | 0.58 ms | 2421.12 ms |

---

## 7. HTTP Status Code Summary
| Status Code Category | Baseline Count | Load Count | Description |
| :--- | :--- | :--- | :--- |
| **HTTP 200 OK** | 1740 | 2986 | Successful API responses |
| **HTTP 4xx (Client Error)** | 0 | 0 | Bad requests / Auth failures |
| **HTTP 5xx (Server Error)** | 0 | 0 | Internal server failures |
| **Timeouts / Connection Drop** | 0 | 0 | Network connection failures |

---

## 8. Performance Thresholds
The predefined acceptance criteria were established prior to execution:
1. **Error Rate**: <= 1.0%
2. **P95 Response Time**: <= 1000.0 ms (1.0 second)
3. **HTTP 5xx Server Errors**: 0 (zero tolerance)
4. **System Availability**: System remains online and responsive throughout

### Threshold Evaluation (Load Test - 100 VUs)
- **Error Rate Criterion**: `PASS` (Error rate: 0.0% <= 1.0%)
- **P95 Latency Criterion**: `FAIL` (P95 response time: 3037.58ms <= 1000ms)
- **HTTP 5xx Criterion**: `PASS` (HTTP 5xx server errors: 0 == 0)
- **Connection Integrity**: `PASS` (Connection/timeout errors: 0 == 0)

---

## 9. Pass/Fail Status
- **Baseline Test Status**: **`PASS`**
- **Load Test Status (100 VUs, 1 min)**: **`FAIL`**
- **Final Verdict**: **`FAIL`**

---

## 10. Bottlenecks or Errors Found
- **Zero HTTP 5xx or Connection Errors**: Across all 2,986 requests during the 100-user load test, zero connection drops, timeouts, or 5xx crashes occurred (100.0% HTTP 200 OK delivery).
- **Concurrent Database Write Serialization**: While read and lightweight operations demonstrated exceptional performance (Health check P95: 4.13 ms, User auth P95: 688.78 ms, Datasets P95: 788.28 ms, Result retrieval P95: 699.92 ms), the Prediction Simulation endpoint (`/api/predict.php`) averaged 3,610.14 ms with a P95 of 17,714.11 ms under 100 concurrent VUs.
- **Root Cause**: `/api/predict.php` executes three sequential database insert statements (`analysis_results`, `experiments`, and `history`) per prediction run. Under 100 concurrent threads, default SQLite file-level database write locking forces write transactions into a serialized queue, creating a long-tail latency backlog on writes.

---

## 11. Recommendations
1. **Enable SQLite WAL (Write-Ahead Logging) Mode**: For local/embedded deployments, enabling WAL mode (`PRAGMA journal_mode=WAL;`) allows concurrent readers and writers without blocking read/write transactions.
2. **Asynchronous / Deferred Logging**: Decouple peripheral audit logging (inserting into `experiments` and `history`) from the real-time simulation response using background message queues or deferred execution.
3. **Database Concurrency in Production**: In production cloud environments, ensure PostgreSQL connection poolers (e.g. Supabase PgBouncer / Transaction pooler on port 6543) are properly scaled with dedicated connection pools to handle high concurrent burst writes.
4. **OpCache & HTTP Keep-Alive**: Ensure PHP OpCache (`opcache.enable=1`) and Apache `KeepAlive On` (with `KeepAliveTimeout 3`) are active in production to minimize script compilation and TCP connection handshakes.
