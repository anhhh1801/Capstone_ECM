package com.extracenter.backend.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.BuildProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api")
@CrossOrigin(originPatterns = "*")
@Tag(name = "API Status", description = "API health check and documentation endpoints")
public class ApiStatusController {

    @Autowired(required = false)
    private BuildProperties buildProperties;

    /**
     * Health Check Endpoint
     * Returns 200 OK if API is running
     */
    @GetMapping("/health")
    @Operation(summary = "Health Check", description = "Check if the API is running and responding")
    @ApiResponse(responseCode = "200", description = "API is running successfully")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Extra Center Management API is running");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "ExtraCenterBackend");
        return ResponseEntity.ok(response);
    }

    /**
     * API Status Endpoint
     * Returns detailed information about the API
     */
    @GetMapping("/status")
    @Operation(summary = "API Status", description = "Get detailed status information about the API")
    @ApiResponse(responseCode = "200", description = "API status retrieved successfully")
    public ResponseEntity<Map<String, Object>> status() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OPERATIONAL");
        response.put("service", "Extra Center Management System");
        response.put("version", "1.0.0");
        response.put("timestamp", LocalDateTime.now());
        response.put("uptime", "Running");
        
        // Add build information if available
        if (buildProperties != null) {
            response.put("buildVersion", buildProperties.getVersion());
            response.put("buildTime", buildProperties.getTime());
        }
        
        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("Health Check", "/api/health");
        endpoints.put("API Documentation (Swagger UI)", "/swagger-ui.html");
        endpoints.put("API Docs JSON", "/v3/api-docs");
        endpoints.put("Users", "/api/users");
        endpoints.put("Centers", "/api/centers");
        endpoints.put("Courses", "/api/courses");
        endpoints.put("Enrollments", "/api/enrollments");
        
        response.put("availableEndpoints", endpoints);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Welcome Endpoint
     * Provides information about the API
     */
    @GetMapping("/")
    @Operation(summary = "API Welcome", description = "Welcome endpoint with API information")
    @ApiResponse(responseCode = "200", description = "Welcome message and links")
    public ResponseEntity<Map<String, Object>> welcome() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to Extra Center Management API");
        response.put("description", "API for managing educational centers, courses, enrollments, and users");
        response.put("timestamp", LocalDateTime.now());
        
        Map<String, String> links = new HashMap<>();
        links.put("Health Check", "/api/health");
        links.put("API Status", "/api/status");
        links.put("API Documentation", "/swagger-ui.html");
        links.put("OpenAPI JSON", "/v3/api-docs");
        
        response.put("links", links);
        
        return ResponseEntity.ok(response);
    }
}
