package com.autoposter.gateway.config;

import org.springframework.context.annotation.Configuration;

// TODO: Allow frontend origin, set allowed methods/headers
// Allowed origins: FRONTEND_ORIGIN env var (e.g. http://localhost:5173)
// Allowed methods: GET, POST, PUT, DELETE, OPTIONS
// Allowed headers: Authorization, Content-Type, X-Trace-Id
// Exposed headers: X-Trace-Id
@Configuration
public class CorsConfig {

}
