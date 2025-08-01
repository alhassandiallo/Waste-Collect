package com.wastecollect.backend.exception;

public class WasteCollectException extends RuntimeException {

    private final String errorCode;
    private final String errorMessage;

    public WasteCollectException(String errorCode, String errorMessage) {
        super(errorMessage);
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}