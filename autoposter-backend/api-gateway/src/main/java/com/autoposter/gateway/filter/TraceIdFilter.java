package com.autoposter.gateway.filter;

import com.autoposter.shared.trace.TraceIdUtil;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class TraceIdFilter implements GlobalFilter, Ordered {

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String traceId = exchange.getRequest().getHeaders().getFirst(TraceIdUtil.HEADER_NAME);
        if (traceId == null || traceId.isBlank()) {
            traceId = TraceIdUtil.generate();
        }

        TraceIdUtil.put(traceId);

        final String finalTraceId = traceId;

        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate().header(TraceIdUtil.HEADER_NAME, finalTraceId).build();

        ServerWebExchange mutatedExchange = exchange.mutate().request(mutatedRequest).response(exchange.getResponse()).build();

        mutatedExchange.getResponse().getHeaders().add(TraceIdUtil.HEADER_NAME, finalTraceId);

        return chain.filter(mutatedExchange).doFinally(signal -> TraceIdUtil.clear());
    }
}
