package com.stockmanagement.controller;

import com.stockmanagement.dto.ApiResponse;
import com.stockmanagement.entity.User;
import com.stockmanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/init")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InitController {
    
    private final UserService userService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<String>> initializeDefaultUser() {
        if (!userService.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("admin123");
            admin.setFullName("Administrator");
            admin.setEmail("admin@stockmanagement.com");
            admin.setRole("ADMIN");
            admin.setActive(true);
            
            userService.createUser(admin);
            return ResponseEntity.ok(ApiResponse.success("Default admin user created. Username: admin, Password: admin123", null));
        }
        return ResponseEntity.ok(ApiResponse.success("System already initialized", null));
    }
}
