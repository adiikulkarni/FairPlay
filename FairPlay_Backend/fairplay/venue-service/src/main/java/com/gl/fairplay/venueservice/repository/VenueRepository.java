package com.gl.fairplay.venueservice.repository;

import com.gl.fairplay.venueservice.domain.Venue;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Venue persistence operations.
 */
public interface VenueRepository extends JpaRepository<Venue, Long> {

    List<Venue> findByOwnerId(Long ownerId);
}
