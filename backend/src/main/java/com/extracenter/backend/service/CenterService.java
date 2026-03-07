package com.extracenter.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.extracenter.backend.dto.CenterRequest;
import com.extracenter.backend.entity.Center;
import com.extracenter.backend.entity.Grade;
import com.extracenter.backend.entity.Subject;
import com.extracenter.backend.entity.User;
import com.extracenter.backend.repository.CenterRepository;
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

    // 1. Tạo Center mới
    public Center createCenter(CenterRequest request) {
        User manager = userRepository.findById(request.getManagerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + request.getManagerId()));

        Center newCenter = new Center();
        newCenter.setName(request.getName());
        newCenter.setDescription(request.getDescription());
        newCenter.setPhoneNumber(request.getPhoneNumber());
        newCenter.setManager(manager);

        Center savedCenter = centerRepository.save(newCenter);

        manager.getConnectedCenters().add(savedCenter);
        userRepository.save(manager);

        return savedCenter;
    }

    // 2. Lấy danh sách tất cả Center
    public List<Center> getAllCenters() {
        return centerRepository.findAll();
    }

    public List<Center> getCentersByManager(Long managerId) {
        return centerRepository.findByManagerId(managerId);
    }

    public Center getCenterById(Long id) {
        return centerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trung tâm với ID: " + id));
    }

    // 1. Lấy danh sách trung tâm tôi đi dạy (Teaching)
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

    public Grade updateGrade(Long centerId, Long gradeId, String name, Integer fromAge, Integer toAge, String description) {
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
    public Center updateCenter(Long centerId, CenterRequest request) {
        Center center = centerRepository.findById(centerId)
                .orElseThrow(() -> new RuntimeException("Trung tâm không tồn tại!"));

        // Có thể check thêm: Chỉ Manager mới được sửa
        if (!center.getManager().getId().equals(request.getManagerId())) {
            throw new RuntimeException("Bạn không có quyền sửa trung tâm này!");
        }

        center.setName(request.getName());
        center.setDescription(request.getDescription());
        center.setPhoneNumber(request.getPhoneNumber());

        return centerRepository.save(center);
    }

    // 3. Xóa Trung tâm
    public void deleteCenter(Long centerId) {
        // Lưu ý: Nếu trung tâm đã có khóa học, DB sẽ báo lỗi khóa ngoại.
        // Bạn có thể try-catch để báo lỗi thân thiện hơn.
        try {
            centerRepository.removeAllStudentLinks(centerId);
            centerRepository.deleteById(centerId);
        } catch (Exception e) {
            throw new RuntimeException(
                    "Không thể xóa trung tâm này vì đang có dữ liệu liên quan (Khóa học, Học viên...)");
        }
    }
}