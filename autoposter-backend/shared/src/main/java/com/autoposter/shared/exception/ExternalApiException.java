package com.autoposter.shared.exception;

public class ExternalApiException extends RuntimeException {

    private final String apiName;

    public ExternalApiException(String apiName, String message) {
        super("[" + apiName + "] " + message);
        this.apiName = apiName;
    }

    public ExternalApiException(String apiName, String message, Throwable cause) {
        super("[" + apiName + "] " + message, cause);
        this.apiName = apiName;
    }

    public String getApiName() {
        return apiName;
    }
}
