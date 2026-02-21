package com.stockmanagement.service;

import com.stockmanagement.dto.BillItemRequest;
import com.stockmanagement.dto.BillRequest;
import com.stockmanagement.dto.StockUpdateRequest;
import com.stockmanagement.entity.Bill;
import com.stockmanagement.entity.BillItem;
import com.stockmanagement.entity.Product;
import com.stockmanagement.entity.User;
import com.stockmanagement.repository.BillRepository;
import com.stockmanagement.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BillingService {
    private final BillRepository billRepository;
    private final ProductRepository productRepository;
    private final StockService stockService;
    
    @Transactional
    public Bill createBill(BillRequest request, User user) {
        Bill bill = new Bill();
        bill.setBillNumber(generateBillNumber());
        bill.setCustomerName(request.getCustomerName());
        bill.setCustomerPhone(request.getCustomerPhone());
        bill.setCustomerEmail(request.getCustomerEmail());
        bill.setPaymentMethod(request.getPaymentMethod());
        bill.setStatus("COMPLETED");
        bill.setUser(user);
        
        // Add bill items
        for (BillItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));
            
            // Check stock availability
            if (product.getCurrentStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName() + 
                    ". Available: " + product.getCurrentStock());
            }
            
            BillItem billItem = new BillItem();
            billItem.setBill(bill);
            billItem.setProduct(product);
            billItem.setQuantity(itemRequest.getQuantity());
            billItem.setUnitPrice(product.getSellingPrice());
            billItem.calculateLineTotal();
            
            bill.getItems().add(billItem);
            
            // Update stock
            StockUpdateRequest stockUpdate = new StockUpdateRequest();
            stockUpdate.setProductId(product.getId());
            stockUpdate.setQuantity(itemRequest.getQuantity());
            stockUpdate.setTransactionType("OUT");
            stockUpdate.setNotes("Bill #" + bill.getBillNumber());
            stockService.updateStock(stockUpdate, user);
        }
        
        // Calculate totals
        bill.setTax(request.getTax() != null ? BigDecimal.valueOf(request.getTax()) : BigDecimal.ZERO);
        bill.setDiscount(request.getDiscount() != null ? BigDecimal.valueOf(request.getDiscount()) : BigDecimal.ZERO);
        bill.calculateTotals();
        
        return billRepository.save(bill);
    }
    
    public Optional<Bill> getBillById(Long id) {
        return billRepository.findById(id);
    }
    
    public Optional<Bill> getBillByNumber(String billNumber) {
        return billRepository.findByBillNumber(billNumber);
    }
    
    public List<Bill> getAllBills() {
        return billRepository.findAllOrderByBillDateDesc();
    }
    
    public List<Bill> getBillsByDateRange(LocalDateTime start, LocalDateTime end) {
        return billRepository.findByBillDateBetween(start, end);
    }
    
    private String generateBillNumber() {
        LocalDateTime now = LocalDateTime.now();
        String datePrefix = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        Long count = billRepository.countBillsSince(now.toLocalDate().atStartOfDay());
        return String.format("BILL-%s-%04d", datePrefix, count + 1);
    }
}
