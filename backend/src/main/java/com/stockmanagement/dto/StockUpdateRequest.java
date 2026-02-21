package com.stockmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockUpdateRequest {
    private Long productId;
    private Integer quantity;
    private String transactionType; // IN, OUT, ADJUSTMENT
    private String notes;
}
