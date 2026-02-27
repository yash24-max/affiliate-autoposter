package com.autoposter.common.exception;

import lombok.Getter;

/**
 * Standard base exception for all custom business and system errors.
 */
@Getter
public class AppException extends RuntimeException {

    private final ErrorCode errorCode;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getCode());
        this.errorCode = errorCode;
    }

    public AppException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public AppException(ErrorCode errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
}
