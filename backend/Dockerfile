# 1. Dùng Java 17 (phù hợp với Spring Boot của bạn)
FROM eclipse-temurin:17-jdk-alpine

# 2. Tạo folder trong container
WORKDIR /app

# 3. Copy file jar vào container
COPY target/backend-0.0.1-SNAPSHOT.jar app.jar

# 4. Expose port (Spring Boot mặc định 8080)
EXPOSE 8080

# 5. Run app
ENTRYPOINT ["java", "-jar", "app.jar"]