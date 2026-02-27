package com.autoposter.common.exception;

import com.autoposter.common.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Common exception handler for all services to provide consistent error responses.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Custom Application Exceptions (Business and System)
     */
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        log.warn("Application exception [{}]: {}", ex.getErrorCode().getCode(), ex.getMessage());
        ErrorCode errorCode = ex.getErrorCode();
        return ResponseEntity.status(errorCode.getHttpStatus())
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .error(new ApiResponse.ApiError(errorCode.getCode(), ex.getMessage(), null))
                        .build());
    }

    /**
     * Validation Errors (MethodArgumentNotValidException)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("Validation error: {}", errors);
        return ResponseEntity.badRequest()
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .error(new ApiResponse.ApiError(ErrorCode.VALIDATION_ERROR.getCode(), "Validation failed", errors))
                        .build());
    }

    /**
     * Fallback for all other exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Unexpected exception occurred", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .error(new ApiResponse.ApiError(ErrorCode.INTERNAL_ERROR.getCode(), "An internal server error occurred", null))
                        .build());
    }
}
