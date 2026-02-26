package com.autoposter.gateway.config;

import org.springframework.context.annotation.Configuration;

// TODO: Redis-backed rate limiter
// KeyResolver: extract X-User-Id from request headers
// replenishRate: 10 requests/sec
// burstCapacity: 20 requests
// Redis key pattern: rate_limit:{userId}:{endpoint}
@Configuration
public class RateLimitConfig {

}
