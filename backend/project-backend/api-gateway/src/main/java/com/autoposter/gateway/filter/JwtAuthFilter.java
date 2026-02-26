package com.autoposter.gateway.filter;

import org.springframework.stereotype.Component;

// TODO: Implement GlobalFilter + Ordered
// Step 1: Skip public routes (/api/auth/**, /oauth2/**)
// Step 2: Extract Bearer token from Authorization header
// Step 3: Validate JWT signature + expiry using jjwt
// Step 4: Check Redis token_blacklist:{jti} (logout support)
// Step 5: Inject X-User-Id and X-User-Email into downstream request headers
// Step 6: Inject X-Trace-Id (read from TraceIdFilter)
// Returns 401 on any validation failure
@Component
public class JwtAuthFilter {

}
