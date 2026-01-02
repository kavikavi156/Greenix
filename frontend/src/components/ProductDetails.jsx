import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReviewSection from './ReviewSection';
import '../css/EcommerceStyles.css';
import '../css/ProfessionalEcommerce.css';
import { getApiUrl, getImageUrl } from '../config/api';

export default function ProductDetails({ productId, token, onClose, onAddToCart }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [dynamicPrice, setDynamicPrice] = useState(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [showSpecifications, setShowSpecifications] = useState(true);
  const [showReviews, setShowReviews] = useState(true);
  const reviewSectionRef = useRef(null);
  const navigate = useNavigate();

  // Get user ID from token
  function getUserIdFromToken(token) {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch {
      return null;
    }
  }

  const userId = getUserIdFromToken(token);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
      if (userId) {
        checkWishlistStatus();
      }
    }
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Add keyboard event listener for ESC key
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [productId, userId, onClose]);

  // Fetch related products when product category is known
  useEffect(() => {
    if (product?.category) {
      fetchRelatedProducts();
    }
  }, [product?.category, productId]);

  // Set default package when product loads
  useEffect(() => {
    if (product) {
      console.log('Product data loaded:', product);
      console.log('Package sizes:', product.packageSizes);
      
      if (product.packageSizes && product.packageSizes.length > 0 && !selectedPackage) {
        // Select the first package size as default
        setSelectedPackage(product.packageSizes[0]);
        console.log('Selected first package:', product.packageSizes[0]);
      } else if (!product.packageSizes && !selectedPackage) {
        // Create a default package for products without packageSizes
        const defaultPackage = {
          size: 1,
          unit: product.baseUnit || product.unit || 'unit',
          price: product.price,
          stock: product.stock || 0,
          priceMultiplier: 1
        };
        setSelectedPackage(defaultPackage);
        console.log('Created default package:', defaultPackage);
      }
    }
  }, [product]);

  useEffect(() => {
    if (product && quantity > 0 && selectedPackage) {
      calculateDynamicPrice();
    }
  }, [product, quantity, selectedPackage]);

  async function calculateDynamicPrice() {
    if (!product || !selectedPackage || quantity <= 0) return;
    
    setIsCalculatingPrice(true);
    try {
      // Calculate price based on selected package
      const packagePrice = selectedPackage.price;
      const totalPrice = packagePrice * quantity;
      
      // Calculate savings if applicable
      let savings = 0;
      if (product.originalPrice && selectedPackage.size) {
        const originalTotalPrice = (product.originalPrice * selectedPackage.size) * quantity;
        savings = originalTotalPrice - totalPrice;
      }

      setDynamicPrice({
        pricePerUnit: packagePrice,
        totalPrice: totalPrice,
        savings: Math.max(0, savings),
        packageSize: selectedPackage.size,
        packageUnit: selectedPackage.unit
      });
    } catch (error) {
      console.error('Error calculating price:', error);
      // Fallback calculation
      const fallbackPrice = selectedPackage?.price || product.basePrice || product.price;
      setDynamicPrice({
        pricePerUnit: fallbackPrice,
        totalPrice: fallbackPrice * quantity,
        savings: 0,
        packageSize: selectedPackage?.size || 1,
        packageUnit: selectedPackage?.unit || product.baseUnit || 'unit'
      });
    } finally {
      setIsCalculatingPrice(false);
    }
  }

  async function fetchRelatedProducts() {
    if (!product) return;
    
    setLoadingRelated(true);
    try {
      // Fetch products from the same category
      const response = await fetch(getApiUrl('/api/products'));
      if (response.ok) {
        const allProducts = await response.json();
        
        // Filter products: same category but exclude current product
        const related = allProducts
          .filter(p => 
            p._id !== productId && 
            p.category === product.category &&
            p.stock > 0 // Only show products in stock
          )
          .slice(0, 6); // Limit to 6 related products
        
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setLoadingRelated(false);
    }
  }

  async function fetchProductDetails() {
    setLoading(true);
    try {
      console.log('Fetching product details for ID:', productId);
      const response = await fetch(getApiUrl(`/api/products/${productId}`));
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Product data received:', data);
        setProduct(data);
        // Don't create fake image variants, just use the actual image
        setError('');
      } else {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch product details: ${response.status} ${errorText}`);
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError(`Failed to load product details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function checkWishlistStatus() {
    try {
      const response = await fetch(getApiUrl(`/api/customer/wishlist/${userId}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setIsInWishlist(data.wishlist?.some(item => item._id === productId) || false);
      }
    } catch (err) {
      console.error('Error checking wishlist status:', err);
      setIsInWishlist(false);
    }
  }

  async function toggleWishlist() {
    if (!userId) {
      alert('Please login to add to wishlist');
      return;
    }

    try {
      const endpoint = isInWishlist ? 'remove-from-wishlist' : 'add-to-wishlist';
      const response = await fetch(getApiUrl(`/api/customer/${endpoint}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, productId })
      });

      if (response.ok) {
        setIsInWishlist(!isInWishlist);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      alert('Failed to update wishlist');
    }
  }

  function handleAddToCart() {
    if (onAddToCart) {
      if (selectedPackage) {
        const cartItem = {
          productId: productId,
          quantity: quantity,
          packageSize: selectedPackage.size,
          packageUnit: selectedPackage.unit,
          packagePrice: selectedPackage.price,
          totalPrice: selectedPackage.price * quantity
        };
        onAddToCart(cartItem);
      } else {
        // Fallback for products without selectedPackage
        const cartItem = {
          productId: productId,
          quantity: quantity,
          packageSize: 1,
          packageUnit: product.unit || 'unit',
          packagePrice: product.price,
          totalPrice: product.price * quantity
        };
        onAddToCart(cartItem);
      }
    }
  }

  async function handleBuyNow() {
    if (!token) {
      // Store the buy now action for after login
      const packageInfo = selectedPackage || {
        size: 1,
        unit: product.unit || 'unit',
        price: product.price
      };
      localStorage.setItem('pendingBuyNow', JSON.stringify({
        productId: productId,
        quantity: quantity,
        packageSize: packageInfo.size,
        packageUnit: packageInfo.unit,
        redirectTo: 'checkout'
      }));
      alert('Please login to purchase products');
      // Close the modal and let the user login
      onClose();
      return;
    }

    setIsBuyingNow(true);

    try {
      // Create a cart item for immediate checkout
      const packageInfo = selectedPackage || {
        size: 1,
        unit: product.unit || 'unit',
        price: product.price
      };
      
      const cartItem = {
        _id: `temp-${productId}`,
        product: product,
        quantity: quantity,
        packageSize: packageInfo.size,
        packageUnit: packageInfo.unit,
        packagePrice: packageInfo.price,
        price: packageInfo.price,
        totalPrice: packageInfo.price * quantity
      };

      const totalAmount = cartItem.totalPrice;

      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to checkout with the single item
      navigate('/checkout', {
        state: {
          cartItems: [cartItem],
          totalAmount: totalAmount,
          token: token,
          isBuyNow: true // Flag to indicate this is a buy now action
        }
      });
    } catch (error) {
      console.error('Error processing buy now:', error);
      alert('Error processing your request. Please try again.');
    } finally {
      setIsBuyingNow(false);
    }
  }

  function renderStars(rating) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }

    return stars;
  }

  function getStockStatus(stock) {
    if (stock === 0) return { status: 'out-of-stock', text: 'Out of Stock' };
    if (stock <= 5) return { status: 'low-stock', text: `Only ${stock} left` };
    return { status: 'in-stock', text: 'In Stock' };
  }

  if (loading) {
    return (
      <div className="product-details-overlay">
        <div className="product-details-modal">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-details-overlay">
        <div className="product-details-modal">
          <div className="error-container">
            <h3>Error</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const currentStock = selectedPackage ? selectedPackage.stock : product.stock || 0;
  const stockStatus = getStockStatus(currentStock);
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);

  return (
    <div className="product-details-overlay" style={{ 
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      overflowY: 'auto'
    }}>
      <div className="product-details-modal" style={{
        background: '#ffffff',
        borderRadius: '8px',
        maxWidth: '1100px',
        width: '95%',
        maxHeight: '90vh',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        margin: '20px auto'
      }}>
        {/* Professional Header */}
        <div style={{
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#565959', flexWrap: 'wrap' }}>
            <span onClick={onClose} style={{ cursor: 'pointer', color: '#007185' }}>Products</span>
            <span>›</span>
            <span>{product.category}</span>
            <span>›</span>
            <span style={{ color: '#0F1111' }}>{product.name}</span>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent',
            border: 'none',
            fontSize: '28px',
            color: '#565959',
            cursor: 'pointer',
            padding: '0',
            lineHeight: '1'
          }}>×</button>
        </div>
        
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Section - Sticky Image */}
          <div style={{ 
            width: '48%',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            borderRight: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            {/* Main Image Container - Centered */}
            <div style={{ 
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '24px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '500px',
              maxHeight: '600px',
              position: 'relative'
            }}>
              <img 
                src={(() => {
                  if (product.images && product.images.length > 0) {
                    const selectedImage = product.images[selectedImageIndex] || product.image;
                    return selectedImage?.startsWith('http') 
                      ? selectedImage 
                      : getImageUrl(selectedImage);
                  }
                  return product.image?.startsWith('http') 
                    ? product.image 
                    : getImageUrl(product.image);
                })()}
                alt={product.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="%23f8f8f8" width="400" height="400"/><text fill="%23999" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="50">📦</text></svg>`;
                }}
              />
              {product.discount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: '#CC0C39',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: '700',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}>
                  {product.discount}% OFF
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                padding: '4px 0',
                justifyContent: 'center'
              }}>
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image?.startsWith('http') ? image : getImageUrl(image)}
                    alt={`View ${index + 1}`}
                    onClick={() => setSelectedImageIndex(index)}
                    style={{
                      width: '75px',
                      height: '75px',
                      objectFit: 'contain',
                      border: index === selectedImageIndex ? '2px solid #007185' : '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      flexShrink: 0,
                      background: '#fff',
                      padding: '6px',
                      transition: 'all 0.2s'
                    }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ))}
              </div>
            )}
            
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={toggleWishlist} style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #d5d9d9',
                borderRadius: '8px',
                background: isInWishlist ? '#FFE6E6' : '#fff',
                color: isInWishlist ? '#C7511F' : '#0F1111',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                {isInWishlist ? '❤️ Wishlisted' : '🤍 Wishlist'}
              </button>
              <button onClick={() => navigator.share && navigator.share({ title: product.name, url: window.location.href })} style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #d5d9d9',
                borderRadius: '8px',
                background: '#fff',
                color: '#0F1111',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                📤 Share
              </button>
            </div>
          </div>

          {/* Right Section - Scrollable Product Details */}
          <div style={{ 
            width: '52%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Scrollable Content */}
            <div style={{ 
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '20px 24px 80px 24px'
            }}>
            {/* Product Title & Brand */}
            {product.brand && (
              <div style={{ marginBottom: '4px' }}>
                <a href="#" style={{ color: '#007185', fontSize: '12px', textDecoration: 'none' }}>
                  Visit the {product.brand} Store
                </a>
              </div>
            )}
            
            <h1 style={{
              fontSize: '20px',
              fontWeight: '500',
              lineHeight: '1.3',
              color: '#0F1111',
              marginBottom: '8px'
            }}>
              {product.name}
            </h1>
            
            {/* Rating & Reviews */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {product.rating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {renderStars(product.rating)}
                  </div>
                  <span style={{ color: '#007185', fontSize: '13px', cursor: 'pointer' }}>
                    {product.rating} out of 5
                  </span>
                </div>
              )}
              {(product.reviews || 0) > 0 && (
                <>
                  <span style={{ color: '#d5d9d9' }}>|</span>
                  <span style={{ color: '#007185', fontSize: '13px', cursor: 'pointer' }}>
                    {product.reviews} ratings
                  </span>
                </>
              )}
              {product.sold > 0 && (
                <>
                  <span style={{ color: '#d5d9d9' }}>|</span>
                  <span style={{ color: '#565959', fontSize: '13px' }}>
                    {product.sold}+ bought
                  </span>
                </>
              )}
            </div>
            
            {/* Badges */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {stockStatus.status === 'in-stock' && (
                <span style={{
                  background: '#F0F2F2',
                  color: '#0F1111',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  ✓ In Stock
                </span>
              )}
              {product.discount > 0 && (
                <span style={{
                  background: '#CC0C39',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Limited time deal
                </span>
              )}
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid #e7e7e7', margin: '10px 0' }} />

            {/* Pricing Amazon Style */}
            <div style={{ marginBottom: '10px' }}>
              {isCalculatingPrice ? (
                <span style={{ fontSize: '14px', color: '#565959' }}>Calculating...</span>
              ) : (
                <div>
                  {product.originalPrice && product.originalPrice > (selectedPackage?.price || product.price) && (
                    <div style={{ marginBottom: '3px' }}>
                      <span style={{ fontSize: '12px', color: '#565959' }}>List Price: </span>
                      <span style={{
                        fontSize: '12px',
                        color: '#565959',
                        textDecoration: 'line-through'
                      }}>₹{product.originalPrice}</span>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', color: '#0F1111' }}>Price:</span>
                    <span style={{
                      fontSize: '18px',
                      color: '#B12704',
                      fontWeight: '600'
                    }}>₹{dynamicPrice?.pricePerUnit || selectedPackage?.price || product.price}</span>
                    {selectedPackage && (
                      <span style={{ fontSize: '12px', color: '#565959' }}>
                        ({selectedPackage.size} {selectedPackage.unit})
                      </span>
                    )}
                  </div>
                  
                  {product.originalPrice && product.originalPrice > (selectedPackage?.price || product.price) && (
                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ color: '#CC0C39', fontSize: '12px', fontWeight: '400' }}>
                        Save ₹{(product.originalPrice - (selectedPackage?.price || product.price)).toFixed(2)} ({product.discount}%)
                      </span>
                    </div>
                  )}
                  
                  {quantity > 1 && dynamicPrice && (
                    <div style={{ fontSize: '13px', color: '#565959', marginBottom: '3px' }}>
                      Total: ₹{dynamicPrice.totalPrice} for {quantity} {quantity > 1 ? 'units' : 'unit'}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Delivery Info - Amazon Prime Style */}
            {stockStatus.status === 'in-stock' && (
              <div style={{
                background: '#F7F7F7',
                border: '1px solid #D5D9D9',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>🚚</span>
                  <div>
                    <div style={{ fontWeight: '700', color: '#0F1111', fontSize: '14px' }}>
                      FREE Delivery {deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '12px', color: '#565959' }}>
                      Order within 4 hrs for delivery by tomorrow
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#007185', cursor: 'pointer' }}>
                  Select delivery location
                </div>
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="features-section">
                <h3>Key Features</h3>
                <div className="features-list">
                  {product.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span className="feature-bullet">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Package Selection - Amazon Style */}
            {product.packageSizes && product.packageSizes.length > 0 ? (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F1111', marginBottom: '8px' }}>
                  Size: <span style={{ fontWeight: '400' }}>{selectedPackage?.size} {selectedPackage?.unit}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {product.packageSizes.map((pkg, index) => (
                    <div 
                      key={index}
                      onClick={() => pkg.stock > 0 && setSelectedPackage(pkg)}
                      style={{
                        border: selectedPackage === pkg ? '2px solid #007185' : '1px solid #D5D9D9',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        cursor: pkg.stock > 0 ? 'pointer' : 'not-allowed',
                        opacity: pkg.stock > 0 ? 1 : 0.5,
                        background: selectedPackage === pkg ? '#F0F8FF' : '#fff',
                        transition: 'all 0.2s',
                        minWidth: '120px'
                      }}
                    >
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#0F1111', marginBottom: '4px' }}>
                        {pkg.size} {pkg.unit}
                      </div>
                      <div style={{ fontSize: '16px', color: '#B12704', fontWeight: '700' }}>
                        ₹{pkg.price}
                      </div>
                      <div style={{ fontSize: '11px', color: pkg.stock > 0 ? '#007600' : '#B12704', marginTop: '4px' }}>
                        {pkg.stock > 0 ? `${pkg.stock} in stock` : 'Out of stock'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Quantity Selector - Amazon Style */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F1111', marginBottom: '8px' }}>
                Quantity:
              </div>
              <div style={{
                display: 'inline-flex',
                border: '1px solid #D5D9D9',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#F0F2F2'
              }}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: 'none',
                    background: '#F0F2F2',
                    cursor: quantity > 1 ? 'pointer' : 'not-allowed',
                    fontSize: '18px',
                    color: '#0F1111',
                    fontWeight: '400'
                  }}
                >
                  -
                </button>
                <div style={{
                  width: '50px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fff',
                  borderLeft: '1px solid #D5D9D9',
                  borderRight: '1px solid #D5D9D9',
                  fontSize: '16px',
                  fontWeight: '400',
                  color: '#0F1111'
                }}>
                  {quantity}
                </div>
                <button 
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: 'none',
                    background: '#F0F2F2',
                    cursor: quantity < currentStock ? 'pointer' : 'not-allowed',
                    fontSize: '18px',
                    color: '#0F1111',
                    fontWeight: '400'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Security & Trust Badges */}
            <div style={{
              border: '1px solid #D5D9D9',
              borderRadius: '8px',
              padding: '12px',
              background: '#F7FAFA',
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '12px', color: '#565959', lineHeight: '16px' }}>
                <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>✓</span>
                  <span>Secure transaction</span>
                </div>
                <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>✓</span>
                  <span>7-day return policy</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>✓</span>
                  <span>Authentic products guaranteed</span>
                </div>
              </div>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid #e7e7e7', margin: '12px 0' }} />

            {/* Product Description */}
            <div className="description-section">
              <h3>Product Description</h3>
              <div className={`description-content ${showFullDescription ? 'expanded' : ''}`}>
                <p>
                  {product.description || `Experience the premium quality of ${product.name} from ${product.brand || 'our trusted brand'}. This product offers exceptional value with its superior features and reliable performance. Perfect for daily use with long-lasting durability.`}
                </p>
                {!showFullDescription && (
                  <div className="description-fade"></div>
                )}
              </div>
              <button 
                className="read-more-btn"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? 'Read Less' : 'Read More'}
              </button>
            </div>

            {/* Specifications */}
            <div className="specifications-section">
              <h3 onClick={() => setShowSpecifications(!showSpecifications)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Product Specifications</span>
                <span style={{ fontSize: '18px' }}>{showSpecifications ? '−' : '+'}</span>
              </h3>
              {showSpecifications && (
                <>
                  <div className="spec-table">
                    <div className="spec-row">
                      <span className="spec-label">Brand</span>
                      <span className="spec-value">{product.brand || 'Generic'}</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">Category</span>
                      <span className="spec-value">{product.category || 'General'}</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">Stock Available</span>
                      <span className="spec-value">{product.stock} units</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">Weight</span>
                      <span className="spec-value">{product.weight || 'As per product'}</span>
                    </div>
                  </div>
                  
                  {/* Agricultural Product Details */}
                  {(product.chemicalComposition || product.packaging || product.application) && (
                <>
                  <h3 style={{ marginTop: '2rem' }}>Agricultural Product Details</h3>
                  
                  {/* Chemical Composition */}
                  {product.chemicalComposition && (
                    <div className="agri-section">
                      <h4>Chemical Composition</h4>
                      <div className="spec-table">
                        {product.chemicalComposition.nitrogen && (
                          <div className="spec-row">
                            <span className="spec-label">Nitrogen (N)</span>
                            <span className="spec-value">{product.chemicalComposition.nitrogen}%</span>
                          </div>
                        )}
                        {product.chemicalComposition.phosphorus && (
                          <div className="spec-row">
                            <span className="spec-label">Phosphorus (P)</span>
                            <span className="spec-value">{product.chemicalComposition.phosphorus}%</span>
                          </div>
                        )}
                        {product.chemicalComposition.potassium && (
                          <div className="spec-row">
                            <span className="spec-label">Potassium (K)</span>
                            <span className="spec-value">{product.chemicalComposition.potassium}%</span>
                          </div>
                        )}
                        {product.chemicalComposition.activeIngredients?.map((ingredient, index) => (
                          <div key={index} className="spec-row">
                            <span className="spec-label">{ingredient.name}</span>
                            <span className="spec-value">{ingredient.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Packaging Information */}
                  {product.packaging && (
                    <div className="agri-section">
                      <h4>Packaging Options</h4>
                      <div className="packaging-options">
                        {product.packaging.sizes?.map((size, index) => (
                          <div key={index} className="packaging-item">
                            <span className="packaging-size">{size.quantity} {size.unit}</span>
                            <span className="packaging-price">₹{size.price}</span>
                          </div>
                        ))}
                      </div>
                      <div className="spec-table">
                        <div className="spec-row">
                          <span className="spec-label">Form</span>
                          <span className="spec-value">{product.packaging.form}</span>
                        </div>
                        <div className="spec-row">
                          <span className="spec-label">Storage</span>
                          <span className="spec-value">{product.packaging.storage}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Application Information */}
                  {product.application && (
                    <div className="agri-section">
                      <h4>Application Guidelines</h4>
                      <div className="spec-table">
                        {product.application.crops?.length > 0 && (
                          <div className="spec-row">
                            <span className="spec-label">Suitable Crops</span>
                            <span className="spec-value">{product.application.crops.join(', ')}</span>
                          </div>
                        )}
                        {product.application.dosage && (
                          <div className="spec-row">
                            <span className="spec-label">Dosage</span>
                            <span className="spec-value">{product.application.dosage.amount} {product.application.dosage.unit} per {product.application.dosage.area}</span>
                          </div>
                        )}
                        {product.application.instructions && (
                          <div className="spec-row full-width">
                            <span className="spec-label">Instructions</span>
                            <div className="spec-value">
                              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                                {product.application.instructions.map((instruction, index) => (
                                  <li key={index}>{instruction}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
                </>
              )}
            </div>

            {/* Reviews Section - Read Only */}
            <div ref={reviewSectionRef} style={{ marginTop: '20px' }}>
              <div onClick={() => setShowReviews(!showReviews)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Customer Reviews</h3>
                <span style={{ fontSize: '18px' }}>{showReviews ? '−' : '+'}</span>
              </div>
              {showReviews && (
                <>
                  <ReviewSection 
                    productId={productId} 
                    key={refreshReviews}
                  />
                  
                  {!token && (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '16px', 
                      background: '#f7f7f7', 
                      borderRadius: '6px',
                      marginTop: '12px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <p style={{ color: '#565959', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>
                        💡 Want to review this product?
                      </p>
                      <p style={{ color: '#565959', marginBottom: '12px', fontSize: '12px' }}>
                        Purchase this product and write your review from your Orders page
                      </p>
                      <button 
                        onClick={() => navigate('/login')}
                        style={{
                          background: '#FFA41C',
                          color: '#0F1111',
                          padding: '8px 20px',
                          border: '1px solid #FF8F00',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Login to Purchase
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            </div>

            {/* Sticky Action Buttons at Bottom */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: '#fff',
              borderTop: '1px solid #e5e7eb',
              padding: '12px 24px',
              display: 'flex',
              gap: '10px',
              boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
            }}>
              <button 
                onClick={handleAddToCart}
                disabled={stockStatus.status === 'out-of-stock'}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: stockStatus.status === 'out-of-stock' ? '#D5D9D9' : '#FFD814',
                  border: '1px solid #FCD200',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#0F1111',
                  cursor: stockStatus.status === 'out-of-stock' ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => stockStatus.status !== 'out-of-stock' && (e.target.style.background = '#F7CA00')}
                onMouseLeave={(e) => stockStatus.status !== 'out-of-stock' && (e.target.style.background = '#FFD814')}
              >
                Add to Cart
              </button>
              
              <button 
                onClick={handleBuyNow}
                disabled={stockStatus.status === 'out-of-stock' || isBuyingNow}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: stockStatus.status === 'out-of-stock' || isBuyingNow ? '#D5D9D9' : '#FFA41C',
                  border: '1px solid #FF8F00',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#0F1111',
                  cursor: (stockStatus.status === 'out-of-stock' || isBuyingNow) ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => !(stockStatus.status === 'out-of-stock' || isBuyingNow) && (e.target.style.background = '#FA8900')}
                onMouseLeave={(e) => !(stockStatus.status === 'out-of-stock' || isBuyingNow) && (e.target.style.background = '#FFA41C')}
              >
                {isBuyingNow ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Related Products Section - Amazon Style Horizontal Carousel */}
        {relatedProducts.length > 0 && (
          <div style={{ 
            background: '#fff',
            padding: '24px 32px 32px',
            borderTop: '1px solid #E7E7E7'
          }}>
            <h2 style={{ 
              fontSize: '21px', 
              fontWeight: '700', 
              marginBottom: '16px',
              color: '#0F1111'
            }}>
              Related products
            </h2>
            
            {/* Horizontal Scrollable Container */}
            <div style={{
              display: 'flex',
              gap: '16px',
              overflowX: 'auto',
              overflowY: 'hidden',
              paddingBottom: '16px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#888 #f1f1f1',
              WebkitOverflowScrolling: 'touch'
            }}>
              {relatedProducts.map((relatedProduct) => {
                const relatedPrice = relatedProduct.packageSizes?.[0]?.price || relatedProduct.price;
                const relatedOriginalPrice = relatedProduct.originalPrice;
                const relatedDiscount = relatedOriginalPrice ? Math.round(((relatedOriginalPrice - relatedPrice) / relatedOriginalPrice) * 100) : 0;
                
                return (
                  <div 
                    key={relatedProduct._id}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setProduct(null);
                      setLoading(true);
                      if (onClose) {
                        onClose();
                        setTimeout(() => {
                          window.location.hash = `#product-${relatedProduct._id}`;
                          window.location.reload();
                        }, 300);
                      }
                    }}
                    style={{
                      minWidth: '200px',
                      maxWidth: '200px',
                      background: '#fff',
                      border: '1px solid #DDD',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      e.currentTarget.style.borderColor = '#C7C7C7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#DDD';
                    }}
                  >
                    {/* Product Image */}
                    <div style={{ 
                      position: 'relative', 
                      width: '100%',
                      height: '200px',
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      padding: '16px'
                    }}>
                      <img 
                        src={relatedProduct.image?.startsWith('http') ? relatedProduct.image : getImageUrl(relatedProduct.image)}
                        alt={relatedProduct.name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                      />
                      {relatedDiscount > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          background: '#CC0C39',
                          color: '#fff',
                          padding: '4px 6px',
                          borderRadius: '3px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          -{relatedDiscount}%
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{
                        fontSize: '13px',
                        lineHeight: '18px',
                        color: '#0F1111',
                        marginBottom: '8px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: '2',
                        WebkitBoxOrient: 'vertical',
                        minHeight: '36px',
                        fontWeight: '400'
                      }}>
                        {relatedProduct.name}
                      </div>
                      
                      {/* Rating */}
                      {relatedProduct.rating > 0 && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          marginBottom: '6px',
                          fontSize: '12px'
                        }}>
                          <span style={{ color: '#007185', fontSize: '12px' }}>{relatedProduct.rating}</span>
                          <div style={{ color: '#FFA41C', fontSize: '12px' }}>★★★★☆</div>
                          <span style={{ color: '#565959', fontSize: '11px' }}>({relatedProduct.reviews || 0})</span>
                        </div>
                      )}
                      
                      {/* Price */}
                      <div style={{ marginTop: 'auto' }}>
                        <div style={{
                          fontSize: '18px',
                          color: '#B12704',
                          fontWeight: '400',
                          marginBottom: '2px'
                        }}>
                          ₹{relatedPrice}
                        </div>
                        {relatedOriginalPrice && relatedOriginalPrice > relatedPrice && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <span style={{
                              fontSize: '12px',
                              color: '#565959',
                              textDecoration: 'line-through'
                            }}>
                              ₹{relatedOriginalPrice}
                            </span>
                          </div>
                        )}
                        
                        {/* Stock Badge */}
                        <div style={{ marginTop: '4px' }}>
                          {relatedProduct.stock > 0 ? (
                            <span style={{
                              fontSize: '11px',
                              color: '#007600',
                              fontWeight: '400'
                            }}>
                              In Stock
                            </span>
                          ) : (
                            <span style={{
                              fontSize: '11px',
                              color: '#B12704',
                              fontWeight: '400'
                            }}>
                              Currently unavailable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
