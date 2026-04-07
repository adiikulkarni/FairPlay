package com.gl.fairplay.userservice.repository;

import com.gl.fairplay.userservice.domain.ActivityParticipant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Activity participant persistence operations.
 */
public interface ActivityParticipantRepository extends JpaRepository<ActivityParticipant, Long> {

    boolean existsByActivityIdAndUserId(Long activityId, Long userId);

    long countByActivityId(Long activityId);

    List<ActivityParticipant> findByActivityId(Long activityId);
}
