package com.stockmanagement.service;

import com.stockmanagement.entity.Product;
import com.stockmanagement.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }
    
    public Product updateProduct(Long id, Product productDetails) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            product.setName(productDetails.getName());
            product.setDescription(productDetails.getDescription());
            product.setSku(productDetails.getSku());
            product.setCategory(productDetails.getCategory());
            product.setPurchasePrice(productDetails.getPurchasePrice());
            product.setSellingPrice(productDetails.getSellingPrice());
            product.setMinStockLevel(productDetails.getMinStockLevel());
            product.setActive(productDetails.getActive());
            product.setUpdatedAt(LocalDateTime.now());
            return productRepository.save(product);
        }
        throw new RuntimeException("Product not found with id: " + id);
    }
    
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
    
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public List<Product> getActiveProducts() {
        return productRepository.findByActiveTrue();
    }
    
    public List<Product> getLowStockProducts() {
        return productRepository.findLowStockProducts();
    }
    
    public List<Product> searchProducts(String keyword) {
        return productRepository.searchProducts(keyword);
    }
    
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
    
    public void updateStock(Long productId, Integer quantity) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            product.setCurrentStock(quantity);
            product.setUpdatedAt(LocalDateTime.now());
            productRepository.save(product);
        } else {
            throw new RuntimeException("Product not found with id: " + productId);
        }
    }
}
