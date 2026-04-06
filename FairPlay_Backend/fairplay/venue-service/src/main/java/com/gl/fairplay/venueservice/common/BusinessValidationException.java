package com.gl.fairplay.venueservice.common;

/**
 * Raised when domain validation fails.
 */
public class BusinessValidationException extends RuntimeException {

    public BusinessValidationException(String message) {
        super(message);
    }
}
