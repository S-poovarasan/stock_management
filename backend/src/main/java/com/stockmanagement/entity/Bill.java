package com.stockmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bills")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String billNumber;
    
    @Column(nullable = false)
    private LocalDateTime billDate = LocalDateTime.now();
    
    @Column(nullable = false)
    private String customerName;
    
    private String customerPhone;
    
    private String customerEmail;
    
    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BillItem> items = new ArrayList<>();
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal tax = BigDecimal.ZERO;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;
    
    @Column(nullable = false)
    private String paymentMethod; // CASH, CARD, UPI, etc.
    
    @Column(nullable = false)
    private String status; // COMPLETED, CANCELLED
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    public void calculateTotals() {
        this.subtotal = items.stream()
            .map(BillItem::getLineTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.total = subtotal.add(tax).subtract(discount);
    }
}
