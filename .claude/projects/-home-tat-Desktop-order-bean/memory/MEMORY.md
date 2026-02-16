## Project Notes

### Package Manager
- Use **pnpm** (not npm) - npm has issues with this project (`Cannot read properties of null`)

### Key Patterns
- Rate limiting: `lib/rate-limit.ts` uses `@upstash/ratelimit` with existing Redis client from `lib/redis.ts`
- Pagination: Products use offset-based (`?page=1&limit=12`), Orders use cursor-based (`?cursor=<id>&limit=10`)
- API response format includes `pagination` object with `hasMore`, `total`, etc.
