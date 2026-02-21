package com.stockmanagement.repository;

import com.stockmanagement.entity.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {
    List<StockTransaction> findByProductId(Long productId);
    List<StockTransaction> findByTransactionType(String transactionType);
    List<StockTransaction> findByTransactionDateBetween(LocalDateTime start, LocalDateTime end);
    List<StockTransaction> findByProductIdOrderByTransactionDateDesc(Long productId);
}
