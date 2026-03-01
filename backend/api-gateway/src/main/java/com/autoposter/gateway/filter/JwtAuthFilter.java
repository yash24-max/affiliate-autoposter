package com.autoposter.gateway.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.List;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private static final List<String> PUBLIC_PATHS = List.of("/api/auth/**", "/oauth2/**", "/actuator/**");

    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    private final ReactiveRedisTemplate<String, String> redisTemplate;
    private final ObjectMapper                          objectMapper;
    private final String                                jwtSecret;

    public JwtAuthFilter(ReactiveRedisTemplate<String, String> redisTemplate, ObjectMapper objectMapper, @Value("${jwt.secret}") String jwtSecret) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.jwtSecret = jwtSecret;
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 1;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        if (isPublicPath(path)) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return writeError(exchange, "TOKEN_MISSING", "Authorization header is required");
        }

        String token = authHeader.substring(7);
        Claims claims;
        try {
            claims = Jwts.parser().verifyWith(Keys.hmacShaKeyFor(jwtSecret.getBytes())).build().parseSignedClaims(token).getPayload();
        } catch (ExpiredJwtException e) {
            return writeError(exchange, "TOKEN_EXPIRED", "Token has expired");
        } catch (MalformedJwtException | SignatureException e) {
            return writeError(exchange, "TOKEN_INVALID", "Token is invalid");
        } catch (Exception e) {
            return writeError(exchange, "TOKEN_INVALID", "Token validation failed");
        }

        String jti = claims.getId();
        String userId = claims.getSubject();
        String email = claims.get("email", String.class);
        String plan = claims.get("plan", String.class);

        if (jti == null) {
            return passThrough(exchange, chain, userId, email, plan);
        }

        return redisTemplate.hasKey("token_blacklist:" + jti).flatMap(blacklisted -> {
            if (Boolean.TRUE.equals(blacklisted)) {
                return writeError(exchange, "TOKEN_REVOKED", "Token has been revoked");
            }
            return passThrough(exchange, chain, userId, email, plan);
        });
    }

    private Mono<Void> passThrough(ServerWebExchange exchange, GatewayFilterChain chain, String userId, String email, String plan) {
        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate().header("X-User-Id", userId != null ? userId : "")
                .header("X-User-Email", email != null ? email : "").header("X-User-Plan", plan != null ? plan : "").build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private Mono<Void> writeError(ServerWebExchange exchange, String errorCode, String message) {
        String traceId = exchange.getRequest().getHeaders().getFirst("X-Trace-Id");
        if (traceId == null)
            traceId = "unknown";

        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        ObjectNode errorNode = objectMapper.createObjectNode().put("errorCode", errorCode).put("message", message).put("traceId", traceId);

        ObjectNode body = objectMapper.createObjectNode().put("success", false);
        body.putNull("data");
        body.set("error", errorNode);
        body.put("traceId", traceId);
        body.put("timestamp", Instant.now().toString());

        byte[] bytes;
        try {
            bytes = objectMapper.writeValueAsBytes(body);
        } catch (Exception e) {
            bytes = ("{\"success\":false,\"error\":{\"errorCode\":\"" + errorCode + "\"}}").getBytes();
        }

        DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    private boolean isPublicPath(String path) {
        return PUBLIC_PATHS.stream().anyMatch(p -> PATH_MATCHER.match(p, path));
    }
}
