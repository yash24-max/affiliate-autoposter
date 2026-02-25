package com.autoposter.gateway.filter;

import org.springframework.stereotype.Component;

// TODO: Implement GlobalFilter + Ordered (higher priority than JwtAuthFilter)
// Step 1: Check if X-Trace-Id header already present (from upstream proxy)
// Step 2: If not, generate UUID.randomUUID() as traceId
// Step 3: Add X-Trace-Id to outgoing (downstream) request
// Step 4: Add X-Trace-Id to response headers (so frontend can log it)
@Component
public class TraceIdFilter {

}
