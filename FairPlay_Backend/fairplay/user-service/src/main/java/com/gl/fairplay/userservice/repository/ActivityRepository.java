package com.gl.fairplay.userservice.repository;

import com.gl.fairplay.userservice.domain.Activity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Activity persistence operations.
 */
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findAllByOrderByTimeAsc();
}
