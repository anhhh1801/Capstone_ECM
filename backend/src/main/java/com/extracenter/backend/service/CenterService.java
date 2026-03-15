package com.extracenter.backend.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.extracenter.backend.dto.CenterRequest;
import com.extracenter.backend.dto.ClassSlotOccurrenceOverrideRequest;
import com.extracenter.backend.dto.ClassSlotRequest;
import com.extracenter.backend.dto.ClassroomRequest;
import com.extracenter.backend.entity.Center;
import com.extracenter.backend.entity.ClassSlot;
import com.extracenter.backend.entity.Classroom;
import com.extracenter.backend.entity.Course;
import com.extracenter.backend.entity.Grade;
import com.extracenter.backend.entity.Subject;
import com.extracenter.backend.entity.User;
import com.extracenter.backend.repository.CenterRepository;
import com.extracenter.backend.repository.ClassSlotRepository;
import com.extracenter.backend.repository.ClassroomRepository;
import com.extracenter.backend.repository.CourseRepository;
import com.extracenter.backend.repository.GradeRepository;
import com.extracenter.backend.repository.SubjectRepository;
import com.extracenter.backend.repository.UserRepository;

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

    @Autowired
    private ClassSlotRepository classSlotRepository;

    @Autowired
    private CourseRepository courseRepository;

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

    public List<ClassSlot> getClassSlotsByCenter(Long centerId) {
        return classSlotRepository.findByCenterId(centerId);
    }

    @Transactional
    public ClassSlot createClassSlot(Long centerId, ClassSlotRequest request) {
        Center center = getOwnedCenter(centerId, request.getManagerId());

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found."));

        if (!course.getCenter().getId().equals(centerId)) {
            throw new RuntimeException("Course does not belong to this center.");
        }

        Classroom classroom = null;
        if (request.getClassroomId() != null) {
            classroom = classroomRepository.findByIdAndCenterId(request.getClassroomId(), centerId)
                    .orElseThrow(() -> new RuntimeException("Classroom not found in this center."));
        }

        validateSlotTimes(request.getStartTime(), request.getEndTime());
        validateNoTimeConflicts(
            centerId,
            request.getCourseId(),
            request.getClassroomId(),
            course.getStartDate(),
            course.getEndDate(),
            request.getStartTime(),
            request.getEndTime(),
            request.getDaysOfWeek(),
            null);

        ClassSlot slot = new ClassSlot();
        slot.setCenter(center);
        slot.setCourse(course);
        slot.setClassroom(classroom);
        slot.setStartDate(course.getStartDate());
        slot.setEndDate(course.getEndDate());
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        slot.setDaysOfWeek(request.getDaysOfWeek());
        slot.setIsRecurring(Boolean.TRUE.equals(request.getRecurring()) || request.getRecurring() == null);

        return classSlotRepository.save(slot);
    }

    @Transactional
    public ClassSlot updateClassSlot(Long centerId, Long slotId, ClassSlotRequest request) {
        getOwnedCenter(centerId, request.getManagerId());

        ClassSlot slot = classSlotRepository.findByIdAndCenterId(slotId, centerId)
                .orElseThrow(() -> new RuntimeException("ClassSlot not found in this center."));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found."));

        if (!course.getCenter().getId().equals(centerId)) {
            throw new RuntimeException("Course does not belong to this center.");
        }

        Classroom classroom = null;
        if (request.getClassroomId() != null) {
            classroom = classroomRepository.findByIdAndCenterId(request.getClassroomId(), centerId)
                    .orElseThrow(() -> new RuntimeException("Classroom not found in this center."));
        }

        validateSlotTimes(request.getStartTime(), request.getEndTime());
        validateNoTimeConflicts(
            centerId,
            request.getCourseId(),
            request.getClassroomId(),
            course.getStartDate(),
            course.getEndDate(),
            request.getStartTime(),
            request.getEndTime(),
            request.getDaysOfWeek(),
            slotId);

        slot.setCourse(course);
        slot.setClassroom(classroom);
        slot.setStartDate(course.getStartDate());
        slot.setEndDate(course.getEndDate());
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        slot.setDaysOfWeek(request.getDaysOfWeek());
        slot.setIsRecurring(Boolean.TRUE.equals(request.getRecurring()) || request.getRecurring() == null);

        return classSlotRepository.save(slot);
    }

    @Transactional
    public void deleteClassSlot(Long centerId, Long slotId, Long managerId) {
        getOwnedCenter(centerId, managerId);

        ClassSlot slot = classSlotRepository.findByIdAndCenterId(slotId, centerId)
                .orElseThrow(() -> new RuntimeException("ClassSlot not found in this center."));

        classSlotRepository.delete(slot);
    }

    @Transactional
    public void deleteClassSlotOccurrence(Long centerId, Long slotId, LocalDate date, Long managerId) {
        getOwnedCenter(centerId, managerId);

        ClassSlot slot = classSlotRepository.findByIdAndCenterId(slotId, centerId)
                .orElseThrow(() -> new RuntimeException("ClassSlot not found in this center."));

        if (!isDateWithinRange(date, slot.getStartDate(), slot.getEndDate())) {
            throw new RuntimeException("Selected date is outside the class slot date range.");
        }

        if (!isSlotScheduledOnDate(slot, date)) {
            throw new RuntimeException("This class slot does not run on the selected date.");
        }

        if (slot.getExcludedDates() == null) {
            slot.setExcludedDates(new HashSet<>());
        }

        slot.getExcludedDates().add(date);
        classSlotRepository.save(slot);
    }

    @Transactional
    public ClassSlot overrideClassSlotOccurrence(
            Long centerId,
            Long slotId,
            LocalDate date,
            ClassSlotOccurrenceOverrideRequest request) {

        getOwnedCenter(centerId, request.getManagerId());

        ClassSlot slot = classSlotRepository.findByIdAndCenterId(slotId, centerId)
                .orElseThrow(() -> new RuntimeException("ClassSlot not found in this center."));

        if (!isDateWithinRange(date, slot.getStartDate(), slot.getEndDate())) {
            throw new RuntimeException("Selected date is outside the class slot date range.");
        }

        if (!isSlotScheduledOnDate(slot, date)) {
            throw new RuntimeException("This class slot does not run on the selected date.");
        }

        validateSlotTimes(request.getStartTime(), request.getEndTime());

        Classroom overrideClassroom = null;
        if (request.getClassroomId() != null) {
            overrideClassroom = classroomRepository.findByIdAndCenterId(request.getClassroomId(), centerId)
                    .orElseThrow(() -> new RuntimeException("Classroom not found in this center."));
        }

        Set<DayOfWeek> singleDay = new HashSet<>();
        singleDay.add(date.getDayOfWeek());

        validateNoTimeConflicts(
                centerId,
                slot.getCourse() != null ? slot.getCourse().getId() : null,
                request.getClassroomId(),
                date,
                date,
                request.getStartTime(),
                request.getEndTime(),
                singleDay,
                slotId);

        if (slot.getExcludedDates() == null) {
            slot.setExcludedDates(new HashSet<>());
        }
        slot.getExcludedDates().add(date);
        classSlotRepository.save(slot);

        ClassSlot overrideSlot = new ClassSlot();
        overrideSlot.setCenter(slot.getCenter());
        overrideSlot.setCourse(slot.getCourse());
        overrideSlot.setClassroom(overrideClassroom);
        overrideSlot.setStartDate(date);
        overrideSlot.setEndDate(date);
        overrideSlot.setStartTime(request.getStartTime());
        overrideSlot.setEndTime(request.getEndTime());
        overrideSlot.setDaysOfWeek(singleDay);
        overrideSlot.setIsRecurring(false);

        return classSlotRepository.save(overrideSlot);
    }

    private void validateSlotTimes(LocalTime startTime, LocalTime endTime) {
        LocalTime earliestAllowed = LocalTime.of(7, 0);
        LocalTime latestAllowed = LocalTime.of(22, 0);

        if (startTime == null || endTime == null) {
            throw new RuntimeException("Start time and end time are required.");
        }

        if (startTime.isBefore(earliestAllowed) || endTime.isAfter(latestAllowed)) {
            throw new RuntimeException("Class time must be between 7:00 AM and 10:00 PM.");
        }

        if (!(startTime.getMinute() == 0 || startTime.getMinute() == 30)
                || !(endTime.getMinute() == 0 || endTime.getMinute() == 30)) {
            throw new RuntimeException("Time must be on 30-minute boundaries (:00 or :30).");
        }

        if (!endTime.isAfter(startTime)) {
            throw new RuntimeException("End time must be after start time.");
        }
    }

    private void validateNoTimeConflicts(
            Long centerId,
            Long requestCourseId,
            Long requestClassroomId,
            LocalDate requestStartDate,
            LocalDate requestEndDate,
            LocalTime requestStartTime,
            LocalTime requestEndTime,
            Set<DayOfWeek> requestDays,
            Long excludeSlotId) {

        List<ClassSlot> existingSlots = classSlotRepository.findByCenterId(centerId);

        for (ClassSlot existing : existingSlots) {
            if (excludeSlotId != null && excludeSlotId.equals(existing.getId())) {
                continue;
            }

            if (!dateRangesOverlap(requestStartDate, requestEndDate, existing.getStartDate(), existing.getEndDate())) {
                continue;
            }

            if (!daySetsOverlap(requestDays, getEffectiveDays(existing))) {
                continue;
            }

            if (!timeRangesOverlap(requestStartTime, requestEndTime, existing.getStartTime(), existing.getEndTime())) {
                continue;
            }

            Long existingCourseId = existing.getCourse() != null ? existing.getCourse().getId() : null;
            Long existingClassroomId = existing.getClassroom() != null ? existing.getClassroom().getId() : null;

            if (requestCourseId != null && requestCourseId.equals(existingCourseId)) {
                throw new RuntimeException("This course already has another class slot at the same time.");
            }

            if (requestClassroomId != null && requestClassroomId.equals(existingClassroomId)) {
                throw new RuntimeException("This classroom is already occupied at the selected time.");
            }
        }
    }

    private boolean timeRangesOverlap(LocalTime startA, LocalTime endA, LocalTime startB, LocalTime endB) {
        return startA.isBefore(endB) && startB.isBefore(endA);
    }

    private boolean dateRangesOverlap(LocalDate startA, LocalDate endA, LocalDate startB, LocalDate endB) {
        return !endA.isBefore(startB) && !endB.isBefore(startA);
    }

    private boolean daySetsOverlap(Set<DayOfWeek> daysA, Set<DayOfWeek> daysB) {
        if (daysA == null || daysA.isEmpty() || daysB == null || daysB.isEmpty()) {
            return false;
        }

        for (DayOfWeek day : daysA) {
            if (daysB.contains(day)) {
                return true;
            }
        }
        return false;
    }

    private boolean isDateWithinRange(LocalDate date, LocalDate startDate, LocalDate endDate) {
        return date != null && startDate != null && endDate != null
                && !date.isBefore(startDate) && !date.isAfter(endDate);
    }

    private boolean isSlotScheduledOnDate(ClassSlot slot, LocalDate date) {
        Set<DayOfWeek> days = getEffectiveDays(slot);
        if (!days.contains(date.getDayOfWeek())) {
            return false;
        }

        Set<LocalDate> excludedDates = slot.getExcludedDates();
        return excludedDates == null || !excludedDates.contains(date);
    }

    private Set<DayOfWeek> getEffectiveDays(ClassSlot slot) {
        Set<DayOfWeek> effectiveDays = new HashSet<>();

        if (slot.getDaysOfWeek() != null) {
            effectiveDays.addAll(slot.getDaysOfWeek());
        }

        if (slot.getDayOfWeek() != null) {
            effectiveDays.add(slot.getDayOfWeek());
        }

        return effectiveDays;
    }
}