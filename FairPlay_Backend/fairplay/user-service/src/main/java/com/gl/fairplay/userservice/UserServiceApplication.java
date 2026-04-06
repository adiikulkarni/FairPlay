package com.gl.fairplay.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * FairPlay user service application.
 */
@SpringBootApplication
public class UserServiceApplication {

    /**
     * Starts the user service.
     *
     * @param args application arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
