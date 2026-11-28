import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '30s', target: 10 },
    { duration: '10s', target: 0 },
  ],

  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  const respuesta = http.get(
    'https://stockcontrol-gestion.vercel.app/home'
  );

  check(respuesta, {
    'Estado HTTP 200': (r) => r.status === 200,
    'Tiempo de respuesta menor a 2 segundos':
      (r) => r.timings.duration < 2000,
  });

  sleep(1);
}