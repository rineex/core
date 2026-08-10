---
'@rineex/cookie-parser-mw-module': minor
'@rineex/response-time-mw-module': minor
'@rineex/cors-mw-module': patch
---

Export middleware option types from Nest middleware modules and align CORS
typing with the `cors` package.

- Re-export `CookieParseOptions` from `@rineex/cookie-parser-mw-module`
- Export local `ResponseTimeOptions` from `@rineex/response-time-mw-module`
- Use `CorsOptions` from `cors` in `@rineex/cors-mw-module`
