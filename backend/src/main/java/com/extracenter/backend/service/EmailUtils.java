package com.extracenter.backend.service;

import java.text.Normalizer;
import java.util.regex.Pattern;

public class EmailUtils {

    // Hàm xóa dấu tiếng Việt: "Nguyễn Văn A" -> "Nguyen Van A"
    public static String removeAccent(String s) {
        String temp = Normalizer.normalize(s, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(temp).replaceAll("").replace('đ', 'd').replace('Đ', 'D');
    }

    // Hàm tạo email prefix: "Nguyen Van A" -> "nguyenvana"
    public static String generateEmailPrefix(String firstName, String lastName) {
        String fullName = removeAccent(lastName + " " + firstName).toLowerCase();
        // Xóa khoảng trắng: "nguyen van a" -> "nguyenvana"
        return fullName.replaceAll("\\s+", "");
    }
}