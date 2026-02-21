package com.stockmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    @Column(unique = true, nullable = false)
    private String sku; // Stock Keeping Unit
    
    @Column(nullable = false)
    private String category;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal purchasePrice;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal sellingPrice;
    
    @Column(nullable = false)
    private Integer currentStock = 0;
    
    @Column(nullable = false)
    private Integer minStockLevel = 10; // Threshold for low stock alert
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt;
    
    @Transient
    public boolean isLowStock() {
        return currentStock <= minStockLevel;
    }
}
