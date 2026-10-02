# NestJS integrations

These packages use Nest configurable modules and apply their middleware to all
routes. Install the package together with the peer dependencies shown in its
`package.json`.

## Redis

`RedisModule.register(options, { connection })` configures a single Redis
URL/options object or a cluster-node list. Inject the created client with
`@InjectRedis()` or `@InjectRedis('name')`. `RedisHealthModule` exposes
`RedisHealthIndicator.isHealthy(key)` for Terminus health checks.

## PostgreSQL with Slonik

Register each named pool and inject it by name:

```ts
@Module({
  imports: [
    SlonikModule.register({
      connections: [{ name: 'DEFAULT', dsn: process.env.DATABASE_URL! }],
    }),
  ],
})
export class AppModule {}

class Repository {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}
}
```

Pools are verified during creation, retried on connection failure (nine retries
with a three-second delay by default), and closed during application shutdown.
`SlonikModule` is global by default.

## HTTP middleware modules

All modules use `register` or `registerAsync` from Nest's
`ConfigurableModuleBuilder` and attach middleware to `'*'` routes.

| Module         | Export                | Underlying package |
| -------------- | --------------------- | ------------------ |
| Cookie parser  | `CookieParserModule`  | `cookie-parser`    |
| CORS           | `CorsModule`          | `cors`             |
| Helmet         | `HelmetModule`        | `helmet`           |
| Ignore favicon | `IgnoreFaviconModule` | built in           |
| Response time  | `ResponseTimeModule`  | `response-time`    |

`CorsModule` defaults to credentials enabled, standard allowed methods/headers,
and `204` for preflight responses; supplied options override those defaults.
`IgnoreFaviconModule` responds with `204` when a request URL includes
`favicon.ico`. Response-time options are `digits`, `header`, and `suffix`.
