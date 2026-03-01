package com.autoposter.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RouteConfig {

    private final RedisRateLimiter redisRateLimiter;
    private final KeyResolver keyResolver;

    public RouteConfig(RedisRateLimiter redisRateLimiter, KeyResolver keyResolver) {
        this.redisRateLimiter = redisRateLimiter;
        this.keyResolver = keyResolver;
    }

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()

                // Public: auth endpoints — JwtAuthFilter skips these
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .filters(f -> f.requestRateLimiter(c -> c
                                .setRateLimiter(redisRateLimiter)
                                .setKeyResolver(keyResolver)))
                        .uri("lb://auth-service"))

                // Protected: Amazon config
                .route("user-config-amazon", r -> r
                        .path("/api/amazon-config/**")
                        .filters(f -> f.requestRateLimiter(c -> c
                                .setRateLimiter(redisRateLimiter)
                                .setKeyResolver(keyResolver)))
                        .uri("lb://user-config-service"))

                // Protected: Telegram config
                .route("user-config-telegram", r -> r
                        .path("/api/telegram-config/**")
                        .filters(f -> f.requestRateLimiter(c -> c
                                .setRateLimiter(redisRateLimiter)
                                .setKeyResolver(keyResolver)))
                        .uri("lb://user-config-service"))

                // Protected: Schedule management
                .route("scheduler-service", r -> r
                        .path("/api/schedule/**")
                        .filters(f -> f.requestRateLimiter(c -> c
                                .setRateLimiter(redisRateLimiter)
                                .setKeyResolver(keyResolver)))
                        .uri("lb://scheduler-service"))

                // Protected: Dashboard
                .route("dashboard-service", r -> r
                        .path("/api/dashboard/**")
                        .filters(f -> f.requestRateLimiter(c -> c
                                .setRateLimiter(redisRateLimiter)
                                .setKeyResolver(keyResolver)))
                        .uri("lb://dashboard-service"))

                .build();
    }
}
