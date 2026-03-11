package com.extracenter.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.extracenter.backend.dto.CenterRequest;
import com.extracenter.backend.dto.ClassroomRequest;
import com.extracenter.backend.entity.Center;
import com.extracenter.backend.entity.Classroom;
import com.extracenter.backend.entity.Grade;
import com.extracenter.backend.entity.Subject;
import com.extracenter.backend.entity.User;
import com.extracenter.backend.repository.CenterRepository;
import com.extracenter.backend.repository.ClassroomRepository;
import com.extracenter.backend.repository.GradeRepository;
import com.extracenter.backend.repository.SubjectRepository;
import com.extracenter.backend.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CenterService {

    @Autowired
    private CenterRepository centerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private ClassroomRepository classroomRepository;

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

    // Subject / Grade management for a Center
    public List<Subject> getSubjectsByCenter(Long centerId) {
        return subjectRepository.findByCenterId(centerId);
    }

    public Subject createSubject(Long centerId, String name, String description) {
        Center center = centerRepository.findById(centerId)
                .orElseThrow(() -> new RuntimeException("Trung tâm không tồn tại!"));

        Subject subject = new Subject();
        subject.setName(name);
        subject.setDescription(description);
        subject.setCenter(center);

        return subjectRepository.save(subject);
    }

    public Subject updateSubject(Long centerId, Long subjectId, String name, String description) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Môn học không tồn tại!"));

        if (!subject.getCenter().getId().equals(centerId)) {
            throw new RuntimeException("Môn học không thuộc trung tâm này.");
        }

        subject.setName(name);
        subject.setDescription(description);

        return subjectRepository.save(subject);
    }

    public void deleteSubject(Long centerId, Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Môn học không tồn tại!"));

        if (!subject.getCenter().getId().equals(centerId)) {
            throw new RuntimeException("Môn học không thuộc trung tâm này.");
        }

        subjectRepository.delete(subject);
    }

    public List<Grade> getGradesByCenter(Long centerId) {
        return gradeRepository.findByCenterId(centerId);
    }

    private void validateAge(Integer age, String fieldName) {
        if (age != null) {
            if (age < 3 || age > 100) {
                throw new RuntimeException(fieldName + " must be between 3 and 100.");
            }
        }
    }

    public Grade createGrade(Long centerId, String name, Integer fromAge, Integer toAge, String description) {
        Center center = centerRepository.findById(centerId)
                .orElseThrow(() -> new RuntimeException("Center does not exist!"));

        validateAge(fromAge, "From age");
        validateAge(toAge, "To age");
        if (fromAge != null && toAge != null && fromAge > toAge) {
            throw new RuntimeException("From age must be less than or equal to To age.");
        }

        Grade grade = new Grade();
        grade.setName(name);
        grade.setFromAge(fromAge);
        grade.setToAge(toAge);
        grade.setDescription(description);
        grade.setCenter(center);

        return gradeRepository.save(grade);
    }

    public Grade updateGrade(Long centerId, Long gradeId, String name, Integer fromAge, Integer toAge,
            String description) {
        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new RuntimeException("Grade does not exist!"));

        if (!grade.getCenter().getId().equals(centerId)) {
            throw new RuntimeException("Grade does not belong to this center.");
        }

        validateAge(fromAge, "From age");
        validateAge(toAge, "To age");
        if (fromAge != null && toAge != null && fromAge > toAge) {
            throw new RuntimeException("From age must be less than or equal to To age.");
        }

        grade.setName(name);
        grade.setFromAge(fromAge);
        grade.setToAge(toAge);
        grade.setDescription(description);

        return gradeRepository.save(grade);
    }

    public void deleteGrade(Long centerId, Long gradeId) {
        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new RuntimeException("Khối lớp không tồn tại!"));

        if (!grade.getCenter().getId().equals(centerId)) {
            throw new RuntimeException("Khối lớp không thuộc trung tâm này.");
        }

        gradeRepository.delete(grade);
    }

    // 2. Cập nhật Trung tâm
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

    private Center getOwnedCenter(Long centerId, Long managerId) {
        Center center = centerRepository.findById(centerId)
                .orElseThrow(() -> new RuntimeException("Center not found with ID: " + centerId));

        if (!center.getManager().getId().equals(managerId)) {
            throw new RuntimeException("Only the center owner can manage classrooms.");
        }

        return center;
    }

    public List<Classroom> getClassroomsByCenter(Long centerId) {
        return classroomRepository.findByCenterId(centerId);
    }

    @Transactional
    public Classroom createClassroom(Long centerId, ClassroomRequest request) {
        Center center = getOwnedCenter(centerId, request.getManagerId());

        Classroom classroom = new Classroom();
        classroom.setSeat(request.getSeat());
        classroom.setLocation(request.getLocation());
        classroom.setLastMaintainDate(request.getLastMaintainDate());
        classroom.setCenter(center);

        return classroomRepository.save(classroom);
    }

    @Transactional
    public Classroom updateClassroom(Long centerId, Long classroomId, ClassroomRequest request) {
        getOwnedCenter(centerId, request.getManagerId());

        Classroom classroom = classroomRepository.findByIdAndCenterId(classroomId, centerId)
                .orElseThrow(() -> new RuntimeException("Classroom not found in this center."));

        classroom.setSeat(request.getSeat());
        classroom.setLocation(request.getLocation());
        classroom.setLastMaintainDate(request.getLastMaintainDate());

        return classroomRepository.save(classroom);
    }

    @Transactional
    public void deleteClassroom(Long centerId, Long classroomId, Long managerId) {
        getOwnedCenter(centerId, managerId);

        Classroom classroom = classroomRepository.findByIdAndCenterId(classroomId, centerId)
                .orElseThrow(() -> new RuntimeException("Classroom not found in this center."));

        classroomRepository.delete(classroom);
    }
}