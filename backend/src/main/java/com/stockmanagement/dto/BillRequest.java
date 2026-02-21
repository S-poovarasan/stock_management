package com.stockmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillRequest {
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private List<BillItemRequest> items;
    private String paymentMethod;
    private Double tax;
    private Double discount;
}
