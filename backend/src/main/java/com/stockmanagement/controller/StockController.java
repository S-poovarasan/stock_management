package com.stockmanagement.controller;

import com.stockmanagement.dto.ApiResponse;
import com.stockmanagement.dto.StockUpdateRequest;
import com.stockmanagement.entity.StockTransaction;
import com.stockmanagement.entity.User;
import com.stockmanagement.repository.UserRepository;
import com.stockmanagement.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StockController {
    
    private final StockService stockService;
    private final UserRepository userRepository;
    
    @PostMapping("/update")
    public ResponseEntity<ApiResponse<StockTransaction>> updateStock(
            @RequestBody StockUpdateRequest request,
            Authentication authentication) {
        try {
            User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
            StockTransaction transaction = stockService.updateStock(request, user);
            return ResponseEntity.ok(ApiResponse.success("Stock updated successfully", transaction));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<StockTransaction>>> getAllTransactions() {
        List<StockTransaction> transactions = stockService.getAllTransactions();
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }
    
    @GetMapping("/transactions/product/{productId}")
    public ResponseEntity<ApiResponse<List<StockTransaction>>> getProductTransactions(
            @PathVariable Long productId) {
        List<StockTransaction> transactions = stockService.getProductTransactions(productId);
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }
}
