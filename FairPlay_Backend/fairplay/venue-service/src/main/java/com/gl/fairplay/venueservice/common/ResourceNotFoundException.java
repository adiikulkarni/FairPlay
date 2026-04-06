package com.gl.fairplay.venueservice.common;

/**
 * Raised when a resource cannot be found.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
