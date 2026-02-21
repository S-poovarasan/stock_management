package com.stockmanagement.service;

import com.stockmanagement.entity.Product;
import com.stockmanagement.entity.StockTransaction;
import com.stockmanagement.entity.User;
import com.stockmanagement.repository.ProductRepository;
import com.stockmanagement.repository.StockTransactionRepository;
import com.stockmanagement.dto.StockUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {
    private final StockTransactionRepository stockTransactionRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    
    @Transactional
    public StockTransaction updateStock(StockUpdateRequest request, User user) {
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        Integer previousStock = product.getCurrentStock();
        Integer newStock;
        
        switch (request.getTransactionType().toUpperCase()) {
            case "IN":
                newStock = previousStock + request.getQuantity();
                break;
            case "OUT":
                if (previousStock < request.getQuantity()) {
                    throw new RuntimeException("Insufficient stock. Available: " + previousStock);
                }
                newStock = previousStock - request.getQuantity();
                break;
            case "ADJUSTMENT":
                newStock = request.getQuantity();
                break;
            default:
                throw new RuntimeException("Invalid transaction type");
        }
        
        // Update product stock
        productService.updateStock(product.getId(), newStock);
        
        // Create transaction record
        StockTransaction transaction = new StockTransaction();
        transaction.setProduct(product);
        transaction.setTransactionType(request.getTransactionType().toUpperCase());
        transaction.setQuantity(request.getQuantity());
        transaction.setPreviousStock(previousStock);
        transaction.setNewStock(newStock);
        transaction.setNotes(request.getNotes());
        transaction.setUser(user);
        transaction.setTransactionDate(LocalDateTime.now());
        
        return stockTransactionRepository.save(transaction);
    }
    
    public List<StockTransaction> getProductTransactions(Long productId) {
        return stockTransactionRepository.findByProductIdOrderByTransactionDateDesc(productId);
    }
    
    public List<StockTransaction> getAllTransactions() {
        return stockTransactionRepository.findAll();
    }
    
    public List<StockTransaction> getTransactionsByDateRange(LocalDateTime start, LocalDateTime end) {
        return stockTransactionRepository.findByTransactionDateBetween(start, end);
    }
}
