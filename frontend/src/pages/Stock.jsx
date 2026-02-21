import { useState, useEffect } from 'react';
import { apiCall } from '../api';
import Navbar from '../components/Navbar';
import './Stock.css';

export default function Stock() {
  const [products, setProducts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [toast, setToast] = useState(null);

  const [productForm, setProductForm] = useState({
    name: '', category: '', description: '',
    sellingPrice: '', minStockLevel: '10',
  });

  const [stockForm, setStockForm] = useState({
    productId: '', transactionType: 'IN', quantity: '', notes: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadProducts = async () => {
    const result = await apiCall('/products');
    if (result?.success) setProducts(result.data);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    // Auto-generate a unique SKU from category prefix + timestamp
    const prefix = (productForm.category || 'GEN').substring(0, 3).toUpperCase();
    const uid = Date.now().toString(36).toUpperCase();
    const product = {
      ...productForm,
      sku: `${prefix}-${uid}`,
      sellingPrice: parseFloat(productForm.sellingPrice),
      purchasePrice: parseFloat(productForm.sellingPrice),
      minStockLevel: parseInt(productForm.minStockLevel),
      currentStock: 0,
      active: true,
    };

    const result = await apiCall('/products', 'POST', product);
    if (result?.success) {
      showToast('Product added successfully!');
      setProductForm({ name: '', category: '', description: '', sellingPrice: '', minStockLevel: '10' });
      setShowAddForm(false);
      loadProducts();
    }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    const stockUpdate = {
      productId: parseInt(stockForm.productId),
      quantity: parseInt(stockForm.quantity),
      transactionType: stockForm.transactionType,
      notes: stockForm.notes,
    };

    const result = await apiCall('/stock/update', 'POST', stockUpdate);
    if (result?.success) {
      showToast('Stock updated successfully!');
      setStockForm({ productId: '', transactionType: 'IN', quantity: '', notes: '' });
      setShowStockForm(false);
      loadProducts();
    }
  };

  const lowStockProducts = products.filter(p => p.currentStock <= p.minStockLevel);
  const totalStock = products.reduce((sum, p) => sum + p.currentStock, 0);
  const totalValue = products.reduce((sum, p) => sum + p.currentStock * p.sellingPrice, 0);
  const filteredProducts = products.filter(p => {
    const kw = searchKeyword.toLowerCase();
    return p.name.toLowerCase().includes(kw) || p.category.toLowerCase().includes(kw);
  });

  return (
    <>
      <Navbar />
      <div className="stock-page">
        {/* Toast notification */}
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            <span className="toast-icon">{toast.type === 'success' ? '✓' : '!'}</span>
            {toast.message}
          </div>
        )}

        {/* Page Header */}
        <div className="stock-page-header">
          <div>
            <h1>
              <span className="page-header-icon">📦</span>
              Stock Management
            </h1>
            <p>Track inventory, manage products and monitor stock levels</p>
          </div>
          <div className="page-header-date">
            📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>

        {/* Stats cards */}
        <div className="stats-row">
          <div className="stat-card stat-card-blue">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <span className="stat-value">{products.length}</span>
              <span className="stat-label">Total Products</span>
            </div>
          </div>
          <div className="stat-card stat-card-green">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <span className="stat-value">{totalStock.toLocaleString()}</span>
              <span className="stat-label">Total Stock Units</span>
            </div>
          </div>
          <div className="stat-card stat-card-purple">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <span className="stat-value">₹{totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <span className="stat-label">Inventory Value</span>
            </div>
          </div>
          <div className={`stat-card ${lowStockProducts.length > 0 ? 'stat-card-warning' : 'stat-card-orange'}`}>
            <div className="stat-icon">⚠️</div>
            <div className="stat-info">
              <span className="stat-value">{lowStockProducts.length}</span>
              <span className="stat-label">Low Stock Items</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className="alert-banner">
            <div className="alert-banner-header">
              <span className="alert-banner-icon">⚠️</span>
              <h3>Low Stock Alert</h3>
              <span className="alert-badge">{lowStockProducts.length}</span>
            </div>
            <div className="alert-banner-items">
              {lowStockProducts.map(product => (
                <div key={product.id} className="alert-chip">
                  <strong>{product.name}</strong>
                  <span className="alert-chip-stock">{product.currentStock} / {product.minStockLevel}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="action-bar">
          <button className={`btn btn-primary btn-icon ${showAddForm ? 'btn-active' : ''}`} onClick={() => { setShowAddForm(!showAddForm); setShowStockForm(false); }}>
            <span className="btn-icon-text">{showAddForm ? '✕' : '+'}</span> {showAddForm ? 'Cancel' : 'New Product'}
          </button>
          <button className={`btn btn-success btn-icon ${showStockForm ? 'btn-active' : ''}`} onClick={() => { setShowStockForm(!showStockForm); setShowAddForm(false); }}>
            <span className="btn-icon-text">{showStockForm ? '✕' : '↕'}</span> {showStockForm ? 'Cancel' : 'Update Stock'}
          </button>
        </div>

        {/* Add Product Form - collapsible */}
        {showAddForm && (
          <div className="card card-slide-in">
            <div className="card-header">
              <div className="card-header-icon card-header-icon-indigo">📋</div>
              <h2>Add New Product</h2>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="form-grid-modern">
                <div className="form-group-modern">
                  <label>Product Name</label>
                  <input type="text" placeholder="Enter product name" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} required />
                </div>
                <div className="form-group-modern">
                  <label>Category</label>
                  <input type="text" placeholder="e.g. Electronics, Groceries" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} required />
                </div>
                <div className="form-group-modern">
                  <label>Selling Price (₹)</label>
                  <input type="number" step="0.01" placeholder="0.00" value={productForm.sellingPrice} onChange={e => setProductForm({ ...productForm, sellingPrice: e.target.value })} required />
                </div>
                <div className="form-group-modern">
                  <label>Min Stock Level</label>
                  <input type="number" placeholder="10" value={productForm.minStockLevel} onChange={e => setProductForm({ ...productForm, minStockLevel: e.target.value })} required />
                </div>
                <div className="form-group-modern form-group-full">
                  <label>Description <span className="label-optional">(optional)</span></label>
                  <textarea rows="2" placeholder="Brief product description..." value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Product</button>
              </div>
            </form>
          </div>
        )}

        {/* Update Stock Form - collapsible */}
        {showStockForm && (
          <div className="card card-slide-in">
            <div className="card-header">
              <div className="card-header-icon card-header-icon-green">↕</div>
              <h2>Update Stock</h2>
            </div>
            <form onSubmit={handleStockUpdate}>
              <div className="form-grid-modern">
                <div className="form-group-modern">
                  <label>Product</label>
                  <select value={stockForm.productId} onChange={e => setStockForm({ ...stockForm, productId: e.target.value })} required>
                    <option value="">Select a product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — Stock: {p.currentStock}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group-modern">
                  <label>Type</label>
                  <select value={stockForm.transactionType} onChange={e => setStockForm({ ...stockForm, transactionType: e.target.value })} required>
                    <option value="IN">📥 Stock IN (Restock)</option>
                    <option value="OUT">📤 Stock OUT (Sale)</option>
                    <option value="ADJUSTMENT">🔧 Adjustment</option>
                  </select>
                </div>
                <div className="form-group-modern">
                  <label>Quantity</label>
                  <input type="number" placeholder="Enter quantity" value={stockForm.quantity} onChange={e => setStockForm({ ...stockForm, quantity: e.target.value })} required />
                </div>
                <div className="form-group-modern">
                  <label>Notes <span className="label-optional">(optional)</span></label>
                  <input type="text" placeholder="Reason or reference..." value={stockForm.notes} onChange={e => setStockForm({ ...stockForm, notes: e.target.value })} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowStockForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-success">Update Stock</button>
              </div>
            </form>
          </div>
        )}

        {/* Product List */}
        <div className="card">
          <div className="card-header card-header-split">
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div className="card-header-icon card-header-icon-indigo">📦</div>
              <h2>Products</h2>
            </div>
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search by name or category..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
              />
              {searchKeyword && (
                <button className="search-clear" onClick={() => setSearchKeyword('')}>✕</button>
              )}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <p>{searchKeyword ? 'No products match your search.' : 'No products yet. Add your first product!'}</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Min Level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => {
                    const isLow = product.currentStock <= product.minStockLevel;
                    return (
                      <tr key={product.id} className={isLow ? 'row-warning' : ''}>
                        <td>
                          <div className="product-cell">
                            <span className="product-name">{product.name}</span>
                            {product.description && <span className="product-desc">{product.description}</span>}
                          </div>
                        </td>
                        <td><span className="category-badge">{product.category}</span></td>
                        <td className="price-cell">₹{product.sellingPrice.toFixed(2)}</td>
                        <td>
                          <span className={`stock-badge ${isLow ? 'stock-low' : 'stock-ok'}`}>
                            {product.currentStock}
                          </span>
                        </td>
                        <td className="dim-text">{product.minStockLevel}</td>
                        <td>
                          {isLow ? (
                            <span className="status-pill status-pill-danger">Low Stock</span>
                          ) : (
                            <span className="status-pill status-pill-success">In Stock</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="card-footer">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>
      </div>
    </>
  );
}
