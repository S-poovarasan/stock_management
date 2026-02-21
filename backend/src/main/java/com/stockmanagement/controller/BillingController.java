package com.stockmanagement.controller;

import com.stockmanagement.dto.ApiResponse;
import com.stockmanagement.dto.BillRequest;
import com.stockmanagement.entity.Bill;
import com.stockmanagement.entity.User;
import com.stockmanagement.repository.UserRepository;
import com.stockmanagement.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BillingController {
    
    private final BillingService billingService;
    private final UserRepository userRepository;
    
    @PostMapping
    public ResponseEntity<ApiResponse<Bill>> createBill(
            @RequestBody BillRequest request,
            Authentication authentication) {
        try {
            User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
            Bill bill = billingService.createBill(request, user);
            return ResponseEntity.ok(ApiResponse.success("Bill created successfully", bill));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Bill>>> getAllBills() {
        List<Bill> bills = billingService.getAllBills();
        return ResponseEntity.ok(ApiResponse.success(bills));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Bill>> getBillById(@PathVariable Long id) {
        return billingService.getBillById(id)
            .map(bill -> ResponseEntity.ok(ApiResponse.success(bill)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/number/{billNumber}")
    public ResponseEntity<ApiResponse<Bill>> getBillByNumber(@PathVariable String billNumber) {
        return billingService.getBillByNumber(billNumber)
            .map(bill -> ResponseEntity.ok(ApiResponse.success(bill)))
            .orElse(ResponseEntity.notFound().build());
    }
}
