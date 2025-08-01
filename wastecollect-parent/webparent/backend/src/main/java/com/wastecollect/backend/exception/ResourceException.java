package com.wastecollect.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND) // This makes it return 404 Not Found by default
public class ResourceException extends RuntimeException {

    private String resourceName;
    private String fieldName;
    private String fieldValue;
    private String message; // Added field for a more detailed message

    public ResourceException(String resourceName, String fieldName, String fieldValue) {
        super(String.format("%s not found with %s : '%s'", resourceName, fieldName, fieldValue));
        this.resourceName = resourceName;
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
        this.message = String.format("%s not found with %s : '%s'", resourceName, fieldName, fieldValue); // Default message
    }

    public ResourceException(String resourceName, String fieldValue) {
        super(String.format("%s not found with ID : '%s' (%s)", resourceName, fieldValue));
        this.resourceName = resourceName;
        this.fieldValue = fieldValue;
        this.fieldName = "id"; // Default field name to "id"
        this.message = String.format("%s not found with ID : '%s'", resourceName, fieldValue); // Default message
    }

    // NEW CONSTRUCTOR to handle the fourth argument (e.g., "not found", "already exists")
    public ResourceException(String resourceName, String fieldName, String fieldValue, String detailMessage) {
        super(String.format("%s %s with %s : '%s'", resourceName, detailMessage, fieldName, fieldValue));
        this.resourceName = resourceName;
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
        this.message = String.format("%s %s with %s : '%s'", resourceName, detailMessage, fieldName, fieldValue);
    }

    // Getter for the new message field if you want to expose it
    @Override // Override the getMessage() method from Throwable
    public String getMessage() {
        return message;
    }

    // You can add getters if needed
    public String getResourceName() {
        return resourceName;
    }

    public String getFieldName() {
        return fieldName;
    }

    public String getFieldValue() {
        return fieldValue;
    }
}