package com.autoposter.common.dto;

import com.autoposter.common.trace.TraceIdUtil;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean       success;
    private final T             data;
    private final ApiError      error;
    @Builder.Default
    private final String        traceId = TraceIdUtil.getOrGenerate();
    @Builder.Default
    private final LocalDateTime timestamp = LocalDateTime.now();

    public static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(new ApiError(code, message, null))
                .build();
    }

    public static <T> ApiResponse<T> error(String code, String message, Map<String, String> fieldErrors) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(new ApiError(code, message, fieldErrors))
                .build();
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ApiError(String errorCode, String message, Map<String, String> fieldErrors) {
    }
}
