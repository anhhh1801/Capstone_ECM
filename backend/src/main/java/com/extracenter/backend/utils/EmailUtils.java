package com.extracenter.backend.utils;

import java.text.Normalizer;
import java.util.regex.Pattern;

public final class EmailUtils {

    // OPTIMIZATION: Compiling a regex pattern is computationally expensive.
    // By making it a static final constant, Java only compiles it ONCE when the
    // server starts,
    // rather than recompiling it every single time a new student registers.
    private static final Pattern DIACRITICS_PATTERN = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

    // BEST PRACTICE: Utility classes should have private constructors to prevent
    // developers from accidentally instantiating them (e.g., new EmailUtils()).
    private EmailUtils() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    // Function to remove Vietnamese accents: "Nguyễn Văn A" -> "Nguyen Van A"
    public static String removeAccent(String s) {
        // Null safety check
        if (s == null || s.trim().isEmpty()) {
            return "";
        }

        String temp = Normalizer.normalize(s, Normalizer.Form.NFD);
        return DIACRITICS_PATTERN.matcher(temp).replaceAll("")
                .replace('đ', 'd')
                .replace('Đ', 'D');
    }

    // Function to generate email prefix: "Nguyen Van A" -> "nguyenvana"
    public static String generateEmailPrefix(String firstName, String lastName) {
        // Safely handle null inputs in case a user only has one name
        String safeFirst = firstName != null ? firstName : "";
        String safeLast = lastName != null ? lastName : "";

        String fullName = removeAccent(safeLast + " " + safeFirst).toLowerCase();

        // 1. Remove all whitespace: "nguyen van a" -> "nguyenvana"
        // 2. Remove any remaining non-alphanumeric characters (like apostrophes or
        // dashes)
        // to ensure the email is 100% valid.
        return fullName.replaceAll("\\s+", "").replaceAll("[^a-z0-9]", "");
    }
}