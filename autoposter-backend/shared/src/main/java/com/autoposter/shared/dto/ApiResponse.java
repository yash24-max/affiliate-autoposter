package com.autoposter.shared.dto;

import lombok.Getter;

import java.time.Instant;

@Getter
public class ApiResponse<T> {

    private final T data;
    private final String traceId;
    private final Instant timestamp;

    private ApiResponse(T data, String traceId) {
        this.data = data;
        this.traceId = traceId;
        this.timestamp = Instant.now();
    }

    public static <T> ApiResponse<T> ok(T data, String traceId) {
        return new ApiResponse<>(data, traceId);
    }

    public static <T> ApiResponse<T> error(String traceId) {
        return new ApiResponse<>(null, traceId);
    }
}
