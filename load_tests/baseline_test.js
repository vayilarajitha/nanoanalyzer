import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost/nanoanalyzer';

// Custom metric trackers
const status200 = new Counter('status_200_count');
const status2xx = new Counter('status_2xx_count');
const status4xx = new Counter('status_4xx_count');
const status5xx = new Counter('status_5xx_count');
const statusOther = new Counter('status_other_count');
const connectionErrors = new Counter('connection_timeout_errors');

const healthDuration = new Trend('duration_op_health', true);
const authDuration = new Trend('duration_op_auth', true);
const datasetsDuration = new Trend('duration_op_datasets', true);
const predictDuration = new Trend('duration_op_predict', true);
const resultsDuration = new Trend('duration_op_results', true);

export const options = {
  scenarios: {
    baseline_scenario: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],    // Error rate <= 1%
    http_req_duration: ['p(95)<1000'], // P95 response time <= 1000ms
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

function trackResponse(res, opTrend) {
  if (opTrend) {
    opTrend.add(res.timings.duration);
  }
  if (res.status === 200) {
    status200.add(1);
    status2xx.add(1);
  } else if (res.status >= 200 && res.status < 300) {
    status2xx.add(1);
  } else if (res.status >= 400 && res.status < 500) {
    status4xx.add(1);
  } else if (res.status >= 500) {
    status5xx.add(1);
  } else if (res.status === 0) {
    connectionErrors.add(1);
  } else {
    statusOther.add(1);
  }
}

export default function () {
  const jsonHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // 1. Health availability check
  const healthRes = http.get(`${BASE_URL}/health.php`);
  trackResponse(healthRes, healthDuration);
  check(healthRes, {
    'Health check status is 200': (r) => r.status === 200,
    'Health response is OK': (r) => r.body.includes('OK'),
  });

  sleep(0.05);

  // 2. User authentication (Login page)
  const loginRes = http.get(`${BASE_URL}/login.php`);
  trackResponse(loginRes, authDuration);
  check(loginRes, {
    'Login page status is 200': (r) => r.status === 200,
    'Login page contains sign in form': (r) => r.body.includes('Sign In') || r.body.includes('login'),
  });

  sleep(0.05);

  // 3. Dataset web page request
  const datasetsRes = http.get(`${BASE_URL}/datasets.php`);
  trackResponse(datasetsRes, datasetsDuration);
  check(datasetsRes, {
    'Datasets page responds': (r) => r.status === 200 || r.status === 302,
  });

  sleep(0.05);

  // 4. Analysis / prediction web page request
  const predictRes = http.get(`${BASE_URL}/predict.php`);
  trackResponse(predictRes, predictDuration);
  check(predictRes, {
    'Predict page responds': (r) => r.status === 200 || r.status === 302,
  });

  sleep(0.05);

  // 5. Results web page request
  const resultsRes = http.get(`${BASE_URL}/results.php`);
  trackResponse(resultsRes, resultsDuration);
  check(resultsRes, {
    'Results page responds': (r) => r.status === 200 || r.status === 302,
  });

  sleep(0.1);
}

export function handleSummary(data) {
  return {
    'load_tests/results/baseline_summary.json': JSON.stringify(data, null, 2),
  };
}
