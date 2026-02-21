package com.stockmanagement.controller;

import com.stockmanagement.dto.ApiResponse;
import com.stockmanagement.dto.LoginRequest;
import com.stockmanagement.dto.LoginResponse;
import com.stockmanagement.entity.User;
import com.stockmanagement.security.JwtUtil;
import com.stockmanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Invalid username or password"));
        }
        
        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        final String jwt = jwtUtil.generateToken(userDetails);
        
        User user = userService.findByUsername(request.getUsername()).orElseThrow();
        userService.updateLastLogin(request.getUsername());
        
        LoginResponse response = new LoginResponse(jwt, user.getUsername(), user.getFullName(), user.getRole());
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@RequestBody User user) {
        if (userService.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Username already exists"));
        }
        
        User createdUser = userService.createUser(user);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", createdUser));
    }
}
