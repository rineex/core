export const ALLOWED_HEADERS = [
  'Accept',
  'Accept-Language',
  'Content-Language',
  'Content-Type',
  'Origin',
  'Authorization',
  'Access-Control-Request-Method',
  'Access-Control-Request-Headers',
  'Access-Control-Allow-Headers',
  'Access-Control-Allow-Origin',
  'Access-Control-Allow-Methods',
  'Access-Control-Allow-Credentials',
  'Access-Control-Expose-Headers',
  'Access-Control-Max-Age',
  'Referer',
  'Host',
  'X-Requested-With',
  'x-timestamp',
  'x-timezone',
  'x-request-id',
  'x-repo-version',
  'X-Response-Time',
  'user-agent',
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-proto',
  'x-real-ip',
  'x-real-host',
  'x-real-proto',
  'x-api-key',
  'x-device-fingerprint',
  'x-api-version',
];

export const RequestMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD',
} as const;
export type RequestMethods =
  (typeof RequestMethods)[keyof typeof RequestMethods];

export const ALLOWED_METHODS = [
  RequestMethods.GET,
  RequestMethods.DELETE,
  RequestMethods.PUT,
  RequestMethods.PATCH,
  RequestMethods.POST,
];
