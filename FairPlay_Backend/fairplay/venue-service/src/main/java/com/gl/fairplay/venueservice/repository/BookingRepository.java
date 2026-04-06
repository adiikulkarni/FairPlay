package com.gl.fairplay.venueservice.repository;

import com.gl.fairplay.venueservice.domain.Booking;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Booking persistence operations.
 */
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderBySlotTimeDesc(Long userId);

    List<Booking> findByVenueIdIn(Collection<Long> venueIds);
}
