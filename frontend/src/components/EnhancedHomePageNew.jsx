import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import EnhancedCart from './EnhancedCart.jsx';
import MyOrders from './MyOrders.jsx';
import ProductDetails from './ProductDetails.jsx';
import ChatBot from './ChatBot.jsx';
import '../css/ProfessionalEcommerce.css';
import '../css/Overlays.css';
import ProfessionalToast from './ProfessionalToast.jsx';
import { getApiUrl, getImageUrl } from '../config/api';

export default function EnhancedHomePage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [toast, setToast] = useState({ visible: false, title: '', message: '', type: 'info' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Helper function to get product icon based on category
  function getProductIcon(category) {
    const icons = {
      'fertilizers': '🌱',
      'seeds': '🌾',
      'pesticides': '🦟',
      'tools': '🔧',
      'irrigation': '💧',
      'organic': '🍃'
    };
    return icons[category] || '📦';
  }

  useEffect(() => {
    checkAuthStatus();
    fetchProducts();
    if (isLoggedIn) {
      fetchCartCounts();
    }
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, sortBy, searchTerm]);

  function checkAuthStatus() {
    const token = localStorage.getItem('customerToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp > Date.now() / 1000) {
          setIsLoggedIn(true);
          // Set user information from token
          setUser({
            name: decodedToken.name || 'Customer',
            email: decodedToken.email || '',
            id: decodedToken.userId || decodedToken.id
          });
        } else {
          localStorage.removeItem('customerToken');
          setUser(null);
        }
      } catch (error) {
        localStorage.removeItem('customerToken');
        setUser(null);
      }
    }
  }

  async function fetchProducts() {
    try {
      const response = await fetch(getApiUrl('/api/products'));
      const data = await response.json();
      console.log('Fetched products:', data);
      setProducts(data.products || data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  async function fetchCartCounts() {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) return;

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      // Fetch cart count
      const cartRes = await fetch(getApiUrl(`/api/customer/cart/${userId}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        console.log('Cart data:', cartData);
        setCartCount(cartData.items?.length || 0);
        setCartItems(cartData.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart counts:', error);
    }
  }

  function filterAndSortProducts() {
    let filtered = products;
    console.log('Filtering products:', {
      totalProducts: products.length,
      selectedCategory,
      searchTerm,
      availableCategories: [...new Set(products.map(p => p.category))]
    });

    // Filter by category (case-insensitive)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => {
        const productCategory = product.category?.toLowerCase() || '';
        const selectedCat = selectedCategory.toLowerCase();
        const matches = productCategory === selectedCat || productCategory.includes(selectedCat);
        if (!matches) {
          console.log('Category mismatch:', { productCategory: product.category, selectedCategory });
        }
        return matches;
      });
      console.log('After category filter:', filtered.length);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('After search filter:', filtered.length);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'stock':
          return b.stock - a.stock;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }

  async function handleAddToCart(productId, quantity = 1) {
    if (!isLoggedIn) {
      setToast({ visible: true, title: 'Login required', message: 'Please login to add items to cart', type: 'error' });
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('customerToken');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      const response = await fetch(getApiUrl(`/api/customer/cart/${userId}/${productId}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: quantity })
      });

      if (response.ok) {
        setToast({ visible: true, title: 'Added to cart', message: 'Product added to cart successfully!', type: 'success' });
        fetchCartCounts();
      } else {
        const errorData = await response.json();
        if (errorData.error === 'User not found') {
          setToast({ visible: true, title: 'Session expired', message: 'Please login again.', type: 'error' });
          localStorage.removeItem('customerToken');
          setIsLoggedIn(false);
          navigate('/login');
        } else {
          setToast({ visible: true, title: 'Add to cart failed', message: `Failed to add product to cart: ${errorData.error || 'Unknown error'}`, type: 'error' });
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToast({ visible: true, title: 'Error', message: 'Error adding product to cart. Please try again.', type: 'error' });
    }
  }

  function handlePreorder(productId) {
    setToast({ visible: true, title: 'Pre-order', message: 'Pre-order functionality coming soon! This product will be available for pre-booking.', type: 'info' });
  }

  function handleProductClick(productId) {
    setSelectedProductId(productId);
  }

  async function removeFromCart(itemId) {
    try {
      const token = localStorage.getItem('customerToken');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      const response = await fetch(getApiUrl(`/api/customer/cart/${userId}/${itemId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        fetchCartCounts();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }

  return (
    <div className="enhanced-home">
      <ProfessionalToast visible={toast.visible} title={toast.title} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, visible: false })} />

      {/* Fresh Flow Header */}
      <header className="fresh-flow-header custom-agri-header">
        <div className="header-container">
          {/* Logo */}
          <Link to="/" className="fresh-logo" style={{ textDecoration: 'none' }}>
            <svg className="leaf-icon" width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ marginRight: '10px' }}>
              <path d="M20 5C20 5 8 10 8 22C8 28 12 32 18 34C18 34 15 28 18 24C21 20 20 15 20 15C20 15 19 20 22 24C25 28 22 34 22 34C28 32 32 28 32 22C32 10 20 5 20 5Z" fill="#ffeb3b" />
              <path d="M12 28C12 28 8 20 14 14C20 8 30 5 30 5C30 5 32 12 28 20C24 28 16 32 16 32" fill="#4caf50" opacity="0.8" />
            </svg>
            <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '1.6rem' }}>Greenixx</span>
          </Link>

          {/* Navigation Menu */}
          <nav className={`main-nav custom-agri-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <button className="nav-item active">Home</button>
            <button className="nav-item" onClick={() => {
              const el = document.querySelector('.products-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>Products</button>
            <button className="nav-item" onClick={() => setShowCropCalendar(true)}>Crop Advisory</button>
            <Link to="/rentals" className="nav-item" style={{ textDecoration: 'none' }}>Equipment Rentals</Link>
            <Link to="/admin" className="nav-item" style={{ textDecoration: 'none' }}>Admin</Link>
          </nav>

          {/* User Actions */}
          <div className="header-actions custom-agri-actions">
            <button onClick={() => setShowCart(true)} className="icon-action cart-action">
              <span className="icon-text" style={{ fontSize: '1.05rem', fontWeight: '500' }}>Cart</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            {isLoggedIn ? (
              <div className="profile-menu">
                <button className="profile-button">
                  <span className="profile-name" style={{ color: '#fff' }}>{user?.name || 'User'}</span>
                </button>
                <div className="profile-dropdown">
                  <button onClick={() => setShowMyOrders(true)} className="dropdown-item">📦 My Orders</button>
                  <button onClick={() => {
                    localStorage.removeItem('customerToken');
                    setIsLoggedIn(false);
                    setCartCount(0);
                    setUser(null);
                  }} className="dropdown-item logout">🚪 Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="login-link" style={{ fontSize: '1.05rem' }}>Login</Link>
            )}

            {/* Mobile Menu Toggle */}
            <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <span className="hamburger-icon">{isMobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section custom-agri-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content-centered">
          <h1 className="hero-main-title">
            Empowering Farmers <span className="text-light-green">Digitally</span>
          </h1>
          <p className="hero-description-centered">
            A unified digital ecosystem providing real-time weather analytics, market insights, and personalized crop guidance for sustainable agriculture.
          </p>
          <div className="hero-buttons-row">
            <button className="primary-action-btn" onClick={() => {
              const productsSection = document.querySelector('.products-section');
              if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}>
              EXPLORE SERVICES
            </button>
            <button className="secondary-action-btn">
              GET EXPERT ADVISORY
            </button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <div className="products-section">
        <div className="section-title" style={{ marginBottom: '1.5rem' }}>
          <h2>Our Products</h2>
          <p>Premium quality agricultural products for your farming needs</p>
        </div>

        {/* Premium Search and Filter Bar */}
        <div className="premium-filter-container">
          <div className="compact-search-bar">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="search-icon">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="compact-search-input"
            />
          </div>

          <div className="category-pills-row">
            {[
              { id: 'all', label: 'All Products', icon: '✨' },
              { id: 'fertilizers', label: 'Fertilizers', icon: '🌱' },
              { id: 'seeds', label: 'Seeds', icon: '🌾' },
              { id: 'pesticides', label: 'Pesticides', icon: '🦟' },
              { id: 'tools', label: 'Tools', icon: '🔧' },
              { id: 'organic', label: 'Organic', icon: '🍃' }
            ].map(cat => (
              <button
                key={cat.id}
                className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="pill-icon">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div key={product._id} className="product-card">
                <div
                  className="product-image-container"
                  onClick={() => handleProductClick(product._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={product.image?.startsWith('http')
                      ? product.image
                      : getImageUrl(product.image)
                    }
                    alt={product.name}
                    className="product-image"
                    onLoad={(e) => {
                      console.log('Image loaded successfully for:', product.name, 'URL:', e.target.src);
                    }}
                    onError={(e) => {
                      console.log('Image load error for:', product.name, 'URL:', e.target.src);
                      console.log('Product data:', product);
                      e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="%23f1f5f9" width="200" height="200"/><text fill="%236b7280" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="40">${getProductIcon(product.category)}</text></svg>`;
                    }}
                  />
                  <div className="product-badge">{product.category}</div>
                  <div className={`stock-indicator ${product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-of-stock'}`}>
                    {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
                  </div>
                </div>

                <div
                  className="product-info"
                  onClick={() => handleProductClick(product._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="product-category">{product.category}</div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description?.substring(0, 100)}...</p>
                  <div className="product-price">₹{product.price}</div>
                  <div className="view-details-hint">👁️ Click to view details</div>

                  <div className="product-actions">
                    {product.stock > 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product._id);
                        }}
                        className="add-to-cart-btn"
                      >
                        🛒 Add to Cart
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreorder(product._id);
                        }}
                        className="add-to-cart-btn preorder-btn"
                      >
                        📋 Pre-order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Cart Component */}
      <EnhancedCart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onCartUpdate={(count) => {
          console.log('Cart count updated to:', count);
          setCartCount(count);
        }}
      />

      {/* My Orders Component */}
      {showMyOrders && (
        <MyOrders
          token={localStorage.getItem('customerToken')}
          onClose={() => setShowMyOrders(false)}
        />
      )}

      {/* Product Details Modal */}
      {selectedProductId && (
        <ProductDetails
          productId={selectedProductId}
          token={localStorage.getItem('customerToken')}
          onClose={() => setSelectedProductId(null)}
          onAddToCart={(cartItem) => {
            // Handle the new cart item structure
            if (typeof cartItem === 'object' && cartItem.productId) {
              handleAddToCart(cartItem.productId, cartItem.quantity || 1);
            } else {
              // Fallback for legacy calls
              handleAddToCart(cartItem, 1);
            }
            setSelectedProductId(null);
          }}
        />
      )}

      {/* Professional Footer */}
      {/* Professional Footer */}
      <footer className="professional-footer">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <h3>
              🌱 Pavithra Traders
            </h3>
            <p>
              Leading supplier of high-quality agricultural products, seeds, fertilizers, and farming tools.
              Committed to supporting farmers with premium products for better yields.
            </p>
            <div className="footer-badges">
              <span className="footer-badge">
                🏆 Premium Quality
              </span>
              <span className="footer-badge">
                🚚 Fast Delivery
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              {['All Products', 'Seeds', 'Fertilizers', 'Herbicides', 'Tools', 'New Arrivals'].map(link => (
                <li key={link}>
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section footer-contact">
            <h4>Contact Information</h4>
            <div>
              <p>📍 Agricultural Market, Main Street</p>
              <p>📞 +91 98765 43210</p>
              <p>✉️ info@pavithratraders.com</p>
              <p>🕒 Mon-Sat: 9:00 AM - 7:00 PM</p>
            </div>

            {/* Social Links */}
            <div className="social-links">
              {['📘', '📷', '🐦', '📱'].map((icon, idx) => (
                <a key={idx} href="#" className="social-link">
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="copyright-text">
            © 2025 Pavithra Traders. All rights reserved.
          </p>
          <p className="footer-tagline">
            Empowering Agriculture • Growing Together • Quality Assured
          </p>
        </div>
      </footer>

      {/* ChatBot - Only on Customer Page */}
      <ChatBot />
    </div>
  );
}
