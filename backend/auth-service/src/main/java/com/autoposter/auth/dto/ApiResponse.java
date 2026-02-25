package com.autoposter.auth.dto;

import java.time.OffsetDateTime;
import java.util.Objects;

public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final ErrorResponse error;
    private final String traceId;
    private final OffsetDateTime timestamp;

    private ApiResponse(boolean success, T data, ErrorResponse error, String traceId) {
        this.success = success;
        this.data = data;
        this.error = error;
        this.traceId = traceId;
        this.timestamp = OffsetDateTime.now();
    }

    public static <T> ApiResponse<T> success(T data, String traceId) {
        return new ApiResponse<>(true, data, null, traceId);
    }

    public static <T> ApiResponse<T> failure(ErrorResponse error, String traceId) {
        Objects.requireNonNull(error, "error must not be null");
        return new ApiResponse<>(false, null, error, traceId);
    }

    public boolean isSuccess() {
        return success;
    }

    public T getData() {
        return data;
    }

    public ErrorResponse getError() {
        return error;
    }

    public String getTraceId() {
        return traceId;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }
}
