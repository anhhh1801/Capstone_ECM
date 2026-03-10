package com.extracenter.backend.service;

import com.extracenter.backend.dto.CenterRequest;
import com.extracenter.backend.entity.Center;
import com.extracenter.backend.entity.User;
import com.extracenter.backend.repository.CenterRepository;
import com.extracenter.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CenterService {

    @Autowired
    private CenterRepository centerRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. Create a new Center
    // @Transactional added: If saving the center works but updating the manager
    // fails, we roll back!
    @Transactional
    public Center createCenter(CenterRequest request) {
        User manager = userRepository.findById(request.getManagerId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getManagerId()));

        Center newCenter = new Center();
        newCenter.setName(request.getName());
        newCenter.setDescription(request.getDescription());
        newCenter.setPhoneNumber(request.getPhoneNumber());
        newCenter.setManager(manager);

        Center savedCenter = centerRepository.save(newCenter);

        // Link the manager to this center in the Many-to-Many join table
        manager.getConnectedCenters().add(savedCenter);
        userRepository.save(manager);

        return savedCenter;
    }

    // 2. Get list of all Centers
    public List<Center> getAllCenters() {
        return centerRepository.findAll();
    }

    // 3. Get Centers managed by a specific user
    public List<Center> getCentersByManager(Long managerId) {
        return centerRepository.findByManagerId(managerId);
    }

    // 4. Get Center by ID
    public Center getCenterById(Long id) {
        return centerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Center not found with ID: " + id));
    }

    // 5. Get list of Centers where a teacher is currently teaching (Guest Teacher)
    public List<Center> getCentersTeaching(Long teacherId) {
        return centerRepository.findCentersTeachingByTeacherId(teacherId);
    }

    // 6. Update Center details
    @Transactional
    public Center updateCenter(Long centerId, CenterRequest request) {
        Center center = centerRepository.findById(centerId)
                .orElseThrow(() -> new RuntimeException("Center not found!"));

        // Authorization Check: Only the assigned Manager can edit this center
        if (!center.getManager().getId().equals(request.getManagerId())) {
            throw new RuntimeException("You do not have permission to edit this center!");
        }

        center.setName(request.getName());
        center.setDescription(request.getDescription());
        center.setPhoneNumber(request.getPhoneNumber());

        return centerRepository.save(center);
    }

    // 7. Delete Center
    // @Transactional added: We run a custom query and a delete command. Both must
    // succeed together.
    @Transactional
    public void deleteCenter(Long centerId) {
        try {
            // First, remove all connections in the student_centers join table
            centerRepository.removeAllStudentLinks(centerId);
            // Then delete the center itself
            centerRepository.deleteById(centerId);
        } catch (DataIntegrityViolationException e) {
            // Catching specific database constraint errors instead of a generic Exception
            throw new RuntimeException(
                    "Cannot delete this center because it contains linked data (Courses, Enrollments, etc.)");
        } catch (Exception e) {
            throw new RuntimeException("An error occurred while deleting the center: " + e.getMessage());
        }
    }
}