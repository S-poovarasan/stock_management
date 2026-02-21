package com.stockmanagement.repository;

import com.stockmanagement.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByBillNumber(String billNumber);
    List<Bill> findByCustomerName(String customerName);
    List<Bill> findByBillDateBetween(LocalDateTime start, LocalDateTime end);
    List<Bill> findByStatus(String status);
    
    @Query("SELECT b FROM Bill b ORDER BY b.billDate DESC")
    List<Bill> findAllOrderByBillDateDesc();
    
    @Query("SELECT COUNT(b) FROM Bill b WHERE b.billDate >= :date")
    Long countBillsSince(@Param("date") LocalDateTime date);
}
