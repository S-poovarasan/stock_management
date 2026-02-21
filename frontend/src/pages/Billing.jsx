import { useState, useEffect, useMemo } from 'react';
import { apiCall } from '../api';
import Navbar from '../components/Navbar';
import './Billing.css';

export default function Billing() {
  const [products, setProducts] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [billQuantity, setBillQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [bills, setBills] = useState([]);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewBill, setViewBill] = useState(null);

  const [customerForm, setCustomerForm] = useState({
    customerName: '', customerPhone: '', customerEmail: '', paymentMethod: 'CASH',
  });

  useEffect(() => {
    loadProducts();
    loadBills();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadProducts = async () => {
    const result = await apiCall('/products/active');
    if (result?.success) setProducts(result.data);
  };

  const loadBills = async () => {
    const result = await apiCall('/bills');
    if (result?.success) setBills(result.data);
  };

  const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));

  const addBillItem = () => {
    if (!selectedProductId || !selectedProduct) {
      showToast('Please select a product', 'error');
      return;
    }

    if (billQuantity < 1) {
      showToast('Quantity must be at least 1', 'error');
      return;
    }

    if (billQuantity > selectedProduct.currentStock) {
      showToast(`Insufficient stock! Available: ${selectedProduct.currentStock}`, 'error');
      return;
    }

    setBillItems(prev => {
      const existing = prev.findIndex(item => item.productId === selectedProduct.id);
      if (existing >= 0) {
        const newQty = prev[existing].quantity + billQuantity;
        if (newQty > selectedProduct.currentStock) {
          showToast(`Total quantity exceeds stock! Available: ${selectedProduct.currentStock}`, 'error');
          return prev;
        }
        const updated = [...prev];
        updated[existing] = { ...updated[existing], quantity: newQty };
        return updated;
      }
      return [...prev, {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.sellingPrice,
        quantity: billQuantity,
        stock: selectedProduct.currentStock,
      }];
    });
    setBillQuantity(1);
    setSelectedProductId('');
  };

  const updateItemQuantity = (index, newQty) => {
    if (newQty < 1) return;
    setBillItems(prev => {
      const updated = [...prev];
      if (newQty > updated[index].stock) {
        showToast(`Max available: ${updated[index].stock}`, 'error');
        return prev;
      }
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  };

  const removeBillItem = (index) => {
    setBillItems(prev => prev.filter((_, i) => i !== index));
  };

  const subtotal = useMemo(() =>
    billItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [billItems]);

  const discountAmount = Math.round((subtotal * discount / 100) * 100) / 100;
  const total = subtotal - discountAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (billItems.length === 0) {
      showToast('Please add at least one item to the bill', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const billRequest = {
        ...customerForm,
        tax: 0,
        discount: discountAmount,
        items: billItems.map(item => ({ productId: item.productId, quantity: item.quantity })),
      };

      const result = await apiCall('/bills', 'POST', billRequest);
      if (result?.success) {
        showToast(`Bill #${result.data.billNumber} created successfully!`);
        setViewBill(result.data);
        setCustomerForm({ customerName: '', customerPhone: '', customerEmail: '', paymentMethod: 'CASH' });
        setBillItems([]);
        setDiscount(0);
        loadProducts();
        loadBills();
      } else {
        showToast(result?.message || 'Failed to create bill', 'error');
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentIcons = { CASH: '💵', CARD: '💳', UPI: '📱', BANK_TRANSFER: '🏦' };
  const paymentLabels = { CASH: 'Cash', CARD: 'Card', UPI: 'UPI', BANK_TRANSFER: 'Bank Transfer' };

  const handleViewBill = (billId) => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      setViewBill(bill);
    } else {
      showToast('Bill not found', 'error');
    }
  };

  const printBill = () => {
    if (!viewBill) return;
    const billDate = new Date(viewBill.billDate);
    const dateStr = billDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = billDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const totalItems = viewBill.items.reduce((s, it) => s + it.quantity, 0);

    const itemRows = viewBill.items.map((item, i) =>
      `<tr${i % 2 === 1 ? ' class="alt"' : ''}>
        <td class="cn">${i + 1}</td>
        <td class="cd">${item.product?.name || 'Product'}</td>
        <td class="cq">${item.quantity}</td>
        <td class="cr">₹${item.unitPrice.toFixed(2)}</td>
        <td class="ca">₹${item.lineTotal.toFixed(2)}</td>
      </tr>`
    ).join('');

    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>Invoice ${viewBill.billNumber}</title>
      <style>
        @page{size:A4;margin:12mm 14mm}
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Segoe UI',Roboto,-apple-system,sans-serif;color:#1e293b;font-size:11px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        .page{width:100%;max-width:560px;margin:0 auto}

        /* Top accent line */
        .accent{height:3px;background:linear-gradient(90deg,#0f172a,#4f46e5,#7c3aed);margin-bottom:16px}

        /* Header row */
        .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}
        .brand{display:flex;align-items:center;gap:8px}
        .logo{width:30px;height:30px;border-radius:6px;background:#0f172a;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;color:#fff;letter-spacing:.5px}
        .bname{font-size:12px;font-weight:800;color:#0f172a}
        .bsub{font-size:8px;color:#94a3b8;margin-top:1px}
        .hdr-r{text-align:right}
        .inv-lbl{font-size:18px;font-weight:900;letter-spacing:4px;color:#0f172a;opacity:.08}
        .chip{display:inline-flex;align-items:center;gap:3px;margin-top:3px;padding:2px 8px;border-radius:10px;font-size:7px;font-weight:700;letter-spacing:.5px}
        .chip-ok{background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0}
        .chip-no{background:#fef2f2;color:#991b1b;border:1px solid #fecaca}
        .dot{width:5px;height:5px;border-radius:50%;display:inline-block}
        .chip-ok .dot{background:#10b981}
        .chip-no .dot{background:#ef4444}

        /* Invoice number bar */
        .inv-bar{display:flex;align-items:center;gap:10px;padding:8px 12px;background:#f8fafc;border:1px solid #e0e7ff;border-radius:6px;margin-bottom:14px}
        .inv-bar-lbl{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#94a3b8}
        .inv-bar-val{font-family:'Courier New',monospace;font-size:11px;font-weight:800;color:#4f46e5}

        /* Meta row */
        .meta{display:flex;gap:8px;margin-bottom:14px}
        .mc{flex:1;padding:7px 9px;background:#f8fafc;border:1px solid #f1f5f9;border-radius:5px;display:flex;align-items:center;gap:6px}
        .mc-ico{font-size:13px;line-height:1}
        .mc-lbl{font-size:6.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#94a3b8;margin-bottom:1px}
        .mc-val{font-size:9.5px;font-weight:700;color:#1e293b}
        .mc-sub{font-size:8px;color:#64748b}

        /* Dividers */
        .sep{font-size:7px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:#94a3b8;border-bottom:1px solid #e2e8f0;padding-bottom:3px;margin-bottom:8px}

        /* Customer */
        .cust{display:flex;align-items:center;gap:10px;padding:8px 12px;background:#fafafa;border:1px solid #e2e8f0;border-radius:7px;margin-bottom:14px}
        .cust-av{width:30px;height:30px;border-radius:7px;background:linear-gradient(135deg,#4f46e5,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;flex-shrink:0}
        .cust-nm{font-size:11px;font-weight:800;color:#0f172a}
        .cust-c{font-size:8.5px;color:#64748b;margin-top:1px}

        /* Table */
        .tw{border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:14px}
        table{width:100%;border-collapse:collapse}
        thead tr{background:#0f172a}
        th{padding:6px 8px;font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:rgba(255,255,255,.85);text-align:left}
        th.cn{text-align:center;width:24px}
        th.cq{text-align:center;width:36px}
        th.cr{text-align:right;width:70px}
        th.ca{text-align:right;width:80px}
        tr.alt{background:#fafbfc}
        td{padding:5px 8px;border-bottom:1px solid #f1f5f9;font-size:9.5px}
        tr:last-child td{border-bottom:none}
        td.cn{text-align:center;color:#94a3b8;font-size:8px;font-family:monospace}
        td.cd{font-weight:700;color:#1e293b}
        td.cq{text-align:center;color:#475569}
        td.cr{text-align:right;color:#475569}
        td.ca{text-align:right;font-weight:800;color:#0f172a}

        /* Totals */
        .tots{display:flex;gap:14px;margin-bottom:14px;align-items:flex-start}
        .notes{flex:1}
        .n-lbl{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#94a3b8;margin-bottom:2px}
        .n-txt{font-size:8.5px;color:#64748b;line-height:1.4;font-style:italic}
        .tbox{width:180px;flex-shrink:0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px}
        .tr{display:flex;justify-content:space-between;padding:3px 0;font-size:9px;color:#475569}
        .td-disc span:last-child{color:#059669;font-weight:600}
        .tg{display:flex;justify-content:space-between;align-items:center;border-top:2px solid #0f172a;margin-top:5px;padding-top:6px;font-weight:800;color:#0f172a}
        .tg span:first-child{font-size:8px;text-transform:uppercase;letter-spacing:.4px}
        .tg-amt{font-size:13px;color:#4f46e5}

        /* Footer badge */
        .foot{display:flex;align-items:center;gap:8px;padding:7px 12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px}
        .foot-ico{width:22px;height:22px;border-radius:50%;background:#10b981;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;flex-shrink:0}
        .foot-t{font-size:8.5px;font-weight:700;color:#065f46}
        .foot-s{font-size:7.5px;color:#059669}

        @media screen{
          body{background:#e2e8f0;padding:20px}
          .page{background:#fff;padding:24px 28px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,.08)}
        }
        @media print{
          .page{max-width:100%;padding:0}
        }
      </style></head>
      <body>
        <div class="page">
          <div class="accent"></div>

          <div class="hdr">
            <div class="brand">
              <div class="logo">SM</div>
              <div><div class="bname">Stock Management</div><div class="bsub">Inventory & Billing System</div></div>
            </div>
            <div class="hdr-r">
              <div class="inv-lbl">INVOICE</div>
              <div class="chip ${viewBill.status === 'COMPLETED' ? 'chip-ok' : 'chip-no'}"><span class="dot"></span>${viewBill.status === 'COMPLETED' ? 'PAID' : 'UNPAID'}</div>
            </div>
          </div>

          <div class="inv-bar">
            <span class="inv-bar-lbl">Invoice</span>
            <span class="inv-bar-val">${viewBill.billNumber}</span>
          </div>

          <div class="meta">
            <div class="mc"><div class="mc-ico">📅</div><div><div class="mc-lbl">Date</div><div class="mc-val">${dateStr}</div><div class="mc-sub">${timeStr}</div></div></div>
            <div class="mc"><div class="mc-ico">${paymentIcons[viewBill.paymentMethod] || '💳'}</div><div><div class="mc-lbl">Payment</div><div class="mc-val">${paymentLabels[viewBill.paymentMethod] || viewBill.paymentMethod}</div></div></div>
            <div class="mc"><div class="mc-ico">📦</div><div><div class="mc-lbl">Items</div><div class="mc-val">${totalItems} unit${totalItems !== 1 ? 's' : ''}</div></div></div>
          </div>

          <div class="sep">Billed To</div>
          <div class="cust">
            <div class="cust-av">${viewBill.customerName.charAt(0).toUpperCase()}</div>
            <div>
              <div class="cust-nm">${viewBill.customerName}</div>
            </div>
          </div>

          <div class="sep">Items</div>
          <div class="tw">
            <table>
              <thead><tr><th class="cn">#</th><th>Description</th><th class="cq">Qty</th><th class="cr">Rate</th><th class="ca">Amount</th></tr></thead>
              <tbody>${itemRows}</tbody>
            </table>
          </div>

          <div class="tots">
            <div class="notes"><div class="n-lbl">Notes</div><div class="n-txt">Thank you for your business! Goods once sold will not be taken back.</div></div>
            <div class="tbox">
              <div class="tr"><span>Subtotal</span><span>₹${viewBill.subtotal.toFixed(2)}</span></div>
              ${viewBill.discount > 0 ? `<div class="tr td-disc"><span>Discount</span><span>− ₹${viewBill.discount.toFixed(2)}</span></div>` : ''}
              <div class="tg"><span>Grand Total</span><span class="tg-amt">₹${viewBill.total.toFixed(2)}</span></div>
            </div>
          </div>

          <div class="foot">
            <div class="foot-ico">✓</div>
            <div><div class="foot-t">Computer Generated Invoice</div><div class="foot-s">No signature required</div></div>
          </div>
        </div>
      </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  return (
    <>
      <Navbar />
      <div className="billing-page">
        {/* Toast */}
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            <span className="toast-icon">{toast.type === 'success' ? '✓' : '!'}</span>
            {toast.message}
          </div>
        )}

        {/* Bill Receipt Modal */}
        {viewBill && (() => {
          const billDate = new Date(viewBill.billDate);
          const fmtDate = billDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
          const fmtTime = billDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
          const itemCount = viewBill.items.reduce((s, it) => s + it.quantity, 0);
          return (
          <div className="modal-overlay" onClick={() => setViewBill(null)}>
            <div className="invoice-modal" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setViewBill(null)}>✕</button>

              {/* Accent stripe */}
              <div className="inv-stripe"></div>

              {/* Header */}
              <div className="inv-hdr">
                <div className="inv-hdr-top">
                  <div className="inv-brand">
                    <div className="inv-logo">SM</div>
                    <div>
                      <div className="inv-bname">Stock Management</div>
                      <div className="inv-bsub">Inventory & Billing System</div>
                    </div>
                  </div>
                  <div className="inv-hdr-right">
                    <div className="inv-lbl-text">INVOICE</div>
                    <div className={`inv-chip ${viewBill.status === 'COMPLETED' ? 'inv-chip-ok' : 'inv-chip-no'}`}>
                      <span className="inv-dot"></span>
                      {viewBill.status === 'COMPLETED' ? 'PAID' : 'UNPAID'}
                    </div>
                  </div>
                </div>
                <div className="inv-bar">
                  <span className="inv-bar-lbl">Invoice</span>
                  <span className="inv-bar-val">{viewBill.billNumber}</span>
                </div>
              </div>

              {/* Body */}
              <div className="inv-content">
                {/* Meta */}
                <div className="inv-meta-row">
                  <div className="inv-mc">
                    <span className="inv-mc-ico">📅</span>
                    <div>
                      <div className="inv-mc-lbl">Date</div>
                      <div className="inv-mc-val">{fmtDate}</div>
                      <div className="inv-mc-sub">{fmtTime}</div>
                    </div>
                  </div>
                  <div className="inv-mc">
                    <span className="inv-mc-ico">{paymentIcons[viewBill.paymentMethod] || '💳'}</span>
                    <div>
                      <div className="inv-mc-lbl">Payment</div>
                      <div className="inv-mc-val">{paymentLabels[viewBill.paymentMethod] || viewBill.paymentMethod}</div>
                    </div>
                  </div>
                  <div className="inv-mc">
                    <span className="inv-mc-ico">📦</span>
                    <div>
                      <div className="inv-mc-lbl">Items</div>
                      <div className="inv-mc-val">{itemCount} unit{itemCount !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                </div>

                {/* Customer */}
                <div className="inv-sep">Billed To</div>
                <div className="inv-cust">
                  <div className="inv-cust-av">{viewBill.customerName.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="inv-cust-nm">{viewBill.customerName}</div>
                  </div>
                </div>

                {/* Items */}
                <div className="inv-sep">Items</div>
                <div className="inv-tw">
                  <table className="inv-tbl">
                    <thead>
                      <tr>
                        <th className="inv-th-n">#</th>
                        <th>Description</th>
                        <th className="inv-th-q">Qty</th>
                        <th className="inv-th-r">Rate</th>
                        <th className="inv-th-a">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewBill.items.map((item, i) => (
                        <tr key={item.id || i} className={i % 2 === 1 ? 'inv-alt' : ''}>
                          <td className="inv-cn">{i + 1}</td>
                          <td className="inv-cd">{item.product?.name || 'Product'}</td>
                          <td className="inv-cq">{item.quantity}</td>
                          <td className="inv-cr">₹{item.unitPrice.toFixed(2)}</td>
                          <td className="inv-ca">₹{item.lineTotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="inv-tots">
                  <div className="inv-notes">
                    <div className="inv-notes-lbl">Notes</div>
                    <div className="inv-notes-txt">Thank you for your business! Goods once sold will not be taken back.</div>
                  </div>
                  <div className="inv-tbox">
                    <div className="inv-tr">
                      <span>Subtotal</span>
                      <span>₹{viewBill.subtotal.toFixed(2)}</span>
                    </div>
                    {viewBill.discount > 0 && (
                      <div className="inv-tr inv-tr-disc">
                        <span>Discount</span>
                        <span>− ₹{viewBill.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="inv-tg">
                      <span>Grand Total</span>
                      <span className="inv-tg-amt">₹{viewBill.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="inv-foot">
                  <div className="inv-foot-ico">✓</div>
                  <div>
                    <div className="inv-foot-t">Computer Generated Invoice</div>
                    <div className="inv-foot-s">No signature required</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="inv-actions">
                <button className="inv-btn-print" onClick={printBill}>
                  <span>🖨️</span> Print Invoice
                </button>
                <button className="inv-btn-close" onClick={() => setViewBill(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
          );
        })()}

        {/* Page Header */}
        <div className="billing-page-header">
          <div>
            <h1>
              <span className="page-header-icon">🧾</span>
              Billing & Invoicing
            </h1>
            <p>Create bills, manage invoices and track revenue</p>
          </div>
          <div className="page-header-date">
            📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>

        {/* Summary cards */}
        <div className="billing-stats">
          <div className="stat-card stat-card-blue">
            <div className="stat-icon">🧾</div>
            <div className="stat-info">
              <span className="stat-value">{bills.length}</span>
              <span className="stat-label">Total Bills</span>
            </div>
          </div>
          <div className="stat-card stat-card-green">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <span className="stat-value">₹{bills.reduce((s, b) => s + b.total, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <span className="stat-label">Total Revenue</span>
            </div>
          </div>
          <div className="stat-card stat-card-purple">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <span className="stat-value">{billItems.length}</span>
              <span className="stat-label">Items in Cart</span>
            </div>
          </div>
          <div className="stat-card stat-card-orange">
            <div className="stat-icon">🏷️</div>
            <div className="stat-info">
              <span className="stat-value">₹{total > 0 ? total.toFixed(2) : '0.00'}</span>
              <span className="stat-label">Current Bill</span>
            </div>
          </div>
        </div>

        <div className="billing-layout">
          {/* Left column — Bill creation */}
          <div className="billing-main">
            {/* Customer + Payment */}
            <div className="card card-slide-in">
              <div className="card-header">
                <div className="card-header-icon card-header-icon-indigo">👤</div>
                <h2>Customer Details</h2>
              </div>
              <form onSubmit={handleSubmit} id="billingForm">
                <div className="customer-fields-grid">
                  <div className="form-group-modern">
                    <label>Customer Name</label>
                    <input type="text" placeholder="Enter customer name" value={customerForm.customerName} onChange={e => setCustomerForm({ ...customerForm, customerName: e.target.value })} required />
                  </div>
                  <div className="form-group-modern">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="Enter phone number" value={customerForm.customerPhone} onChange={e => setCustomerForm({ ...customerForm, customerPhone: e.target.value })} />
                  </div>
                  <div className="form-group-modern">
                    <label>Email Address</label>
                    <input type="email" placeholder="Enter email address" value={customerForm.customerEmail} onChange={e => setCustomerForm({ ...customerForm, customerEmail: e.target.value })} />
                  </div>
                  <div className="form-group-modern form-group-pay">
                    <label>Payment Method</label>
                    <div className="payment-options">
                      {Object.entries(paymentLabels).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          className={`payment-btn ${customerForm.paymentMethod === value ? 'payment-btn-active' : ''}`}
                          onClick={() => setCustomerForm({ ...customerForm, paymentMethod: value })}
                        >
                          <span>{paymentIcons[value]}</span>
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Add items */}
            <div className="card card-slide-in">
              <div className="card-header">
                <div className="card-header-icon card-header-icon-teal">🛒</div>
                <h2>Add Items</h2>
              </div>
              <div className="add-item-row">
                <div className="add-item-select-wrapper">
                  <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="add-item-select">
                    <option value="">Select a product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{p.sellingPrice.toFixed(2)} [Stock: {p.currentStock}]
                      </option>
                    ))}
                  </select>
                  {selectedProduct && (
                    <div className="selected-product-preview">
                      <span className="preview-name">{selectedProduct.name}</span>
                      <span className="preview-price">₹{selectedProduct.sellingPrice.toFixed(2)}</span>
                      <span className="preview-stock">Stock: {selectedProduct.currentStock}</span>
                    </div>
                  )}
                </div>
                <div className="add-item-qty">
                  <button type="button" className="qty-btn" onClick={() => setBillQuantity(Math.max(1, billQuantity - 1))}>−</button>
                  <input type="number" min="1" value={billQuantity} onChange={e => setBillQuantity(parseInt(e.target.value) || 1)} className="qty-input" />
                  <button type="button" className="qty-btn" onClick={() => setBillQuantity(billQuantity + 1)}>+</button>
                </div>
                <button type="button" onClick={addBillItem} className="btn btn-primary btn-add-item">
                  + Add
                </button>
              </div>

              {/* Bill items list */}
              {billItems.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">🛒</div>
                  <p>No items added yet</p>
                  <span>Select a product above to start billing</span>
                </div>
              ) : (
                <div className="cart-items">
                  {billItems.map((item, index) => (
                    <div key={index} className="cart-item">
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-price">₹{item.price.toFixed(2)} each</span>
                      </div>
                      <div className="cart-item-controls">
                        <div className="cart-qty-group">
                          <button type="button" className="qty-btn-sm" onClick={() => updateItemQuantity(index, item.quantity - 1)}>−</button>
                          <span className="cart-qty-display">{item.quantity}</span>
                          <button type="button" className="qty-btn-sm" onClick={() => updateItemQuantity(index, item.quantity + 1)}>+</button>
                        </div>
                        <span className="cart-item-total">₹{(item.price * item.quantity).toFixed(2)}</span>
                        <button type="button" onClick={() => removeBillItem(index)} className="cart-remove-btn" title="Remove item">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column — Totals & submit */}
          <div className="billing-sidebar">
            <div className="card summary-card">
              <div className="summary-header">
                <div className="summary-header-icon">📋</div>
                <h2>Bill Summary</h2>
              </div>

              <div className="summary-items-badge">
                <span className="summary-items-num">{billItems.length}</span>
                <span>item{billItems.length !== 1 ? 's' : ''} in bill</span>
              </div>

              {/* Item breakdown */}
              {billItems.length > 0 && (
                <div className="summary-breakdown">
                  {billItems.map((item, i) => (
                    <div key={i} className="summary-bk-row">
                      <span className="summary-bk-name">{item.name} <span className="summary-bk-qty">×{item.quantity}</span></span>
                      <span className="summary-bk-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="summary-calc">
                <div className="summary-calc-row">
                  <span>Subtotal</span>
                  <span className="summary-calc-val">₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="summary-calc-row summary-calc-input">
                  <label>Discount</label>
                  <div className="summary-input-wrapper">
                    <span className="summary-input-prefix">%</span>
                    <input type="number" step="1" min="0" max="100" value={discount} onChange={e => setDiscount(Math.min(100, parseFloat(e.target.value) || 0))} className="summary-input" />
                  </div>
                </div>
                {discount > 0 && (
                  <div className="summary-calc-row summary-discount-detail">
                    <span>Discount ({discount}%)</span>
                    <span className="summary-discount-amt">− ₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="summary-grand">
                <div className="summary-grand-label">Total Amount</div>
                <div className="summary-grand-value">₹{total.toFixed(2)}</div>
              </div>

              <button
                type="submit"
                form="billingForm"
                className={`btn btn-generate ${submitting ? 'btn-loading' : ''}`}
                disabled={submitting || billItems.length === 0}
              >
                {submitting ? 'Generating...' : '🧾 Generate Bill'}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Bills */}
        <div className="card">
          <div className="card-header card-header-split">
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div className="card-header-icon card-header-icon-indigo">📜</div>
              <h2>Recent Bills</h2>
            </div>
            <span className="bill-count-badge">{bills.length} bills</span>
          </div>

          {bills.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📜</div>
              <p>No bills yet. Create your first bill above!</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Bill #</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map(bill => {
                    const date = new Date(bill.billDate);
                    return (
                      <tr key={bill.id} className="bill-row-clickable" onClick={() => handleViewBill(bill.id)}>
                        <td><span className="bill-number-badge">{bill.billNumber}</span></td>
                        <td className="dim-text">{date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="customer-cell">{bill.customerName}</td>
                        <td><span className="items-count-badge">{bill.items.length}</span></td>
                        <td className="price-cell">₹{bill.total.toFixed(2)}</td>
                        <td>
                          <span className="payment-badge">
                            {paymentIcons[bill.paymentMethod]} {paymentLabels[bill.paymentMethod] || bill.paymentMethod}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill ${bill.status === 'COMPLETED' ? 'status-pill-success' : 'status-pill-danger'}`}>
                            {bill.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
