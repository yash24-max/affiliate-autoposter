package com.autoposter.shared.dto;

import lombok.Getter;

import java.time.Instant;

@Getter
public class ErrorResponse {

    private final String  errorCode;
    private final String  message;
    private final String  traceId;
    private final Instant timestamp;

    public ErrorResponse(String errorCode, String message, String traceId) {
        this.errorCode = errorCode;
        this.message = message;
        this.traceId = traceId;
        this.timestamp = Instant.now();
    }
}
