package com.autoposter.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // Auth (401, 403)
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS"),
    USER_ALREADY_EXISTS(HttpStatus.CONFLICT, "USER_ALREADY_EXISTS"),
    EMAIL_NOT_VERIFIED(HttpStatus.FORBIDDEN, "EMAIL_NOT_VERIFIED"),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "TOKEN_EXPIRED"),
    TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "TOKEN_INVALID"),
    UNAUTHORIZED(HttpStatus.FORBIDDEN, "UNAUTHORIZED"),

    // Resources (404, 400)
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND"),
    AMAZON_CONFIG_NOT_FOUND(HttpStatus.NOT_FOUND, "AMAZON_CONFIG_NOT_FOUND"),
    TELEGRAM_CONFIG_NOT_FOUND(HttpStatus.NOT_FOUND, "TELEGRAM_CONFIG_NOT_FOUND"),
    TELEGRAM_INVALID_TOKEN(HttpStatus.BAD_REQUEST, "TELEGRAM_INVALID_TOKEN"),
    TELEGRAM_NOT_ADMIN(HttpStatus.BAD_REQUEST, "TELEGRAM_NOT_ADMIN"),

    // Business Limits (429)
    PLAN_LIMIT_REACHED(HttpStatus.TOO_MANY_REQUESTS, "PLAN_LIMIT_REACHED"),

    // General (400, 500)
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR");

    private final HttpStatus httpStatus;
    private final String     code;

    ErrorCode(HttpStatus httpStatus, String code) {
        this.httpStatus = httpStatus;
        this.code = code;
    }
}
