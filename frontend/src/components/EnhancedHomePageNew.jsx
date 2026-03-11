import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import EnhancedCart from './EnhancedCart.jsx';
import MyOrders from './MyOrders.jsx';
import ProductDetails from './ProductDetails.jsx';
import ChatBot from './ChatBot.jsx';
import CropCalendarModal from './CropCalendarModal.jsx';
import '../css/ProfessionalEcommerce.css';
import '../css/Overlays.css';
import '../css/MobileResponsive.css';
import '../css/CustomerFeatures.css';
import ProfessionalToast from './ProfessionalToast.jsx';
import { getApiUrl, getImageUrl } from '../config/api';

export default function EnhancedHomePage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [availableBrands, setAvailableBrands] = useState([]);
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
  const [showCropCalendar, setShowCropCalendar] = useState(false);
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
    if (localStorage.getItem('customerToken')) {
      fetchCartCounts();
    }
  }, []);

  useEffect(() => {
    fetchBrands();
    setSelectedBrand('all'); // Reset brand filter when category changes
  }, [selectedCategory]);

  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [topRatedProducts, setTopRatedProducts] = useState([]);

  useEffect(() => {
    fetchTopSelling();
    fetchTopRated();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, selectedBrand, sortBy, searchTerm]);

  async function fetchTopSelling() {
    try {
      const response = await fetch(getApiUrl('/api/products?sort=popularity&limit=4'));
      const data = await response.json();
      if (data.products) {
        setTopSellingProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching top selling products:', error);
    }
  }

  async function fetchTopRated() {
    try {
      const response = await fetch(getApiUrl('/api/products?sort=rating&limit=4'));
      const data = await response.json();
      if (data.products) {
        setTopRatedProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching top rated products:', error);
    }
  }

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

      // Handle both success and error responses
      if (data.error) {
        console.error('API returned error:', data);
        setProducts([]);
        return;
      }

      // Ensure we always set an array
      const productsArray = Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []);
      setProducts(productsArray);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
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

  async function fetchBrands() {
    try {
      let endpoint = '/api/products/filters/options';
      if (selectedCategory !== 'all') {
        endpoint += `?category=${encodeURIComponent(selectedCategory)}`;
      }
      const response = await fetch(getApiUrl(endpoint));
      if (response.ok) {
        const data = await response.json();
        setAvailableBrands(data.brands || []);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  }

  function filterAndSortProducts() {
    // Safety check: ensure products is an array
    if (!Array.isArray(products)) {
      console.error('Products is not an array:', products);
      setFilteredProducts([]);
      return;
    }

    let filtered = products;
    console.log('Filtering products:', {
      totalProducts: products.length,
      selectedCategory,
      selectedBrand,
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

    // Filter by Brand
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(product => product.brand === selectedBrand);
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
      <header className="fresh-flow-header">
        <div className="header-top">
          <div className="header-container">
            {/* Logo */}
            <Link to="/" className="fresh-logo">
              <svg className="leaf-icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 5C20 5 8 10 8 22C8 28 12 32 18 34C18 34 15 28 18 24C21 20 20 15 20 15C20 15 19 20 22 24C25 28 22 34 22 34C28 32 32 28 32 22C32 10 20 5 20 5Z" fill="currentColor" />
              </svg>
              <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '1.5rem' }}>Greenixx</span>
            </Link>

            {/* Search Bar */}
            <div className="header-search">
              <input
                type="text"
                placeholder="Search for fertilizers, seeds, pesticides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button className="search-button">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* User Actions */}
            <div className="header-actions">
              <button
                onClick={() => setShowCart(true)}
                className="icon-action cart-action"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 2L7.17 4H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-4.17L15 2H9zm-6 6v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8H3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Cart</span>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>

              {isLoggedIn && (
                <button
                  onClick={() => setShowMyOrders(true)}
                  className="icon-action orders-action"
                  title="My Orders"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 17h6M9 13h6M9 9h6M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Orders</span>
                </button>
              )}

              <div className="user-profile">
                {isLoggedIn ? (
                  <div className="profile-menu">
                    <button className="profile-button">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="profile-info">
                        <span className="profile-name">{user?.name || 'User'}</span>
                      </div>
                    </button>
                    <div className="profile-dropdown">
                      <button onClick={() => setShowMyOrders(true)} className="dropdown-item">
                        📦 My Orders
                      </button>
                      <button
                        onClick={() => {
                          localStorage.removeItem('customerToken');
                          setIsLoggedIn(false);
                          setCartCount(0);
                          setUser(null);
                        }}
                        className="dropdown-item logout"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link to="/login" className="login-link">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <span className="hamburger-icon">{isMobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="header-container">
            <nav className="main-nav">
              <Link to="/about" className="nav-item" style={{ textDecoration: 'none' }}>
                About Us
              </Link>
              <button
                className={selectedCategory === 'all' ? 'nav-item active' : 'nav-item'}
                onClick={() => setSelectedCategory('all')}
              >
                All Products
              </button>
              <button
                className={selectedCategory === 'fertilizers' ? 'nav-item active' : 'nav-item'}
                onClick={() => setSelectedCategory('fertilizers')}
              >
                Fertilizers
              </button>
              <button
                className={selectedCategory === 'seeds' ? 'nav-item active' : 'nav-item'}
                onClick={() => setSelectedCategory('seeds')}
              >
                Seeds
              </button>
              <button
                className={selectedCategory === 'pesticides' ? 'nav-item active' : 'nav-item'}
                onClick={() => setSelectedCategory('pesticides')}
              >
                Pesticides
              </button>
              <button
                className={selectedCategory === 'tools' ? 'nav-item active' : 'nav-item'}
                onClick={() => setSelectedCategory('tools')}
              >
                Tools & Equipment
              </button>
              <button
                className={selectedCategory === 'organic' ? 'nav-item active' : 'nav-item'}
                onClick={() => setSelectedCategory('organic')}
              >
                Organic Products
              </button>
              <button className="nav-item" onClick={() => setShowCropCalendar(true)}>
                Smart Crop Calendar
              </button>

            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Empowering Farmers <span className="hero-title-highlight">Digitally</span>
            </h1>
            <p className="hero-description">
              A unified digital ecosystem providing real-time weather analytics, market insights, and personalized crop guidance for sustainable agriculture.
            </p>
            <div className="hero-actions">
              <button className="shop-now-btn" onClick={() => {
                const productsSection = document.querySelector('.products-section');
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}>
                EXPLORE PRODUCTS
              </button>
              <button className="secondary-btn" onClick={() => setShowCropCalendar(true)}>
                SMART CROP CALENDAR
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-badge" style={{ background: '#16a34a' }}>Why Choose Us</span>
          <h2>Empowering Your Agriculture</h2>
          <p>We provide the best tools and resources for modern farming</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <div className="feature-title">Fast Delivery</div>
            <div className="feature-desc">Get your farming supplies delivered directly to your farm within 24-48 hours.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <div className="feature-title">Quality Assurance</div>
            <div className="feature-desc">100% certified organic seeds and fertilizers tested for maximum yield.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <div className="feature-title">Expert Support</div>
            <div className="feature-desc">24/7 access to agricultural experts for advice on crops and equipment.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <div className="feature-title">Best Prices</div>
            <div className="feature-desc">Direct-from-manufacturer pricing to ensure you get the best value.</div>
          </div>
        </div>
      </section>

      {/* Top Selling Products */}
      {topSellingProducts.length > 0 && (
        <section className="top-selling-section">
          <div className="section-header">
            <span className="section-badge">Trending Now</span>
            <h2>Top Selling Products</h2>
            <p>Most popular choices among farmers this week</p>
          </div>
          <div className="products-grid">
            {topSellingProducts.map(product => (
              <div key={product._id} className="product-card">
                <div
                  className="product-image-container"
                  onClick={() => handleProductClick(product._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={product.image?.startsWith('http') ? product.image : getImageUrl(product.image)}
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-badge">Hot 🔥</div>
                </div>
                <div className="product-info" onClick={() => handleProductClick(product._id)} style={{ cursor: 'pointer' }}>
                  <div className="product-category">{product.category}</div>
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price">₹{product.price}</div>
                  <div className="product-actions" style={{ marginTop: '10px' }}>
                    {product.stock > 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product._id);
                        }}
                        className="add-to-cart-btn"
                        style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <button
                        disabled
                        className="add-to-cart-btn"
                        style={{ padding: '8px 16px', fontSize: '0.9rem', background: '#e0e0e0', cursor: 'not-allowed', color: '#888' }}
                      >
                        Out of Stock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top Rated Products */}
      {topRatedProducts.length > 0 && (
        <section className="top-rated-section">
          <div className="section-header">
            <span className="section-badge" style={{ background: '#d97706' }}>Customer Favorites</span>
            <h2>Top Rated Products</h2>
            <p>Highly recommended by other farmers</p>
          </div>
          <div className="products-grid">
            {topRatedProducts.map(product => (
              <div key={product._id} className="product-card">
                <div
                  className="product-image-container"
                  onClick={() => handleProductClick(product._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={product.image?.startsWith('http') ? product.image : getImageUrl(product.image)}
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-badge" style={{ background: '#fef3c7', color: '#d97706' }}>Top Rated ⭐</div>
                </div>
                <div className="product-info" onClick={() => handleProductClick(product._id)} style={{ cursor: 'pointer' }}>
                  <div className="product-category">{product.category}</div>
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price">₹{product.price}</div>
                  <div className="product-actions" style={{ marginTop: '10px' }}>
                    {product.stock > 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product._id);
                        }}
                        className="add-to-cart-btn"
                        style={{ padding: '8px 16px', fontSize: '0.9rem', background: '#d97706' }}
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <button
                        disabled
                        className="add-to-cart-btn"
                        style={{ padding: '8px 16px', fontSize: '0.9rem', background: '#e0e0e0', cursor: 'not-allowed', color: '#888' }}
                      >
                        Out of Stock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Products Section */}
      <div id="products-section" className="products-section">
        <div className="section-title">
          <h2>Our Products</h2>
          <p>Premium quality agricultural products for your farming needs</p>

          {/* Filters Bar */}
          <div className="filters-bar" style={{
            marginTop: '20px',
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <div className="filter-item">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="filter-select"
                style={{
                  padding: '8px 12px',
                  borderRadius: '20px',
                  border: '1px solid #ddd',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Brands</option>
                {availableBrands.map((brand, idx) => (
                  <option key={idx} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
                style={{
                  padding: '8px 12px',
                  borderRadius: '20px',
                  border: '1px solid #ddd',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock">Stock Level</option>
              </select>
            </div>
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

      {/* Crop Calendar Modal */}
      {showCropCalendar && (
        <CropCalendarModal onClose={() => setShowCropCalendar(false)} />
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
