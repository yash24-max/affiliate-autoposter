package com.autoposter.shared.trace;

import org.slf4j.MDC;

import java.util.UUID;

public final class TraceIdUtil {

    public static final String HEADER_NAME = "X-Trace-Id";
    public static final String MDC_KEY     = "traceId";

    private TraceIdUtil() {
    }

    public static String generate() {
        return UUID.randomUUID().toString();
    }

    public static void put(String traceId) {
        MDC.put(MDC_KEY, traceId);
    }

    public static String get() {
        return MDC.get(MDC_KEY);
    }

    public static void clear() {
        MDC.remove(MDC_KEY);
    }

    public static String getOrGenerate() {
        String traceId = get();
        if (traceId == null || traceId.isBlank()) {
            traceId = generate();
            put(traceId);
        }
        return traceId;
    }
}
