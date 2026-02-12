# Dealer Module Report & Functional Specification

## Overview
The Dealer Module is a dedicated portal for suppliers/dealers to manage their inventory supply chain, fulfill orders assigned by the admin, track customer sales, and manage their business profile. It is secured via JWT authentication to ensure only authorized dealers can access it.

## 1. Dashboard & Analytics
**Functionality:**
- Provides a high-level overview of the dealer's business performance.
- **Real-time Updates:** The dashboard polls for new data every 15 seconds to keep stats fresh.

**Key Metrics Displayed:**
- **Active Orders:** Number of orders currently in progress (Approved, Processing, Dispatched).
- **Completed Supply:** Total count of orders successfully delivered to the platform.
- **Pending Requests:** Number of stock requests waiting for Admin approval.
- **Total Supplied:** Aggregate count of individual items supplied.
- **Customer Sales:** Total number of customer orders involving the dealer's products.

---

## 2. Supply Order Management
This section handles orders *from the Admin to the Dealer* (i.e., the platform ordering stock from the dealer).

### A. View Assigned Orders
- **Description:** Displays a table of orders assigned to the logged-in dealer.
- **Data Points:** Order ID, Product Image/Name, Quantity, Total Amount, Current Status, Payment Status.

### B. Confirm Supply (`confirm-order`)
- **Trigger:** "🚀 Confirm Supply" button.
- **Condition:** Order status must be `APPROVED`.
- **Result:** Updates order status to `PROCESSING`. Signals to Admin that dealer has accepted and is preparing the stock.

### C. Mark Delivered (`deliver-order`)
- **Trigger:** "📦 Mark Delivered" button.
- **Condition:** Order status must be `PROCESSING`.
- **Result:** 
    1. Updates order status to `COMPLETED`.
    2. **Auto-Stock Update:** Automatically increments the product stock in the main inventory (`Product` collection) by the supplied quantity.
    3. Resolves any associated `StockAlerts` automatically.

### D. Reject Order (`reject-order`)
- **Trigger:** "✕ Reject" button.
- **Condition:** Order is `APPROVED` or `PROCESSING`.
- **Result:** Updates status to `REJECTED`. Admin is notified used to re-assign or cancel.

### E. Supply Bill / Invoice
- **Trigger:** "📄 Bill" button (on Supply Orders).
- **Description:** Generates a printable invoice for the supply transaction between the Dealer and the Platform (Admin).
- **Component:** `DealerInvoice.jsx`.

---

## 3. Stock Requests
Dealers can request permission to supply more stock for specific products.

### A. Request New Stock (`request-stock`)
- **Trigger:** "+ New Stock Request" button -> Modal Form.
- **Input:** Select Product, Enter Quantity.
- **Logic:** Submits a request to the Admin. Logic ensures no duplicate pending requests exist for the same product to prevent spam.
- **Status:** Starts as `PENDING_ADMIN_APPROVAL`.

### B. View Request History
- **Description:** Shows a log of all stock requests and their current status (Pending, Approved, Rejected).
- **Admin Feedback:** Displays "Admin Note" if the admin attached a message while rejecting/approving (e.g., "Price too high").

---

## 4. Customer Sales Tracking
This section allows dealers to track when *their* products are sold to end customers.

### A. View Customer Orders
- **Description:** Lists order details for customers who bought products supplied by this dealer.
- **Data:** Order ID, Customer Name, Items list (with cancellation status), Total Amount.

### B. Customer Invoice (`CustomerInvoice`)
- **Trigger:** "📄 Bill" button (on Customer Sales).
- **Description:** Generates a professional, customer-facing invoice.
- **Features:** 
    - **Status Specifics:** Clearly shows **"Amount to Pay"** in Red if the order is COD/Pending, or "0.00" in Green if fully Paid.
    - **Cancellation Handling:** Marks cancelled items clearly and strikes through their price.
    - **Print Ready:** Dedicated print layout.

---

## 5. Profile Management
- **View/Edit Profile:** allows updating Business Name, Contact Phone, and Store Address (Street, City, State, Pincode).
- **Support:** Quick link to email Admin support.

## Technical Summary
- **Frontend:** React.js (`DealerDashboard.jsx`), CSS Modules.
- **Backend:** Node.js/Express (`dealerOrders.js`).
- **Database:** MongoDB (`DealerOrder`, `StockRequest`, `Product`, `Order` models).
- **Security:** `verifyDealer` middleware ensures strict role-based access control.
