package com.gl.fairplay.venueservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * FairPlay venue service application.
 */
@SpringBootApplication
@EnableFeignClients
public class VenueServiceApplication {

    /**
     * Starts the venue service.
     *
     * @param args application arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(VenueServiceApplication.class, args);
    }
}
