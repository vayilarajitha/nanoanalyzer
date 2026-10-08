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
    load_test_100_vus: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 25 },  // Stage 1: Gradual ramp to 25 VUs
        { duration: '15s', target: 75 },  // Stage 2: Scale up to 75 VUs
        { duration: '15s', target: 100 }, // Stage 3: Peak load 100 concurrent VUs
        { duration: '15s', target: 0 },   // Stage 4: Controlled ramp-down
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],    // Error rate <= 1%
    http_req_duration: ['p(95)<1000'], // P95 response time <= 1000ms (1s)
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

  // 1. Health / API availability check
  const healthRes = http.get(`${BASE_URL}/api/health.php`);
  trackResponse(healthRes, healthDuration);
  check(healthRes, {
    'Health check status is 200': (r) => r.status === 200,
    'Health response is healthy': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === 'healthy';
      } catch (e) {
        return false;
      }
    },
  });

  sleep(0.05);

  // 2. User authentication (Login flow)
  const loginPayload = JSON.stringify({
    action: 'login',
    email: 'alex@nanoanalyzer.io',
    password: 'researcher123',
  });

  const authRes = http.post(`${BASE_URL}/api/auth.php`, loginPayload, {
    headers: jsonHeaders,
  });
  trackResponse(authRes, authDuration);

  let userId = '';
  check(authRes, {
    'Auth status is 200': (r) => r.status === 200,
    'Auth returned user ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        if (body.status === 'success' && body.user && body.user.id) {
          userId = body.user.id;
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    },
  });

  const authHeaders = {
    ...jsonHeaders,
    'X-User-Id': userId || 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Authorization': `Bearer ${userId || 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'}`,
  };

  sleep(0.05);

  // 3. Dataset / API request
  const datasetsRes = http.get(`${BASE_URL}/api/datasets.php`, {
    headers: authHeaders,
  });
  trackResponse(datasetsRes, datasetsDuration);
  check(datasetsRes, {
    'Datasets status is 200': (r) => r.status === 200,
    'Datasets returned valid list': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === 'success' && Array.isArray(body.datasets);
      } catch (e) {
        return false;
      }
    },
  });

  sleep(0.05);

  // 4. Analysis / prediction request using valid test input
  // Realistic scientific input variations
  const sizes = [35.0, 45.0, 50.0, 65.0, 80.0];
  const materials = ['Gold (Au)', 'Liposome', 'PLGA Polymer', 'Silica (SiO2)', 'Iron Oxide (Fe3O4)'];
  const shapes = ['Spherical', 'Rod / Nanorod', 'Cube / Cubic', 'Star / Nanostar'];
  
  const chosenSize = sizes[Math.floor(Math.random() * sizes.length)];
  const chosenMaterial = materials[Math.floor(Math.random() * materials.length)];
  const chosenShape = shapes[Math.floor(Math.random() * shapes.length)];

  const predictPayload = JSON.stringify({
    analysis_name: `Concurrent Load Run (${chosenMaterial} - ${chosenSize}nm)`,
    nanoparticle_size: chosenSize,
    material: chosenMaterial,
    shape: chosenShape,
    charge: 19.5,
    concentration: 50.0,
    cell_type: 'HeLa',
    exposure_time: 6.0,
  });

  const predictRes = http.post(`${BASE_URL}/api/predict.php`, predictPayload, {
    headers: authHeaders,
  });
  trackResponse(predictRes, predictDuration);

  let resultId = '';
  check(predictRes, {
    'Predict status is 200': (r) => r.status === 200,
    'Predict returned valid result ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        if (body.status === 'success' && body.id) {
          resultId = body.id;
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    },
  });

  sleep(0.05);

  // 5. Retrieve analysis result
  if (resultId) {
    const resultRes = http.get(`${BASE_URL}/api/results.php?id=${resultId}`, {
      headers: authHeaders,
    });
    trackResponse(resultRes, resultsDuration);
    check(resultRes, {
      'Retrieve result status is 200': (r) => r.status === 200,
      'Retrieve result payload matches ID': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.status === 'success' && body.data && body.data.id === resultId;
        } catch (e) {
          return false;
        }
      },
    });
  }

  sleep(0.1);
}

export function handleSummary(data) {
  return {
    'load_tests/results/load_summary.json': JSON.stringify(data, null, 2),
  };
}
