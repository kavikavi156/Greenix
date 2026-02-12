import { useState, useEffect } from 'react';
import '../css/ProfessionalAdminDashboard.css';
import '../css/ProfessionalChart.css';
import ProfessionalChart from './ProfessionalChart';

import DealerInvoice from './DealerInvoice';
import CustomerInvoice from './CustomerInvoice';
import { getImageUrl } from '../config/api';


// Configuration for dynamic category fields
const CATEGORY_CONFIG = {
  'Fertilizers': {
    weightLabel: 'Bag Weight (e.g., 50kg)',
    unitLabel: 'Unit (e.g., Bags)',
    weightPlaceholder: '50kg',
    unitPlaceholder: 'Bags'
  },
  'Seeds': {
    weightLabel: 'Packet Weight',
    unitLabel: 'Unit (e.g., Packets)',
    weightPlaceholder: '1kg',
    unitPlaceholder: 'Packets'
  },
  'Tools': {
    weightLabel: 'Size / Dimensions',
    unitLabel: 'Unit (e.g., Pieces)',
    weightPlaceholder: 'e.g., 10 inch, Large',
    unitPlaceholder: 'Pieces'
  },
  'Equipment': {
    weightLabel: 'Size / Capacity',
    unitLabel: 'Unit',
    weightPlaceholder: 'e.g., 16L Tank',
    unitPlaceholder: 'Units'
  },
  'Herbicides': {
    weightLabel: 'Volume / Weight',
    unitLabel: 'Unit (e.g., Bottles)',
    weightPlaceholder: 'e.g., 1L, 500ml',
    unitPlaceholder: 'Bottles'
  },
  'Insecticides': {
    weightLabel: 'Volume / Weight',
    unitLabel: 'Unit (e.g., Bottles)',
    weightPlaceholder: 'e.g., 1L, 500ml',
    unitPlaceholder: 'Bottles'
  },
  'Fungicides': {
    weightLabel: 'Volume / Weight',
    unitLabel: 'Unit (e.g., Packs)',
    weightPlaceholder: 'e.g., 1kg, 500g',
    unitPlaceholder: 'Packs'
  },
  'default': {
    weightLabel: 'Weight / Size',
    unitLabel: 'Unit',
    weightPlaceholder: 'e.g., 1kg, 500g',
    unitPlaceholder: 'Units'
  }
};

const CATEGORY_BRANDS = {
  'Fertilizers': [
    'Coromandel International Ltd',
    'Madras Fertilizers Ltd',
    'The Fertilisers and Chemicals Travancore Ltd (FACT)',
    'IFFCO',
    'IPL',
    'Other'
  ],
  'Seeds': [
    'Monsanto',
    'Syngenta',
    'Other'
  ],
  'Pesticides': [
    'Bayer',
    'Syngenta',
    'Other'
  ],
  'default': ['Generic', 'Other']
};

export default function ProfessionalAdminDashboard({ token, onLogout }) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  // Revenue analysis state
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [yearlyRevenue, setYearlyRevenue] = useState([]); // Store yearly data
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueTimeRange, setRevenueTimeRange] = useState('monthly'); // 'monthly', 'quarterly', 'yearly'
  const [availableBrands, setAvailableBrands] = useState([]); // Dynamic brands from backend

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    basePrice: '',
    category: '',
    stock: '',
    unit: '',
    brand: '',
    weight: '',
    features: '',
    tags: '',
    image: null,
    lowStockThreshold: '10' // Default value
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: ''
  });

  // Notification state
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Admin Management state
  const [adminList, setAdminList] = useState([]);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'admin'
  });

  // Sales Report state
  const [salesReport, setSalesReport] = useState({
    monthly: [],
    yearly: [],
    selectedPeriod: 'monthly',
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1
  });

  // Product-wise Sales Report state
  const [productSalesFilter, setProductSalesFilter] = useState({
    selectedProduct: 'all',
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    loading: false
  });

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [selectedProductFilter, setSelectedProductFilter] = useState('all');
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Low stock filter state
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Stock Requests & Dealers State
  const [stockRequests, setStockRequests] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [approvalModal, setApprovalModal] = useState({ show: false, request: null, quantity: '', dealerId: '' });
  const [rejectModal, setRejectModal] = useState({ show: false, request: null, reason: '' });
  const [requestsFilter, setRequestsFilter] = useState('pending'); // 'pending' | 'all'

  // Dealer Management State
  const [dealerForm, setDealerForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: { street: '', city: '', state: '', pincode: '' },
    suppliedCategory: ''
  });

  // Invoice State
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [selectedCustomerOrder, setSelectedCustomerOrder] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchCategories();
    fetchStockRequests(); // Fetch stock requests for notifications
    fetchDealers(); // Fetch dealers for approval
    fetchMonthlyRevenue(new Date().getFullYear()); // Fetch revenue data for charts
  }, []);

  useEffect(() => {
    if (currentView === 'admin-management') {
      fetchAdminList();
    }
    if (currentView === 'reviews') {
      fetchReviews();
    }
    if (currentView === 'stock-requests' || currentView === 'dealers') {
      fetchStockRequests();
      fetchDealers();
    }
  }, [currentView]);

  useEffect(() => {
    if (productForm.category) {
      fetchBrandsForCategory(productForm.category);
    }
  }, [productForm.category]);

  async function fetchBrandsForCategory(category) {
    try {
      if (!category) return;

      const response = await fetch(`http://localhost:3001/api/products/filters/options?category=${encodeURIComponent(category)}`);
      if (response.ok) {
        const data = await response.json();
        // Set only new brands that are NOT in the predefined list
        const predefined = CATEGORY_BRANDS[category] || CATEGORY_BRANDS['default'] || [];
        const newBrands = (data.brands || []).filter(brand => !predefined.includes(brand));
        setAvailableBrands(newBrands);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  }

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // Fetch orders
      const ordersRes = await fetch('http://localhost:3001/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();
      console.log('Orders received from backend:', ordersData);
      if (ordersData.length > 0) {
        console.log('Sample order:', ordersData[0]);
        console.log('Sample order items:', ordersData[0].items);
        console.log('Sample order products:', ordersData[0].products);
      }
      setOrders(ordersData || []);

      // Fetch products
      const productsRes = await fetch('http://localhost:3001/api/products');
      const productsData = await productsRes.json();
      const productsArray = productsData.products || productsData || [];
      setProducts(productsArray.filter(p => p)); // Filter out any undefined or null products

      // Calculate stats (include all orders in revenue and count)
      const totalRevenue = (ordersData || []).reduce((sum, order) => sum + (order?.totalAmount || 0), 0);
      const lowStockProducts = productsArray.filter(p => {
        const threshold = p.lowStockThreshold !== undefined && p.lowStockThreshold !== null
          ? Number(p.lowStockThreshold)
          : 10;
        return p && p.stock <= threshold;
      }).length;
      const pendingOrders = (ordersData || []).filter(order =>
        order && (order.status === 'pending' || order.status === 'ordered')
      ).length;

      console.log('Dashboard stats calculated:', {
        totalOrders: (ordersData || []).length,
        totalRevenue,
        pendingOrders,
        ordersStatuses: (ordersData || []).map(o => o.status)
      });

      setStats({
        totalOrders: (ordersData || []).length,
        totalProducts: (productsData.products || productsData || []).length,
        totalRevenue,
        lowStockProducts,
        pendingOrders
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('Error fetching dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch('http://localhost:3001/api/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async function fetchStockRequests() {
    try {
      const response = await fetch('http://localhost:3001/api/admin-stock/stock-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStockRequests(data || []);
      }
    } catch (error) {
      console.error('Error fetching stock requests:', error);
    }
  }

  async function fetchDealers() {
    try {
      const response = await fetch('http://localhost:3001/api/admin-stock/dealers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDealers(data || []);
      }
    } catch (error) {
      console.error('Error fetching dealers:', error);
    }
  }

  async function handleApproveStockRequest(request) {
    // We let the backend validate if a dealer is needed but missing
    // or use the product's default dealer if not selected.

    try {
      const payload = {
        quantity: approvalModal.quantity || request.requestedQuantity
      };

      // Only add dealerId if it exists in the modal state
      if (approvalModal.dealerId) {
        payload.dealerId = approvalModal.dealerId;
      }

      const response = await fetch(`http://localhost:3001/api/admin-stock/approve-request/${request._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showNotification('Stock request approved and order sent to dealer!', 'success');
        setApprovalModal({ show: false, request: null, quantity: '', dealerId: '' });
        fetchStockRequests();
        fetchDashboardData();
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to approve request', 'error');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      showNotification('Error approving request', 'error');
    }
  }

  async function handleRejectStockRequest(requestId, reason = '') {
    try {
      const response = await fetch(`http://localhost:3001/api/admin-stock/reject-request/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        showNotification('Stock request rejected', 'success');
        fetchStockRequests();
        fetchDashboardData();
      } else {
        showNotification('Failed to reject request', 'error');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      showNotification('Error rejecting request', 'error');
    }
  }

  function showNotification(message, type = 'success') {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  }

  async function fetchMonthlyRevenue(year = selectedYear) {
    setRevenueLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/admin/revenue/monthly?year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMonthlyRevenue(data.monthlyRevenue || []);
      } else {
        showNotification('Failed to fetch monthly revenue', 'error');
      }
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      showNotification('Error fetching monthly revenue', 'error');
    } finally {
      setRevenueLoading(false);
    }
  }

  async function fetchYearlyRevenue() {
    try {
      const response = await fetch('http://localhost:3001/api/admin/revenue/yearly', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setYearlyRevenue(data.yearlyRevenue || []);
      }
    } catch (error) {
      console.error('Error fetching yearly revenue:', error);
    }
  }

  useEffect(() => {
    fetchYearlyRevenue();
  }, []);

  function handleRevenueCardClick() {
    setShowRevenueModal(true);
    fetchMonthlyRevenue();
    fetchYearlyRevenue();
  }

  function handleLowStockClick() {
    setCurrentView('products');
    setShowLowStockOnly(true);
    setIsEditModalOpen(false); // Close any open modals
    setEditingProduct(null); // Clear editing state
  }


  function handleMonthChange(month) {
    setSelectedMonth(month);
  }

  function handleYearChange(year) {
    setSelectedYear(year);
    fetchMonthlyRevenue(year);
  }

  function getMonthName(monthNum) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNum - 1];
  }

  async function handleAddProduct(e) {
    e.preventDefault();

    // If editing, update instead of add
    if (editingProduct) {
      return handleUpdateProduct(e);
    }

    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('basePrice', productForm.basePrice || productForm.price);
      formData.append('category', productForm.category);
      formData.append('stock', productForm.stock);
      formData.append('unit', productForm.unit);
      formData.append('brand', productForm.brand);
      formData.append('weight', productForm.weight);
      formData.append('features', productForm.features);
      formData.append('tags', productForm.tags);
      formData.append('lowStockThreshold', productForm.lowStockThreshold);
      if (productForm.image) {
        formData.append('image', productForm.image);
      }

      const response = await fetch('http://localhost:3001/api/admin/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        showNotification('Product added successfully!');
        setProductForm({
          name: '',
          description: '',
          price: '',
          basePrice: '',
          category: '',
          stock: '',
          unit: '',
          brand: '',
          weight: '',
          features: '',
          tags: '',
          image: null,
          lowStockThreshold: '10'
        });
        fetchDashboardData(); // Refresh products
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error}`, 'error');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      showNotification('Error adding product', 'error');
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(categoryForm)
      });

      if (response.ok) {
        showNotification('Category added successfully!');
        setCategoryForm({ name: '', description: '', icon: '' });
        fetchCategories(); // Refresh categories
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error}`, 'error');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      showNotification('Error adding category', 'error');
    }
  }

  async function handleDeleteCategory(categoryId, categoryName) {
    if (window.confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      try {
        const response = await fetch(`http://localhost:3001/api/admin/categories/${categoryId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          showNotification('Category deleted successfully!');
          fetchCategories(); // Refresh categories
        } else {
          const errorData = await response.json();
          showNotification(`Error: ${errorData.message || 'Failed to delete category'}`, 'error');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        showNotification('Error deleting category', 'error');
      }
    }
  }

  async function handleDeleteProduct(productId) {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/admin/products/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          showNotification('Product deleted successfully!');
          // Remove from local state
          setProducts(prev => prev.filter(p => p._id !== productId));

          // Re-calculate stats - update product count and low stock count
          setStats(prevStats => ({
            ...prevStats,
            totalProducts: prevStats.totalProducts - 1,
            lowStockProducts: products.filter(p => p._id !== productId && p.stock <= (p.lowStockThreshold || 10)).length
          }));
        } else {
          showNotification('Error deleting product', 'error');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product', 'error');
      }
    }
  }

  function handleEditProduct(product) {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      basePrice: (product.basePrice || product.price).toString(),
      category: product.category,
      stock: product.stock.toString(),
      unit: product.unit || '',
      brand: product.brand || '',
      weight: product.weight || '',
      features: (product.features || []).join(', '),
      tags: (product.tags || []).join(', '),
      image: null, // Don't pre-fill image as it's a file input
      lowStockThreshold: (product.lowStockThreshold || 10).toString()
    });
    // Scroll to the form at the top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleUpdateProduct(e) {
    e.preventDefault();

    // Save current scroll position
    const scrollPosition = window.scrollY;

    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('basePrice', productForm.basePrice || productForm.price);
      formData.append('category', productForm.category);
      formData.append('stock', productForm.stock);
      formData.append('unit', productForm.unit);
      formData.append('brand', productForm.brand);
      formData.append('weight', productForm.weight);
      formData.append('features', productForm.features);
      formData.append('tags', productForm.tags);
      formData.append('lowStockThreshold', productForm.lowStockThreshold);
      if (productForm.image) {
        formData.append('image', productForm.image);
      }

      const response = await fetch(`http://localhost:3001/api/admin/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const updatedProduct = await response.json();

        // Update the products list without full refresh
        setProducts(prevProducts =>
          prevProducts.filter(p => p).map(p => p._id === editingProduct._id ? updatedProduct.product : p)
        );

        showNotification('Product updated successfully!');
        setEditingProduct(null);
        setProductForm({
          name: '',
          description: '',
          price: '',
          basePrice: '',
          category: '',
          stock: '',
          unit: '',
          brand: '',
          weight: '',
          features: '',
          tags: '',
          image: null,
          lowStockThreshold: '10'
        });

        // Restore scroll position after state update
        setTimeout(() => {
          window.scrollTo({ top: scrollPosition, behavior: 'instant' });
        }, 0);
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error}`, 'error');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      showNotification('Error updating product', 'error');
    }
  }

  async function handleUpdateOrderStatus(orderId, newStatus) {
    try {
      // Optimistically update the UI immediately
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );

      const response = await fetch(`http://localhost:3001/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        showNotification('Order status updated successfully!');
        // No need to refresh since we already updated optimistically
      } else {
        // If failed, revert the optimistic update
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId
              ? { ...order, status: order.originalStatus || order.status }
              : order
          )
        );
        showNotification('Error updating order status', 'error');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      // Revert the optimistic update on error
      fetchDashboardData();
      showNotification('Error updating order status', 'error');
    }
  }

  // Enhanced chart data preparation
  const prepareChartData = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Calculate monthly revenue for the current year
    const monthlyData = Array.from({ length: 12 }, (_, index) => {
      const monthOrders = orders.filter(order => {
        if (!order) return false;
        const orderDate = new Date(order.orderDate || order.createdAt);
        return orderDate.getMonth() === index && orderDate.getFullYear() === new Date().getFullYear();
      });

      const revenue = monthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const orderCount = monthOrders.length;

      return {
        month: monthNames[index],
        revenue,
        orders: orderCount
      };
    });

    return monthlyData;
  };

  // Helper to map month number to short name if needed
  const getShortMonthName = (m) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (typeof m === 'number') return months[m - 1];
    return m.toString().substring(0, 3);
  };

  // 1. Base Monthly Data (Source of Truth for Monthly/Quarterly)
  const baseMonthlyData = monthlyRevenue.length > 0 ? monthlyRevenue.map(d => ({
    ...d,
    label: getShortMonthName(d.month)
  })) : prepareChartData().map(d => ({ ...d, label: d.month, month: d.month })); // Standardization

  const chartData = baseMonthlyData; // Backward compatibility for other charts

  // 2. Prepare Data for Each View
  let activeChartData = [];

  if (revenueTimeRange === 'monthly') {
    activeChartData = baseMonthlyData;
  } else if (revenueTimeRange === 'quarterly') {
    // Aggregate into Quarters
    const quarters = ['Q1 (Jan-Mar)', 'Q2 (Apr-Jun)', 'Q3 (Jul-Sep)', 'Q4 (Oct-Dec)'];
    activeChartData = quarters.map((qLabel, index) => {
      const startMonth = index * 3 + 1; // 1, 4, 7, 10
      const endMonth = startMonth + 2;

      // Filter months in this quarter (handle both 1-indexed number month and named month logic)
      const quarterMonths = baseMonthlyData.slice(index * 3, index * 3 + 3);

      return {
        label: qLabel,
        revenue: quarterMonths.reduce((sum, m) => sum + (m.revenue || 0), 0),
        orders: quarterMonths.reduce((sum, m) => sum + (m.orders || 0), 0)
      };
    });
  } else if (revenueTimeRange === 'yearly') {
    // Use Yearly Data fetched from backend
    activeChartData = yearlyRevenue.map(d => ({
      label: d.year,
      revenue: d.revenue,
      orders: d.orders
    }));

    // Fallback if no yearly data
    if (activeChartData.length === 0) {
      activeChartData = [{
        label: new Date().getFullYear().toString(),
        revenue: baseMonthlyData.reduce((sum, m) => sum + m.revenue, 0),
        orders: baseMonthlyData.reduce((sum, m) => sum + m.orders, 0)
      }];
    }
  }

  // Calculate generic stats for subtitle
  const totalDisplayRevenue = activeChartData.reduce((sum, item) => sum + item.revenue, 0);
  const averageDisplayRevenue = totalDisplayRevenue / (activeChartData.length || 1);

  const totalYearRevenue = baseMonthlyData.reduce((sum, month) => sum + (month.revenue || 0), 0);
  const totalYearOrders = baseMonthlyData.reduce((sum, month) => sum + (month.orders || 0), 0);
  const averageMonthlyRevenue = totalYearRevenue / 12;

  // Calculate growth rate based on last two months (current month vs previous month)
  const currentMonthIndex = new Date().getMonth();
  const currentMonthRevenue = baseMonthlyData[currentMonthIndex]?.revenue || 0;
  const previousMonthRevenue = baseMonthlyData[currentMonthIndex - 1]?.revenue || 0;

  const growthRate = previousMonthRevenue > 0 ?
    ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0;

  // Revenue trend line chart data
  const revenueLineData = {
    labels: activeChartData.map(item => item.label),
    datasets: [
      {
        label: `${revenueTimeRange.charAt(0).toUpperCase() + revenueTimeRange.slice(1)} Revenue`,
        data: activeChartData.map(item => item.revenue),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  // Orders bar chart data
  const ordersBarData = {
    labels: chartData.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Orders',
        data: chartData.map(item => item.orders),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }
    ]
  };

  // Category distribution doughnut data
  const categoryData = categories.reduce((acc, category) => {
    const categoryProducts = products.filter(product => product && product.category === category.name);
    acc[category.name] = categoryProducts.length;
    return acc;
  }, {});

  const categoryDoughnutData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
          '#8b5cf6', '#06d6a0', '#ff6b6b', '#4ecdc4'
        ],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 4
      }
    ]
  };

  function renderDashboard() {
    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => fetchMonthlyRevenue(new Date().getFullYear())} className="refresh-btn" style={{ background: '#3b82f6' }}>
              📊 Refresh Charts
            </button>
            <button onClick={fetchDashboardData} className="refresh-btn">
              🔄 Sync Data
            </button>
          </div>
        </div>

        {/* Enhanced Analytics Cards */}
        <div className="analytics-cards-grid">
          <div className="analytics-card revenue">
            <div className="analytics-card-header">
              <span className="analytics-card-title">Total Revenue</span>
              <span className="analytics-card-icon">�</span>
            </div>
            <div className="analytics-card-value">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
            <div className={`analytics-card-change ${growthRate >= 0 ? 'positive' : 'negative'}`}>
              <span>{growthRate >= 0 ? '↗️' : '↘️'}</span>
              {Math.abs(growthRate).toFixed(1)}% from last month
            </div>
          </div>

          <div className="analytics-card orders">
            <div className="analytics-card-header">
              <span className="analytics-card-title">Total Orders</span>
              <span className="analytics-card-icon">📊</span>
            </div>
            <div className="analytics-card-value">{stats.totalOrders}</div>
            <div className="analytics-card-change positive">
              <span>📈</span>
              {totalYearOrders} this year
            </div>
          </div>

          <div className="analytics-card growth">
            <div className="analytics-card-header">
              <span className="analytics-card-title">Avg Monthly</span>
              <span className="analytics-card-icon">�</span>
            </div>
            <div className="analytics-card-value">₹{Math.round(averageMonthlyRevenue).toLocaleString('en-IN')}</div>
            <div className="analytics-card-change neutral">
              <span>📊</span>
              Revenue average
            </div>
          </div>

          <div className="analytics-card conversion">
            <div className="analytics-card-header">
              <span className="analytics-card-title">Products</span>
              <span className="analytics-card-icon">📦</span>
            </div>
            <div className="analytics-card-value">{stats.totalProducts}</div>
            <div
              className={`analytics-card-change ${stats.lowStockProducts > 0 ? 'negative' : 'positive'}`}
              onClick={() => stats.lowStockProducts > 0 && handleLowStockClick()}
              style={{ cursor: stats.lowStockProducts > 0 ? 'pointer' : 'default' }}
              title={stats.lowStockProducts > 0 ? 'Click to view low stock products' : ''}
            >
              <span>{stats.lowStockProducts > 0 ? '⚠️' : '✅'}</span>
              {stats.lowStockProducts} low stock
            </div>
          </div>
        </div>

        {/* Low Stock Alerts Section */}
        {/* Low Stock Alerts Section */}
        {stockRequests.filter(req => req.status === 'PENDING_ADMIN_APPROVAL').length > 0 && (
          <div className="low-stock-alerts-section">
            <div className="alerts-header">
              <h2>🚨 Low Stock Alerts - Admin Approval Required</h2>
              <span className="alerts-count">
                {stockRequests.filter(req => req.status === 'PENDING_ADMIN_APPROVAL').length} pending request{stockRequests.filter(req => req.status === 'PENDING_ADMIN_APPROVAL').length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="stock-alerts-grid">
              {stockRequests.filter(req => req.status === 'PENDING_ADMIN_APPROVAL').map(request => (
                <div key={request._id} className="stock-alert-card">
                  <div className="alert-product-info">
                    <div className="alert-product-image">
                      {request.product?.image && (
                        <img
                          src={getImageUrl(request.product.image)}
                          alt={request.product?.name}
                          onError={(e) => { e.target.src = '/placeholder-product.png'; }}
                        />
                      )}
                    </div>
                    <div className="alert-product-details">
                      <h3>{request.product?.name}</h3>
                      <div className="alert-stock-info">
                        <span className="current-stock">Current Stock: <strong>{request.currentStock}</strong></span>
                        <span className="threshold">Threshold: {request.product?.lowStockThreshold ?? 10}</span>
                      </div>
                      <div className="alert-request-quantity">
                        Requested Quantity: <strong>{request.requestedQuantity}</strong>
                      </div>
                      {request.dealer && (
                        <div className="alert-dealer-info" style={{ marginTop: '5px', fontSize: '13px', color: '#6366f1' }}>
                          🏪 Requested by: <strong>{request.dealer.name}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="alert-actions">
                    <button
                      className="approve-btn"
                      onClick={() => setApprovalModal({
                        show: true,
                        request,
                        quantity: request.requestedQuantity,
                        dealerId: request.dealer?._id || request.product?.dealer || ''
                      })}
                    >
                      ✓ Approve & Order
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => {
                        const reason = prompt('Reason for rejection (optional):');
                        handleRejectStockRequest(request._id, reason);
                      }}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professional Charts Grid */}
        <div className="dashboard-charts-grid">
          <div className="chart-section-enhanced">
            <div className="chart-header-enhanced">
              <div className="chart-title">
                📈 Revenue Trend Analysis
              </div>
              <div className="chart-controls-enhanced">
                <button
                  className={`chart-control-btn ${revenueTimeRange === 'monthly' ? 'active' : ''}`}
                  onClick={() => setRevenueTimeRange('monthly')}
                >
                  Monthly
                </button>
                <button
                  className={`chart-control-btn ${revenueTimeRange === 'quarterly' ? 'active' : ''}`}
                  onClick={() => setRevenueTimeRange('quarterly')}
                >
                  Quarterly
                </button>
                <button
                  className={`chart-control-btn ${revenueTimeRange === 'yearly' ? 'active' : ''}`}
                  onClick={() => setRevenueTimeRange('yearly')}
                >
                  Yearly
                </button>
              </div>
            </div>
            <ProfessionalChart
              type="line"
              data={revenueLineData}
              title="Monthly Revenue Performance"
              subtitle={`Total Revenue: ₹${totalYearRevenue.toLocaleString('en-IN')} • Average: ₹${Math.round(averageMonthlyRevenue).toLocaleString('en-IN')}`}
              options={{
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    ticks: {
                      callback: function (value) {
                        return '₹' + (value / 1000).toFixed(0) + 'K';
                      }
                    }
                  }
                }
              }}
            />
          </div>

          <div className="chart-section-enhanced">
            <div className="chart-header-enhanced">
              <div className="chart-title">
                🏷️ Product Distribution
              </div>
            </div>
            <ProfessionalChart
              type="doughnut"
              data={categoryDoughnutData}
              height="250px"
              title="Products by Category"
              subtitle={`${stats.totalProducts} total products across ${categories.length} categories`}
              options={{
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 15,
                      usePointStyle: true
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Orders Performance Chart */}
        <div className="chart-section-enhanced">
          <div className="chart-header-enhanced">
            <div className="chart-title">
              📊 Monthly Orders Performance
            </div>
            <div className="chart-controls-enhanced">
              <button className="chart-control-btn active">Orders</button>
              <button className="chart-control-btn">Customers</button>
            </div>
          </div>
          <ProfessionalChart
            type="bar"
            data={ordersBarData}
            title="Order Volume by Month"
            subtitle={`${totalYearOrders} total orders • Peak month: ${chartData.reduce((max, month) => month.orders > max.orders ? month : max, chartData[0]).month}`}
            options={{
              plugins: {
                legend: {
                  display: false
                }
              }
            }}
          />
        </div>

        {/* Recent Orders */}
        <div className="recent-section">
          <h2>Recent Orders</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Products</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-6)}</td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">
                          {order.customerName || order.user?.username || order.deliveryAddress?.fullName || 'Unknown Customer'}
                        </div>
                        {order.deliveryAddress?.phone && (
                          <div className="customer-phone">📞 {order.deliveryAddress.phone}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="products-info">
                        {order.items && order.items.length > 0 ? (
                          <div className="products-list">
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="product-item">
                                {item.product?.name || 'Unknown Product'}
                                {item.quantity > 1 && <span className="quantity"> (×{item.quantity})</span>}
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="more-products">
                                +{order.items.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : order.products && order.products.length > 0 ? (
                          <div className="products-list">
                            {order.products.slice(0, 2).map((product, index) => (
                              <div key={index} className="product-item">
                                {product?.name || 'Unknown Product'}
                              </div>
                            ))}
                            {order.products.length > 2 && (
                              <div className="more-products">
                                +{order.products.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="no-products">No products</span>
                        )}
                      </div>
                    </td>
                    <td>₹{order.totalAmount}</td>
                    <td>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="date-info">
                        <div className="order-date">
                          {order.formattedDate || new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN')}
                        </div>
                        <div className="order-time">
                          {order.formattedTime || new Date(order.orderDate || order.createdAt).toLocaleTimeString('en-IN')}
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => setSelectedCustomerOrder(order)}
                        style={{
                          marginLeft: '8px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        📄 Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Modal */}
        {showRevenueModal && (
          <div className="modal-overlay" onClick={() => setShowRevenueModal(false)}>
            <div className="revenue-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Monthly Revenue Analysis</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowRevenueModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-content">
                <div className="revenue-controls">
                  <div className="year-selector">
                    <label>Year:</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => handleYearChange(Number(e.target.value))}
                    >
                      {[2023, 2024, 2025, 2026].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div className="month-selector">
                    <label>Month:</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => handleMonthChange(Number(e.target.value))}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>
                          {getMonthName(month)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {revenueLoading ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading revenue data...</p>
                  </div>
                ) : (
                  <div className="revenue-content">
                    <div className="revenue-summary">
                      <h3>Revenue for {getMonthName(selectedMonth)} {selectedYear}</h3>
                      <div className="selected-month-revenue">
                        ₹{(monthlyRevenue.find(m => m.month === selectedMonth)?.revenue || 0).toLocaleString()}
                      </div>
                    </div>

                    <div className="monthly-breakdown">
                      <h4>Year Overview</h4>
                      <div className="revenue-grid">
                        {monthlyRevenue.map((data, index) => (
                          <div
                            key={index}
                            className={`month-card ${data.month === selectedMonth ? 'selected' : ''}`}
                            onClick={() => handleMonthChange(data.month)}
                          >
                            <div className="month-name">{getMonthName(data.month)}</div>
                            <div className="month-revenue">₹{data.revenue.toLocaleString()}</div>
                            <div className="month-orders">{data.orders} orders</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderProducts() {
    return (
      <div className="products-content">
        <div className="section-header">
          <h1>Product Management</h1>
        </div>

        {/* Add Product Form */}
        <div className="form-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            {editingProduct && (
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    description: '',
                    price: '',
                    basePrice: '',
                    category: '',
                    stock: '',
                    unit: '',
                    brand: '',
                    weight: '',
                    features: '',
                    tags: '',
                    image: null,
                    lowStockThreshold: '10'
                  });
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
          <form onSubmit={handleAddProduct} className="product-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Current Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Base Price per Unit (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={productForm.basePrice}
                  onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              {(() => {
                const config = CATEGORY_CONFIG[productForm.category] || CATEGORY_CONFIG['default'];
                return (
                  <>
                    <div className="form-group">
                      <label>Stock Quantity *</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Low Stock Alert Level</label>
                      <input
                        type="number"
                        placeholder="Default: 10"
                        value={productForm.lowStockThreshold}
                        onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: e.target.value })}
                        title="Alert when stock falls below this number"
                      />
                    </div>
                    <div className="form-group">
                      <label>{config.unitLabel}</label>
                      <input
                        type="text"
                        placeholder={config.unitPlaceholder}
                        value={productForm.unit}
                        onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Brand</label>
                      <select
                        value={
                          productForm.brand &&
                            [...(CATEGORY_BRANDS[productForm.category] || CATEGORY_BRANDS['default'] || []), ...availableBrands]
                              .includes(productForm.brand) ? productForm.brand : 'Other'
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'Other') {
                            setProductForm({ ...productForm, brand: '' });
                          } else {
                            setProductForm({ ...productForm, brand: val });
                          }
                        }}
                        style={{ marginBottom: '8px' }}
                      >
                        <option value="">Select Brand</option>
                        {/* Combine Predefined and Dynamically Fetched Brands */}
                        {[
                          ...(CATEGORY_BRANDS[productForm.category] || CATEGORY_BRANDS['default'] || []),
                          ...availableBrands
                        ]
                          // Filter out 'Other' to put it at the end
                          .filter(brand => brand !== 'Other')
                          // Remove duplicates
                          .filter((brand, index, self) => self.indexOf(brand) === index)
                          .map((brand, index) => (
                            <option key={index} value={brand}>{brand}</option>
                          ))
                        }
                        <option value="Other">Other (Custom Brand)</option>
                      </select>
                      {/* Show text input if brand is not in the list or 'Other' is selected */}
                      {(!productForm.brand ||
                        ![...(CATEGORY_BRANDS[productForm.category] || CATEGORY_BRANDS['default'] || []), ...availableBrands].includes(productForm.brand)
                      ) && (
                          <input
                            type="text"
                            placeholder="Enter custom brand name"
                            value={productForm.brand}
                            onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                          />
                        )}
                    </div>
                    <div className="form-group">
                      <label>{config.weightLabel}</label>
                      <input
                        type="text"
                        placeholder={config.weightPlaceholder}
                        value={productForm.weight}
                        onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                      />
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Description *</label>
              <textarea
                placeholder="Product Description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                required
                rows="4"
              />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Features</label>
              <input
                type="text"
                placeholder="Comma-separated features (e.g., Organic, Fast-acting)"
                value={productForm.features}
                onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Tags</label>
              <input
                type="text"
                placeholder="Comma-separated tags (e.g., fertilizer, growth, new)"
                value={productForm.tags}
                onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label>Product Image {editingProduct ? '' : '*'}</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProductForm({ ...productForm, image: e.target.files[0] })}
                required={!editingProduct}
                style={{ padding: '8px' }}
              />
              {editingProduct && (
                <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                  Leave empty to keep current image
                </small>
              )}
            </div>
            <button type="submit" className="submit-btn" style={{ width: '100%' }}>
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </form>
        </div>

        {/* Products List */}
        <div className="products-list">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>All Products</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => setShowLowStockOnly(false)}
                className={!showLowStockOnly ? 'filter-btn-active' : 'filter-btn-inactive'}
                style={{
                  padding: '10px 20px',
                  backgroundColor: !showLowStockOnly ? '#1e3c72' : '#fff',
                  color: !showLowStockOnly ? '#fff' : '#666',
                  border: !showLowStockOnly ? 'none' : '2px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>📦</span> All Products ({products.length})
              </button>
              <button
                onClick={() => setShowLowStockOnly(true)}
                className={showLowStockOnly ? 'filter-btn-active' : 'filter-btn-inactive'}
                style={{
                  padding: '10px 20px',
                  backgroundColor: showLowStockOnly ? '#ff9800' : '#fff',
                  color: showLowStockOnly ? '#fff' : '#666',
                  border: showLowStockOnly ? 'none' : '2px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>⚠️</span> Low Stock ({products.filter(p => p && p.stock <= (p.lowStockThreshold || 10)).length})
              </button>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Current Price</th>
                  <th>Base Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter(product => product && (!showLowStockOnly || product.stock <= (product.lowStockThreshold || 10)))
                  .map(product => (
                    <tr key={product._id}>
                      <td>
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="product-thumbnail"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23ddd" width="100" height="100"/><text fill="%23999" x="50%" y="50%" text-anchor="middle" dy=".3em">No Image</text></svg>';
                          }}
                        />
                      </td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>₹{product.price}</td>
                      <td>₹{product.basePrice || product.price}</td>
                      <td>
                        <span className={`stock-badge ${product.stock === 0 ? 'out' :
                          product.stock <= (product.lowStockThreshold || 10) ? 'low' :
                            'normal'
                          }`}>
                          {product.stock} {product.unit || 'units'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="edit-btn"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="delete-btn"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {showLowStockOnly && products.filter(p => p && p.stock <= (p.lowStockThreshold || 10)).length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#4caf50' }}>
                      <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Great! No Low Stock Products</div>
                      <div style={{ color: '#666', marginTop: '5px' }}>All products are well stocked</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function renderCategories() {
    return (
      <div className="categories-content">
        <div className="section-header">
          <h1>Category Management</h1>
        </div>

        {/* Add Category Form */}
        <div className="form-section">
          <h2>Add New Category</h2>
          <form onSubmit={handleAddCategory} className="category-form">
            <div className="form-grid">
              <input
                type="text"
                placeholder="Category Name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Icon (emoji)"
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                required
              />
            </div>
            <textarea
              placeholder="Category Description"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              required
            />
            <button type="submit" className="submit-btn">Add Category</button>
          </form>
        </div>

        {/* Categories List */}
        <div className="categories-list">
          <h2>All Categories</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <div key={category._id} className="category-card">
                <div className="category-icon">{category.icon}</div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <div className="category-actions">
                  <button
                    onClick={() => handleDeleteCategory(category._id, category.name)}
                    className="delete-btn category-delete-btn"
                    title="Delete Category"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderOrders() {
    return (
      <div className="orders-content">
        <div className="section-header">
          <h1>Order Management</h1>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6)}</td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{order.customerName}</div>
                      {order.deliveryAddress?.phone && (
                        <div className="customer-phone">📞 {order.deliveryAddress.phone}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="products-info">
                      {order.items && order.items.length > 0 ? (
                        <div className="products-list">
                          {order.items.map((item, index) => (
                            <div key={index} className="product-item">
                              {item.product?.name || 'Unknown Product'}
                              {item.quantity > 1 && <span className="quantity"> (×{item.quantity})</span>}
                            </div>
                          ))}
                        </div>
                      ) : order.products && order.products.length > 0 ? (
                        <div className="products-list">
                          {order.products.map((product, index) => (
                            <div key={index} className="product-item">
                              {product?.name || 'Unknown Product'}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="no-products">No products</span>
                      )}
                    </div>
                  </td>
                  <td>₹{order.totalAmount}</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className="date-info">
                      <div className="order-date">
                        {order.formattedDate || new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN')}
                      </div>
                      <div className="order-time">
                        {order.formattedTime || new Date(order.orderDate || order.createdAt).toLocaleTimeString('en-IN')}
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Admin Management Functions
  async function handleAddAdmin(e) {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(adminForm)
      });

      if (response.ok) {
        showNotification('Administrator added successfully!', 'success');
        setAdminForm({ name: '', email: '', password: '', phone: '', role: 'admin' });
        fetchAdminList();
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to add administrator', 'error');
      }
    } catch (error) {
      showNotification('Error adding administrator: ' + error.message, 'error');
    }
  }

  async function fetchAdminList() {
    try {
      const response = await fetch('http://localhost:3001/api/admin/admin-list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAdminList(data);
      }
    } catch (error) {
      console.error('Error fetching admin list:', error);
    }
  }

  async function fetchReviews() {
    setReviewsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/reviews/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        showNotification('Failed to fetch reviews', 'error');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showNotification('Error fetching reviews', 'error');
    } finally {
      setReviewsLoading(false);
    }
  }

  async function handleDeleteAdmin(adminId) {
    if (window.confirm('Are you sure you want to delete this administrator?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/admin/delete-admin/${adminId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          showNotification('Administrator deleted successfully!', 'success');
          fetchAdminList();
        } else {
          showNotification('Failed to delete administrator', 'error');
        }
      } catch (error) {
        showNotification('Error deleting administrator: ' + error.message, 'error');
      }
    }
  }

  async function handleToggleAdminStatus(adminId) {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/toggle-admin-status/${adminId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        showNotification('Administrator status updated!', 'success');
        fetchAdminList();
      } else {
        showNotification('Failed to update administrator status', 'error');
      }
    } catch (error) {
      showNotification('Error updating administrator status: ' + error.message, 'error');
    }
  }

  // Sales Report Functions
  async function handleGenerateReport() {
    try {
      const params = new URLSearchParams({
        period: salesReport.selectedPeriod,
        year: salesReport.selectedYear,
        ...(salesReport.selectedPeriod === 'monthly' && { month: salesReport.selectedMonth })
      });

      const response = await fetch(`http://localhost:3001/api/admin/sales-report?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSalesReport({ ...salesReport, ...data });
        showNotification('Sales report generated successfully!', 'success');
      } else {
        showNotification('Failed to generate sales report', 'error');
      }
    } catch (error) {
      showNotification('Error generating sales report: ' + error.message, 'error');
    }
  }

  async function handleDownloadReport(format) {
    try {
      const params = new URLSearchParams({
        period: salesReport.selectedPeriod,
        year: salesReport.selectedYear,
        format: format,
        ...(salesReport.selectedPeriod === 'monthly' && { month: salesReport.selectedMonth })
      });

      const response = await fetch(`http://localhost:3001/api/admin/download-report?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${salesReport.selectedPeriod}-${salesReport.selectedYear}${salesReport.selectedPeriod === 'monthly' ? '-' + salesReport.selectedMonth : ''}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showNotification(`${format.toUpperCase()} report downloaded successfully!`, 'success');
      } else {
        showNotification('Failed to download report', 'error');
      }
    } catch (error) {
      showNotification('Error downloading report: ' + error.message, 'error');
    }
  }

  async function fetchStockRequests() {
    try {
      const response = await fetch('http://localhost:3001/api/admin-stock/stock-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStockRequests(data);
      }
    } catch (error) {
      console.error('Error fetching stock requests:', error);
    }
  }

  // Reuse fetchStockRequests for the dashboard alerts (keep the one at top)

  async function fetchDealers() {
    try {
      const response = await fetch('http://localhost:3001/api/admin-stock/dealers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDealers(data);
      }
    } catch (error) {
      console.error('Error fetching dealers:', error);
    }
  }

  async function handleApproveRequest() {
    const { request, dealerId, quantity } = approvalModal;
    if (!dealerId) {
      showNotification('Please select a dealer', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/admin-stock/approve-request/${request._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ dealerId, quantity: Number(quantity) })
      });

      if (response.ok) {
        showNotification('Stock request approved!', 'success');
        setApprovalModal({ show: false, request: null, quantity: '', dealerId: '' });
        fetchStockRequests(); // Refresh the list
      } else {
        const err = await response.json();
        showNotification(err.error || 'Failed to approve', 'error');
      }
    } catch (error) {
      showNotification('Error approving request', 'error');
    }
  }

  async function handleConfirmReceipt(requestId) {
    if (!window.confirm('Confirm that the stock has arrived? This will increase inventory and record COD Payment.')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/admin-stock/confirm-receipt/${requestId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        showNotification('Stock received and inventory updated!', 'success');
        fetchStockRequests();
      } else {
        const err = await response.json();
        showNotification(err.error || 'Failed to confirm receipt', 'error');
      }
    } catch (error) {
      showNotification('Error confirming receipt', 'error');
    }
  }

  async function handlePayDealer(orderId) {
    if (!window.confirm("Confirm payment via Cash on Delivery?")) return;
    const txnId = `COD-${Date.now()}`;

    try {
      const response = await fetch(`http://localhost:3001/api/admin-stock/pay-dealer/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ transactionId: txnId })
      });

      if (response.ok) {
        showNotification('Payment recorded successfully!', 'success');
        fetchStockRequests();
      } else {
        const err = await response.json();
        showNotification(err.error || 'Failed to record payment', 'error');
      }
    } catch (error) {
      showNotification('Error recording payment', 'error');
    }
  }

  async function handleRejectRequest() {
    const { request, reason } = rejectModal;
    try {
      const response = await fetch(`http://localhost:3001/api/admin-stock/reject-request/${request._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        showNotification('Stock request rejected!', 'success');
        setRejectModal({ show: false, request: null, reason: '' });
        fetchStockRequests();
      } else {
        showNotification('Failed to reject', 'error');
      }
    } catch (error) {
      showNotification('Error rejecting request', 'error');
    }
  }

  async function handleAddDealer(e) {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/admin-stock/dealers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(dealerForm)
      });

      if (response.ok) {
        showNotification('Dealer created successfully!', 'success');
        setDealerForm({ name: '', email: '', password: '', phone: '', address: { street: '', city: '', state: '', pincode: '' }, suppliedCategory: '' });
        fetchDealers();
      } else {
        const err = await response.json();
        showNotification(err.error || 'Failed to create dealer', 'error');
      }
    } catch (error) {
      showNotification('Error creating dealer', 'error');
    }
  }

  async function handleDeleteDealer(id) {
    if (!window.confirm('Are you sure you want to delete this dealer?')) return;
    try {
      const response = await fetch(`http://localhost:3001/api/admin-stock/dealers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        showNotification('Dealer deleted', 'success');
        fetchDealers();
      } else {
        showNotification('Failed to delete dealer', 'error');
      }
    } catch (error) {
      showNotification('Error deleting dealer', 'error');
    }
  }

  async function handleToggleDealerStatus(id) {
    try {
      const response = await fetch(`http://localhost:3001/api/admin-stock/dealers/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        showNotification('Dealer status updated', 'success');
        fetchDealers();
      }
    } catch (error) {
      showNotification('Error updating status', 'error');
    }
  }

  function renderDealerManagement() {
    return (
      <div className="content-section">
        <div className="section-header">
          <h2>🚚 Dealer Management</h2>
          <button onClick={fetchDealers} className="refresh-btn">🔄 Refresh</button>
        </div>

        <div className="admin-management-container">
          {/* Add Dealer Form */}
          <div className="add-admin-form">
            <h3>Register New Dealer</h3>
            <form onSubmit={handleAddDealer} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" value={dealerForm.name} onChange={e => setDealerForm({ ...dealerForm, name: e.target.value })} required placeholder="Dealer Name" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={dealerForm.email} onChange={e => setDealerForm({ ...dealerForm, email: e.target.value })} required placeholder="Email Address" />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input type="password" value={dealerForm.password} onChange={e => setDealerForm({ ...dealerForm, password: e.target.value })} required placeholder="Password" />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input type="tel" value={dealerForm.phone} onChange={e => setDealerForm({ ...dealerForm, phone: e.target.value })} required placeholder="Phone Number" />
                </div>
                <div className="form-group">
                  <label>Supplied Category *</label>
                  <select
                    value={dealerForm.suppliedCategory}
                    onChange={e => setDealerForm({ ...dealerForm, suppliedCategory: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Select Category</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Herbicides">Herbicides</option>
                    <option value="Insecticides">Insecticides</option>
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Fungicides">Fungicides</option>
                    <option value="Tools">Tools</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Organic Products">Organic Products</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Address Info</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input type="text" placeholder="Street" value={dealerForm.address.street} onChange={e => setDealerForm({ ...dealerForm, address: { ...dealerForm.address, street: e.target.value } })} />
                    <input type="text" placeholder="City" value={dealerForm.address.city} onChange={e => setDealerForm({ ...dealerForm, address: { ...dealerForm.address, city: e.target.value } })} />
                    <input type="text" placeholder="State" value={dealerForm.address.state} onChange={e => setDealerForm({ ...dealerForm, address: { ...dealerForm.address, state: e.target.value } })} />
                    <input type="text" placeholder="Pincode" value={dealerForm.address.pincode} onChange={e => setDealerForm({ ...dealerForm, address: { ...dealerForm.address, pincode: e.target.value } })} />
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '15px' }}>➕ Register Dealer</button>
            </form>
          </div>

          {/* List Dealers */}
          <div className="admin-list" style={{ marginTop: '30px' }}>
            <h3>Registered Dealers</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Category</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dealers.map(dealer => (
                    <tr key={dealer._id}>
                      <td>{dealer.name}</td>
                      <td>{dealer.email}</td>
                      <td>{dealer.suppliedCategory || 'N/A'}</td>
                      <td>{dealer.phone}</td>
                      <td>
                        <span className={`status-badge ${dealer.status}`}>{dealer.status}</span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleDealerStatus(dealer._id)}
                          style={{ background: dealer.status === 'active' ? '#f59e0b' : '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer' }}
                        >
                          {dealer.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteDealer(dealer._id)}
                          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {dealers.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No dealers found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderStockRequests() {
    const requestsToShow = requestsFilter === 'pending'
      ? stockRequests.filter(r => r.status === 'PENDING_ADMIN_APPROVAL')
      : stockRequests;

    return (
      <div className="content-section">
        <div className="section-header">
          <h2>📦 Stock Requests & Inventory</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="filter-buttons" style={{ display: 'flex', background: '#f8fafc', padding: '5px', borderRadius: '8px', gap: '5px' }}>
              <button
                onClick={() => setRequestsFilter('pending')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: requestsFilter === 'pending' ? '#ef4444' : 'transparent',
                  color: requestsFilter === 'pending' ? 'white' : '#64748b',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🚨 Pending Action ({stockRequests.filter(r => r.status === 'PENDING_ADMIN_APPROVAL').length})
              </button>
              <button
                onClick={() => setRequestsFilter('all')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: requestsFilter === 'all' ? '#3b82f6' : 'transparent',
                  color: requestsFilter === 'all' ? 'white' : '#64748b',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                📜 All Requests
              </button>
            </div>
            <button onClick={fetchStockRequests} className="refresh-btn">🔄 Refresh</button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Request Type</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Requested Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requestsToShow.map(req => (
                <tr key={req._id}>
                  <td>
                    <div className="product-info-cell">
                      {req.product?.image && <img src={getImageUrl(req.product.image)} alt={req.product.name} className="product-thumb" />}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '500' }}>{req.product?.name || 'Unknown Product'}</span>
                        <span style={{ fontSize: '12px', color: '#666' }}>Current Stock: {req.currentStock}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {req.dealer ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '16px' }}>🏪</span>
                        <div>
                          <div style={{ fontWeight: '500', fontSize: '13px' }}>Dealer Request</div>
                          <div style={{ color: '#666', fontSize: '11px' }}>{req.dealer.name}</div>
                        </div>
                      </div>
                    ) : req.dealerOrder?.dealer ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '16px' }}>✅</span>
                        <div>
                          <div style={{ fontWeight: '500', fontSize: '13px' }}>Assigned to</div>
                          <div style={{ color: '#666', fontSize: '11px' }}>{req.dealerOrder.dealer.name}</div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '16px' }}>🚨</span>
                        <span style={{ fontSize: '13px' }}>Low Stock Alert</span>
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 'bold' }}>{req.requestedQuantity}</td>
                  <td>
                    <span className={`status-badge ${req.status.toLowerCase().replace(/_/g, '-')}`}>
                      {req.status === 'PENDING_ADMIN_APPROVAL' ? 'PENDING' : req.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td>
                    {req.status === 'PENDING_ADMIN_APPROVAL' && (
                      <div className="action-buttons">
                        <button
                          className="approve-btn"
                          style={{ marginRight: '8px', background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => setApprovalModal({ show: true, request: req, quantity: req.requestedQuantity, dealerId: req.dealer?._id || req.product?.dealer || '' })}
                        >
                          <span>✓</span> Approve
                        </button>
                        <button
                          className="reject-btn"
                          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => setRejectModal({ show: true, request: req, reason: '' })}
                        >
                          <span>✕</span> Reject
                        </button>
                      </div>
                    )}
                    {req.status === 'APPROVED' && (
                      <div className="order-status-info">
                        {req.dealerOrder ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '500' }}>
                              → Order Sent to {req.dealerOrder.dealer?.name || 'Dealer'}
                            </span>
                            <span style={{ fontSize: '11px', color: '#666' }}>
                              Status: {req.dealerOrder.status}
                            </span>
                            {req.dealerOrder.status !== 'COMPLETED' && (
                              <button
                                onClick={() => handleConfirmReceipt(req._id)}
                                style={{ marginTop: '5px', background: '#ffffff', color: '#3b82f6', border: '1px solid #3b82f6', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                              >
                                📦 Confirm Receipt
                              </button>
                            )}
                            {req.dealerOrder.status === 'COMPLETED' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '12px' }}>✅ Inventory Updated</span>
                                <button
                                  onClick={() => setSelectedInvoiceOrder(req.dealerOrder)}
                                  style={{
                                    background: 'white',
                                    color: '#3b82f6',
                                    border: '1px solid #3b82f6',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    marginTop: '4px'
                                  }}
                                >
                                  📄 View Bill
                                </button>
                                {req.dealerOrder.paymentStatus === 'PAID' ? (
                                  <span style={{
                                    background: '#dcfce7',
                                    color: '#166534',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    textAlign: 'center',
                                    border: '1px solid #bbf7d0',
                                    marginTop: '4px'
                                  }}>
                                    💰 Paid (COD)
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handlePayDealer(req.dealerOrder._id)}
                                    style={{
                                      background: '#3b82f6',
                                      color: 'white',
                                      border: 'none',
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '11px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px',
                                      marginTop: '4px'
                                    }}
                                  >
                                    💸 Pay Dealer
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#666', fontSize: '12px', userSelect: 'all' }}>
                            Approved (Order Pending/Missing) <br /> ID: {req._id.slice(-6)}
                          </span>
                        )}
                      </div>
                    )}
                    {req.status === 'REJECTED' && (
                      <span style={{ color: '#ef4444', fontSize: '12px' }}>Reason: {req.adminNote || 'No reason'}</span>
                    )}
                  </td>
                </tr>
              ))}
              {requestsToShow.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px', filter: 'grayscale(1)' }}>📦</div>
                    <div style={{ color: '#666' }}>No {requestsFilter} stock requests found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Approval Modal */}
        {approvalModal.show && (
          <div
            className="admin-modal-overlay"
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9999
            }}
            onClick={() => setApprovalModal({ ...approvalModal, show: false })}
          >
            <div
              className="admin-modal-card"
              onClick={e => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '16px',
                width: '500px',
                maxWidth: '90%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                animation: 'modalFadeIn 0.2s ease-out'
              }}
            >
              <div className="admin-modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>📦</span> Approve Stock Request
                </h3>
                <button
                  onClick={() => setApprovalModal({ ...approvalModal, show: false })}
                  style={{ border: 'none', background: 'transparent', fontSize: '24px', color: '#94a3b8', cursor: 'pointer', lineHeight: 1 }}
                >
                  &times;
                </button>
              </div>

              <div className="admin-modal-body" style={{ padding: '24px' }}>

                {/* Product Summary Card */}
                {approvalModal.request?.product && (
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    {approvalModal.request.product.image ? (
                      <img
                        src={getImageUrl(approvalModal.request.product.image)}
                        alt={approvalModal.request.product.name}
                        style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📦</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#334155', fontSize: '16px' }}>{approvalModal.request.product.name}</div>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Current Stock: <strong style={{ color: '#0f172a' }}>{approvalModal.request.currentStock}</strong></div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Requested: <strong style={{ color: '#0f172a' }}>{approvalModal.request.requestedQuantity}</strong></div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500', fontSize: '14px' }}>Assign Dealer</label>
                  <select
                    style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'white', cursor: 'pointer' }}
                    value={approvalModal.dealerId}
                    onChange={e => setApprovalModal({ ...approvalModal, dealerId: e.target.value })}
                  >
                    <option value="">-- Select Dealer --</option>
                    {dealers.map(d => (
                      <option key={d._id} value={d._id}>{d.name} ({d.email})</option>
                    ))}
                  </select>
                  {approvalModal.request?.dealer && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', padding: '8px 12px', background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                      <span style={{ fontSize: '14px' }}>🏪</span>
                      <small style={{ color: '#059669', fontSize: '13px', fontWeight: '500' }}>
                        Requested by: {approvalModal.request.dealer.name}
                      </small>
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500', fontSize: '14px' }}>Order Quantity</label>
                  <input
                    type="number"
                    style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                    value={approvalModal.quantity}
                    onChange={e => setApprovalModal({ ...approvalModal, quantity: e.target.value })}
                    placeholder="Enter quantity"
                  />
                  <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Leave empty to use requested quantity
                  </small>
                </div>
              </div>

              <div className="admin-modal-footer" style={{ padding: '20px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setApprovalModal({ ...approvalModal, show: false })}
                  style={{
                    padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px',
                    color: '#475569', fontWeight: '500', cursor: 'pointer', fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveRequest}
                  style={{
                    padding: '10px 20px', background: '#10b981', border: 'none', borderRadius: '8px',
                    color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '14px',
                    boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  Confirm & Send Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {rejectModal.show && (
          <div
            className="admin-modal-overlay"
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9999
            }}
            onClick={() => setRejectModal({ ...rejectModal, show: false })}
          >
            <div
              className="admin-modal-card"
              onClick={e => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '16px',
                width: '450px',
                maxWidth: '90%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                animation: 'modalFadeIn 0.2s ease-out'
              }}
            >
              <div className="admin-modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fee2e2' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#991b1b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🚫</span> Reject Stock Request
                </h3>
                <button
                  onClick={() => setRejectModal({ ...rejectModal, show: false })}
                  style={{ border: 'none', background: 'transparent', fontSize: '24px', color: '#ef4444', cursor: 'pointer', lineHeight: 1 }}
                >
                  &times;
                </button>
              </div>

              <div className="admin-modal-body" style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
                  Are you sure you want to reject this request for <strong>{rejectModal.request?.product?.name}</strong>?
                </div>
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500', fontSize: '14px' }}>Reason (Optional)</label>
                  <textarea
                    style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', minHeight: '100px', resize: 'vertical' }}
                    value={rejectModal.reason}
                    onChange={e => setRejectModal({ ...rejectModal, reason: e.target.value })}
                    placeholder="Enter reason for rejection..."
                  />
                </div>
              </div>

              <div className="admin-modal-footer" style={{ padding: '20px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setRejectModal({ ...rejectModal, show: false })}
                  style={{
                    padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px',
                    color: '#475569', fontWeight: '500', cursor: 'pointer', fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectRequest}
                  style={{
                    padding: '10px 20px', background: '#ef4444', border: 'none', borderRadius: '8px',
                    color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '14px',
                    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)'
                  }}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  async function handleDownloadMonthlyReport() {
    try {
      const params = new URLSearchParams({
        period: 'monthly',
        year: salesReport.selectedYear,
        format: 'pdf'
      });

      const response = await fetch(`http://localhost:3001/api/admin/download-report?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monthly-sales-report-${salesReport.selectedYear}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showNotification('Monthly report downloaded successfully!', 'success');
      } else {
        showNotification('Failed to download monthly report', 'error');
      }
    } catch (error) {
      showNotification('Error downloading monthly report: ' + error.message, 'error');
    }
  }

  async function handleDownloadYearlyReport() {
    try {
      const params = new URLSearchParams({
        period: 'yearly',
        year: salesReport.selectedYear,
        format: 'pdf'
      });

      const response = await fetch(`http://localhost:3001/api/admin/download-report?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `yearly-sales-report-${salesReport.selectedYear}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showNotification('Yearly report downloaded successfully!', 'success');
      } else {
        showNotification('Failed to download yearly report', 'error');
      }
    } catch (error) {
      showNotification('Error downloading yearly report: ' + error.message, 'error');
    }
  }

  // Product-wise report download
  async function handleDownloadProductReport(format) {
    try {
      setProductSalesFilter(prev => ({ ...prev, loading: true }));

      const params = new URLSearchParams({
        startDate: productSalesFilter.startDate,
        endDate: productSalesFilter.endDate,
        format: format
      });

      if (productSalesFilter.selectedProduct !== 'all') {
        params.append('productId', productSalesFilter.selectedProduct);
      }

      const response = await fetch(`http://localhost:3001/api/admin/download-product-report?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const productName = productSalesFilter.selectedProduct === 'all'
          ? 'all-products'
          : products.find(p => p._id === productSalesFilter.selectedProduct)?.name.replace(/\s+/g, '-').toLowerCase() || 'product';
        a.download = `${productName}-sales-${productSalesFilter.startDate}-to-${productSalesFilter.endDate}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showNotification(`${format.toUpperCase()} report downloaded successfully!`, 'success');
      } else {
        showNotification('Failed to download report', 'error');
      }

      setProductSalesFilter(prev => ({ ...prev, loading: false }));
    } catch (error) {
      showNotification('Error downloading report: ' + error.message, 'error');
      setProductSalesFilter(prev => ({ ...prev, loading: false }));
    }
  }

  function renderAdminManagement() {
    return (
      <div className="content-section">
        <div className="section-header">
          <h2>👥 Admin Management</h2>
          <p>Manage administrator accounts and permissions</p>
        </div>

        <div className="admin-management-container">
          {/* Add New Admin Form */}
          <div className="add-admin-form">
            <h3>Add New Administrator</h3>
            <form onSubmit={handleAddAdmin} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    required
                    placeholder="Enter admin name"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    required
                    placeholder="Enter email address"
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    required
                    placeholder="Enter password"
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={adminForm.phone}
                    onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary">
                ➕ Add Administrator
              </button>
            </form>
          </div>

          {/* Current Admins List */}
          <div className="admin-list">
            <h3>Current Administrators</h3>
            <div className="admin-grid">
              {/* Default Admin Card */}
              <div className="admin-card default-admin">
                <div className="admin-info">
                  <div className="admin-avatar">👑</div>
                  <div className="admin-details">
                    <h4>Default Administrator</h4>
                    <p>wrkkavi@gmail.com</p>
                    <span className="admin-role">Super Admin</span>
                  </div>
                </div>
                <div className="admin-status">
                  <span className="status-badge active">Active</span>
                </div>
              </div>

              {/* Dynamic Admin Cards */}
              {adminList.map(admin => (
                <div key={admin._id} className="admin-card">
                  <div className="admin-info">
                    <div className="admin-avatar">👤</div>
                    <div className="admin-details">
                      <h4>{admin.name}</h4>
                      <p>{admin.email}</p>
                      <span className="admin-role">{admin.role}</span>
                    </div>
                  </div>
                  <div className="admin-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => handleToggleAdminStatus(admin._id)}
                    >
                      {admin.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteAdmin(admin._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderReviews() {
    const filteredReviews = selectedProductFilter === 'all'
      ? reviews
      : reviews.filter(review => review.productId._id === selectedProductFilter);

    // Group reviews by product
    const reviewsByProduct = {};
    filteredReviews.forEach(review => {
      const productId = review.productId._id;
      if (!reviewsByProduct[productId]) {
        reviewsByProduct[productId] = {
          product: review.productId,
          reviews: []
        };
      }
      reviewsByProduct[productId].reviews.push(review);
    });

    return (
      <div className="content-section">
        <div className="section-header">
          <h2>⭐ Product Reviews</h2>
          <p>Manage customer reviews and ratings</p>
        </div>

        {/* Filter and Refresh */}
        <div className="reviews-filter">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <label>Filter by Product:</label>
            <select
              value={selectedProductFilter}
              onChange={(e) => setSelectedProductFilter(e.target.value)}
            >
              <option value="all">All Products</option>
              {products.filter(p => p).map(product => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchReviews}
            className="btn-primary"
            style={{
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {reviewsLoading ? (
          <div className="loading-spinner">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="empty-state">
            <p>No reviews yet</p>
          </div>
        ) : (
          <div className="reviews-container">
            {Object.values(reviewsByProduct).map(({ product, reviews }) => (
              <div key={product._id} className="product-reviews-section">
                <div className="product-header">
                  <img
                    src={
                      getImageUrl(product.image) || '/placeholder-product.png'
                    }
                    alt={product.name}
                    className="product-thumbnail"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNSAyNUg1NVY1NUgyNVYyNVoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
                    }}
                  />
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <div className="rating-summary">
                      <span className="stars">{'⭐'.repeat(Math.round(product.averageRating || 0))}</span>
                      <span className="rating-text">
                        {product.averageRating ? product.averageRating.toFixed(1) : '0.0'}
                        ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="reviews-list">
                  {reviews.map(review => (
                    <div key={review._id} className="review-card">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <strong>{review.userId?.name || 'Anonymous'}</strong>
                          {review.verifiedPurchase && (
                            <span className="verified-badge" title="Verified Purchase">
                              ✓ Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="review-rating">
                          {'⭐'.repeat(review.rating)}
                        </div>
                      </div>
                      <div className="review-date">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="review-comment">
                        {review.comment}
                      </div>
                      <div className="review-actions">
                        <button
                          className="btn-danger-small"
                          onClick={() => handleDeleteReview(review._id, product._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  async function handleDeleteReview(reviewId, productId) {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/reviews/${reviewId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          showNotification('Review deleted successfully!', 'success');
          fetchReviews();
          // Refresh products to update rating stats
          fetchDashboardData();
        } else {
          showNotification('Failed to delete review', 'error');
        }
      } catch (error) {
        showNotification('Error deleting review: ' + error.message, 'error');
      }
    }
  }

  function renderSalesReport() {
    // Calculate monthly revenue from orders
    const monthlyRevenue = Array.from({ length: 12 }, (_, index) => {
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate || order.createdAt);
        return orderDate.getMonth() === index && orderDate.getFullYear() === salesReport.selectedYear;
      });

      const revenue = monthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const orderCount = monthOrders.length;

      return {
        month: new Date(2024, index).toLocaleString('default', { month: 'short' }).toUpperCase(),
        revenue,
        orderCount
      };
    });

    const totalRevenue = monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0);
    const totalOrders = monthlyRevenue.reduce((sum, month) => sum + month.orderCount, 0);
    const bestMonth = monthlyRevenue.reduce((max, month) => month.revenue > max.revenue ? month : max, monthlyRevenue[0]);
    const peakRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));
    const averageMonthly = totalRevenue / 12;

    return (
      <div className="content-section">
        <div className="section-header">
          <h2>📈 Sales Report</h2>
          <p>Download and analyze sales performance reports</p>
        </div>

        <div className="sales-report-container">
          {/* Download Buttons */}
          <div className="report-download-header">
            <button
              className="download-btn monthly"
              onClick={() => handleDownloadMonthlyReport()}
            >
              � Download Monthly Report
            </button>
            <button
              className="download-btn yearly"
              onClick={() => handleDownloadYearlyReport()}
            >
              � Download Yearly Report
            </button>
          </div>

          {/* Monthly Revenue Breakdown */}
          <div className="revenue-breakdown-section">
            <h3>📊 Monthly Revenue Breakdown</h3>
            <div className="revenue-grid">
              {monthlyRevenue.map((month, index) => (
                <div
                  key={month.month}
                  className={`revenue-month-card ${month.revenue > 0 ? 'has-revenue' : ''} ${index === 7 || index === 8 ? 'highlighted' : ''}`}
                >
                  <div className="month-name">{month.month}</div>
                  <div className="month-revenue">₹{month.revenue.toLocaleString('en-IN')}</div>
                  <div className="month-orders">
                    {month.orderCount} {month.orderCount === 1 ? 'order' : 'orders'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="chart-section">
            <div className="chart-header">
              <h3>📈 Revenue Trend Analysis</h3>
              <div className="chart-controls">
                <button className="chart-btn active">Monthly View</button>
                <button className="chart-btn">Quarterly</button>
              </div>
            </div>
            <div className="professional-chart-container">
              <div className="chart-info-panel">
                <div className="info-item">
                  <span className="info-label">Peak Month</span>
                  <span className="info-value">{bestMonth.month}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Growth Rate</span>
                  <span className="info-value positive">+12.5%</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Trend</span>
                  <span className="info-value trending">↗️ Positive</span>
                </div>
              </div>

              <div className="advanced-chart-wrapper">
                <div className="chart-grid-background">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="grid-line" style={{ bottom: `${i * 25}%` }}>
                      <span className="grid-label">₹{Math.round((peakRevenue * i) / 4).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div className="chart-data-area">
                  <svg className="trend-line" viewBox="0 0 400 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.3 }} />
                        <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.05 }} />
                      </linearGradient>
                    </defs>
                    <path
                      d={monthlyRevenue && monthlyRevenue.length > 0
                        ? `M 0 200 ${monthlyRevenue.map((month, index) => {
                          const x = (index / Math.max(11, monthlyRevenue.length - 1)) * 400;
                          const y = 200 - (peakRevenue > 0 ? ((month?.revenue || 0) / peakRevenue) * 180 : 0);
                          return `L ${Math.round(x)} ${Math.round(y)}`;
                        }).join(' ')} L 400 200 Z`
                        : 'M 0 200 L 400 200 Z'
                      }
                      fill="url(#areaGradient)"
                    />
                    <path
                      d={monthlyRevenue && monthlyRevenue.length > 0
                        ? monthlyRevenue.map((month, index) => {
                          const x = (index / Math.max(11, monthlyRevenue.length - 1)) * 400;
                          const y = 200 - (peakRevenue > 0 ? ((month?.revenue || 0) / peakRevenue) * 180 : 0);
                          return `${index === 0 ? 'M' : 'L'} ${Math.round(x)} ${Math.round(y)}`;
                        }).join(' ')
                        : 'M 0 200 L 400 200'
                      }
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {monthlyRevenue.map((month, index) => {
                      const x = (index / 11) * 400;
                      const y = 200 - (peakRevenue > 0 ? (month.revenue / peakRevenue) * 180 : 0);
                      return (
                        <circle
                          key={index}
                          cx={x}
                          cy={y}
                          r={month.revenue > 0 ? "6" : "3"}
                          fill={month.revenue > 0 ? "#3b82f6" : "#e5e7eb"}
                          stroke="white"
                          strokeWidth="2"
                          className="data-point"
                        />
                      );
                    })}
                  </svg>
                </div>

                <div className="chart-bars-modern">
                  {monthlyRevenue.map((month, index) => {
                    const height = peakRevenue > 0 ? (month.revenue / peakRevenue) * 100 : 0;
                    const isActive = month.revenue > 0;
                    return (
                      <div key={month.month} className="modern-bar-container">
                        <div className="bar-tooltip" data-tooltip={`${month.month} 2025\n₹${month.revenue.toLocaleString('en-IN')}\n${month.orderCount} orders`}>
                          <div
                            className={`modern-chart-bar ${isActive ? 'active' : 'inactive'} ${index === 7 || index === 8 ? 'highlighted' : ''}`}
                            style={{ height: `${Math.max(height, 2)}%` }}
                          >
                            <div className="bar-glow"></div>
                            <div className="bar-cap"></div>
                          </div>
                        </div>
                        <div className="modern-x-label">{month.month}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color active"></div>
                  <span>Revenue Generated</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color inactive"></div>
                  <span>No Revenue</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color highlighted"></div>
                  <span>Peak Months</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Statistics */}
          <div className="quick-stats-section">
            <h3>⚡ Quick Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card best-month">
                <div className="stat-label">BEST MONTH</div>
                <div className="stat-value">{bestMonth.month}</div>
              </div>
              <div className="stat-card peak-revenue">
                <div className="stat-label">PEAK REVENUE</div>
                <div className="stat-value">₹{peakRevenue.toLocaleString('en-IN')}</div>
              </div>
              <div className="stat-card average-monthly">
                <div className="stat-label">AVERAGE MONTHLY</div>
                <div className="stat-value">₹{Math.round(averageMonthly).toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          {/* Product-wise Sales Report Section */}
          <div className="product-report-section" style={{ marginTop: '40px', padding: '30px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', color: 'white' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>📦 Product-wise Sales Report</h3>
            <p style={{ marginBottom: '25px', opacity: 0.9 }}>Download detailed sales report for individual products within a custom date range</p>

            <div style={{ background: 'rgba(255,255,255,0.95)', padding: '25px', borderRadius: '12px', color: '#1f2937' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                    Select Product
                  </label>
                  <select
                    value={productSalesFilter.selectedProduct}
                    onChange={(e) => setProductSalesFilter(prev => ({ ...prev, selectedProduct: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Products</option>
                    {products.filter(p => p).map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={productSalesFilter.startDate}
                    onChange={(e) => setProductSalesFilter(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={productSalesFilter.endDate}
                    onChange={(e) => setProductSalesFilter(prev => ({ ...prev, endDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleDownloadProductReport('pdf')}
                  disabled={productSalesFilter.loading}
                  style={{
                    padding: '12px 28px',
                    background: productSalesFilter.loading ? '#9ca3af' : '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: productSalesFilter.loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {productSalesFilter.loading ? '⏳' : '📄'} Download PDF
                </button>

                <button
                  onClick={() => handleDownloadProductReport('excel')}
                  disabled={productSalesFilter.loading}
                  style={{
                    padding: '12px 28px',
                    background: productSalesFilter.loading ? '#9ca3af' : '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: productSalesFilter.loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {productSalesFilter.loading ? '⏳' : '📊'} Download Excel
                </button>
              </div>

              <div style={{ marginTop: '15px', padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
                <p style={{ fontSize: '13px', color: '#166534', margin: 0 }}>
                  💡 <strong>Tip:</strong> Select "All Products" to download a comprehensive report, or choose a specific product for detailed analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="professional-admin">
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>🌾 Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <button
            className={currentView === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentView('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={currentView === 'products' ? 'active' : ''}
            onClick={() => {
              setCurrentView('products');
              setShowLowStockOnly(false);
            }}
          >
            📦 Products
          </button>
          <button
            className={currentView === 'categories' ? 'active' : ''}
            onClick={() => setCurrentView('categories')}
          >
            🏷️ Categories
          </button>
          <button
            className={currentView === 'orders' ? 'active' : ''}
            onClick={() => setCurrentView('orders')}
          >
            📋 Orders
          </button>
          <button
            className={currentView === 'reviews' ? 'active' : ''}
            onClick={() => setCurrentView('reviews')}
          >
            ⭐ Reviews
          </button>
          <button
            className={currentView === 'admin-management' ? 'active' : ''}
            onClick={() => setCurrentView('admin-management')}
          >
            👥 Admin Management
          </button>
          <button
            className={currentView === 'sales-report' ? 'active' : ''}
            onClick={() => setCurrentView('sales-report')}
          >
            📈 Sales Report
          </button>
          <button
            className={currentView === 'stock-requests' ? 'active' : ''}
            onClick={() => setCurrentView('stock-requests')}
          >
            📋 Stock Requests
          </button>
          <button
            className={currentView === 'dealers' ? 'active' : ''}
            onClick={() => setCurrentView('dealers')}
          >
            🚚 Dealers
          </button>
          <button onClick={onLogout} className="logout-btn">
            🚪 Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'products' && renderProducts()}
        {currentView === 'categories' && renderCategories()}
        {currentView === 'orders' && renderOrders()}
        {currentView === 'reviews' && renderReviews()}
        {currentView === 'admin-management' && renderAdminManagement()}
        {currentView === 'sales-report' && renderSalesReport()}
        {currentView === 'stock-requests' && renderStockRequests()}
        {currentView === 'dealers' && renderDealerManagement()}
      </div>

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Product</h3>
              <button
                className="close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateProduct} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Herbicides">Herbicides</option>
                    <option value="Insecticides">Insecticides</option>
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Fungicides">Fungicides</option>
                    <option value="Tools">Tools</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Organic Products">Organic Products</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Current Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Base Price per Unit (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.basePrice}
                    onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              {(() => {
                const config = CATEGORY_CONFIG[productForm.category] || CATEGORY_CONFIG['default'];
                return (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Stock Quantity *</label>
                        <input
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Low Stock Alert Level</label>
                        <input
                          type="number"
                          value={productForm.lowStockThreshold}
                          onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>{config.unitLabel}</label>
                        <input
                          type="text"
                          value={productForm.unit}
                          onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                          placeholder={config.unitPlaceholder}
                        />
                      </div>
                      <div className="form-group">
                        <label>Brand</label>
                        <input
                          type="text"
                          value={productForm.brand}
                          onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                          placeholder="Brand name"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>{config.weightLabel}</label>
                      <input
                        type="text"
                        value={productForm.weight}
                        onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                        placeholder={config.weightPlaceholder}
                      />
                    </div>
                  </>
                );
              })()}

              <div className="form-group">
                <label>Features (comma-separated)</label>
                <input
                  type="text"
                  value={productForm.features}
                  onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                  placeholder="Feature 1, Feature 2, Feature 3"
                />
              </div>

              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={productForm.tags}
                  onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div className="form-group">
                <label>Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.files[0] })}
                />
                {editingProduct?.image && (
                  <div className="current-image">
                    <small>Current image: {editingProduct.image}</small>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Request Approval Modal */}
      {approvalModal.show && (
        <div className="modal-overlay" onClick={() => setApprovalModal({ show: false, request: null, quantity: '', dealerId: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Approve Stock Request</h2>
              <button className="close-btn" onClick={() => setApprovalModal({ show: false, request: null, quantity: '', dealerId: '' })}>×</button>
            </div>
            <div className="modal-body">
              <div className="approval-product-info">
                <h3>{approvalModal.request?.product?.name}</h3>
                <p>Current Stock: <strong>{approvalModal.request?.currentStock}</strong></p>
                <p>Requested Quantity: <strong>{approvalModal.request?.requestedQuantity}</strong></p>
              </div>
              <div className="form-group">
                <label>Select Dealer *</label>
                <select
                  value={approvalModal.dealerId}
                  onChange={(e) => setApprovalModal({ ...approvalModal, dealerId: e.target.value })}
                  required
                >
                  <option value="">-- Select Dealer --</option>
                  {dealers.filter(d => d.status === 'active').map(dealer => (
                    <option key={dealer._id} value={dealer._id}>
                      {dealer.name} ({dealer.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Order Quantity</label>
                <input
                  type="number"
                  value={approvalModal.quantity}
                  onChange={(e) => setApprovalModal({ ...approvalModal, quantity: e.target.value })}
                  placeholder={approvalModal.request?.requestedQuantity}
                  min="1"
                />
                <small>Leave empty to use requested quantity</small>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setApprovalModal({ show: false, request: null, quantity: '', dealerId: '' })}
              >
                Cancel
              </button>
              <button
                className="approve-btn"
                onClick={() => handleApproveStockRequest(approvalModal.request)}
              >
                Approve & Send Order
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Dealer Invoice Modal */}
      {selectedInvoiceOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.9)', zIndex: 10000, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
          <div style={{ margin: '40px 20px', width: '100%', maxWidth: '850px', position: 'relative' }}>
            <button
              onClick={() => setSelectedInvoiceOrder(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '-50px',
                background: 'white',
                color: '#ef4444',
                border: 'none',
                padding: '10px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              ✕
            </button>
            <DealerInvoice order={selectedInvoiceOrder} dealer={selectedInvoiceOrder.dealer} />
          </div>
        </div>
      )}

      {/* Customer Invoice Modal */}
      {selectedCustomerOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.9)', zIndex: 10000, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
          <div style={{ margin: '40px 20px', width: '100%', maxWidth: '850px', position: 'relative' }}>
            <button
              onClick={() => setSelectedCustomerOrder(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '-50px',
                background: 'white',
                color: '#ef4444',
                border: 'none',
                padding: '10px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              ✕
            </button>
            <CustomerInvoice order={selectedCustomerOrder} />
          </div>
        </div>
      )}
    </div>
  );
}
