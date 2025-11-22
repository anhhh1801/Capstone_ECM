package com.extracenter.backend.service;

import com.extracenter.backend.dto.CenterRequest;
import com.extracenter.backend.entity.Center;
import com.extracenter.backend.entity.User;
import com.extracenter.backend.repository.CenterRepository;
import com.extracenter.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CenterService {

    @Autowired
    private CenterRepository centerRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. Tạo Center mới
    public Center createCenter(CenterRequest request) {
        // Tìm người quản lý (Teacher)
        User manager = userRepository.findById(request.getManagerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + request.getManagerId()));

        // Tạo Center
        Center newCenter = new Center();
        newCenter.setName(request.getName());
        newCenter.setDescription(request.getDescription());
        newCenter.setPhoneNumber(request.getPhoneNumber());
        newCenter.setManager(manager); // Gán quản lý

        // Lưu Center vào DB
        Center savedCenter = centerRepository.save(newCenter);

        // (Logic phụ) Gán luôn ông User này thuộc về Center vừa tạo (nếu logic dự án
        // yêu cầu)
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
        // Không cho sửa Manager (hoặc tùy logic của bạn)

        return centerRepository.save(center);
    }

    // 3. Xóa Trung tâm
    public void deleteCenter(Long centerId) {
        // Lưu ý: Nếu trung tâm đã có khóa học, DB sẽ báo lỗi khóa ngoại.
        // Bạn có thể try-catch để báo lỗi thân thiện hơn.
        try {
            centerRepository.deleteById(centerId);
        } catch (Exception e) {
            throw new RuntimeException(
                    "Không thể xóa trung tâm này vì đang có dữ liệu liên quan (Khóa học, Học viên...)");
        }
    }
}