package com.extracenter.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    public String uploadFile(MultipartFile file) throws IOException {
        try {
            // 1. Phân loại file thông minh
            String contentType = file.getContentType();
            String resourceType = "auto"; // Mặc định cho Ảnh và Video

            // Nếu là tệp tài liệu (PDF, Word, Excel, PowerPoint, ZIP...) -> Ép kiểu thành
            // "raw"
            if (contentType != null && (contentType.contains("pdf") ||
                    contentType.contains("msword") ||
                    contentType.contains("document") ||
                    contentType.contains("presentation") ||
                    contentType.contains("sheet") ||
                    contentType.contains("zip") ||
                    contentType.contains("rar"))) {
                resourceType = "raw";
            }

            // 2. Upload lên Cloudinary (Bổ sung cờ giữ nguyên tên file)
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", resourceType,
                            "folder", "extracenter_materials",
                            "use_filename", true, // GIỮ LẠI TÊN GỐC CỦA FILE (vd: Unit_1_Grammar.pdf)
                            "unique_filename", true // Thêm một đoạn mã ngẫu nhiên nhỏ xíu ở đuôi để tránh trùng lặp
                    ));

            // 3. Lấy URL trả về
            return uploadResult.get("secure_url").toString();

        } catch (IOException e) {
            throw new IOException("Failed to upload file to Cloudinary: " + e.getMessage());
        }
    }
}