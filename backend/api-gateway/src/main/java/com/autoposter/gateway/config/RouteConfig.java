package com.autoposter.gateway.config;

import org.springframework.context.annotation.Configuration;

// TODO: Define all route rules here
// Routes: /api/auth/** → auth-service :8081 (public)
//         /oauth2/**   → auth-service :8081 (public)
//         /api/amazon-config/** → user-config-service :8082 (JWT required)
//         /api/telegram-config/** → user-config-service :8082 (JWT required)
//         /api/user/**  → user-config-service :8082 (JWT required)
//         /api/schedule/** → scheduler-service :8083 (JWT required)
//         /api/dashboard/** → dashboard-service :8086 (JWT required)
@Configuration
public class RouteConfig {

}
