package com.gl.fairplay.userservice.common;

/**
 * Raised when a unique resource already exists.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
