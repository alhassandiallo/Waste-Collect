package com.wastecollect.backend.exception;

public class RequestValidationException extends WasteCollectException {

    public RequestValidationException(String field, String value, String validReason) {
        super("INVALID_REQUEST", String.format("Field %s with value %s is invalid. %s", field, value, validReason));
    }

    public RequestValidationException(String message) {
        super("INVALID_REQUEST", message);
    }
}