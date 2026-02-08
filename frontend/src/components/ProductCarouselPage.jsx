import { useState, useEffect, useRef } from 'react';
import { getImageUrl, getApiUrl } from '../config/api';
import { useNavigate } from 'react-router-dom';

export default function ProductCarouselPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const navigate = useNavigate();
    const carouselRef = useRef(null);

    useEffect(() => {
        loadProducts();
    }, []);

    // Auto-play effect
    useEffect(() => {
        if (products.length === 0) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % products.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [products]);

    const loadProducts = async () => {
        try {
            const response = await fetch(getApiUrl('/api/products'));
            if (response.ok) {
                const data = await response.json();

                // Robust data handling - handle if API returns { products: [] } or just []
                const productsArray = Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []);

                // Duplicate data if fewer than 5 items to ensure carousel looks good
                const extendedData = productsArray.length < 5 && productsArray.length > 0
                    ? [...productsArray, ...productsArray, ...productsArray].slice(0, 10)
                    : productsArray;

                setProducts(extendedData);
            } else {
                setError('Failed to load products');
                setProducts([]);
            }
        } catch (error) {
            setError('Error loading products: ' + error.message);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + products.length) % products.length);
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % products.length);
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="carousel-page-container">
            <style>{`
        .carousel-page-container {
          min-height: 100vh;
          background: #0f172a; /* Dark premium background */
          color: white;
          font-family: 'Inter', system-ui, sans-serif;
          overflow-x: hidden;
          perspective: 1000px;
          display: flex;
          flex-direction: column;
        }

        .background-glow {
          position: absolute;
          width: 60vw;
          height: 60vw;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(0,0,0,0) 70%);
          top: -20%;
          left: 20%;
          z-index: 0;
          pointer-events: none;
        }

        .header {
          padding: 2rem;
          text-align: center;
          position: relative;
          z-index: 10;
        }

        .header h1 {
          font-size: 3.5rem;
          font-weight: 800;
          background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
          text-shadow: 0 0 30px rgba(79, 172, 254, 0.5);
        }

        .header p {
          color: #94a3b8;
          font-size: 1.2rem;
        }

        /* 3D Carousel Styles */
        .carousel-stage {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          height: 600px;
          transform-style: preserve-3d;
          margin-top: -2rem;
        }

        .carousel-item {
          position: absolute;
          width: 340px;
          height: 500px;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          transform-style: preserve-3d;
          border-radius: 24px;
          cursor: pointer;
        }

        .card-inner {
          width: 100%;
          height: 100%;
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
        }

        .image-wrapper {
          height: 60%;
          position: relative;
          overflow: hidden;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.5s ease;
          padding: 20px;
        }

        .carousel-item:hover .image-wrapper img {
          transform: scale(1.1);
        }

        .content {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .product-tag {
          align-self: flex-start;
          background: rgba(56, 189, 248, 0.1);
          color: #38bdf8;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: #f1f5f9;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }

        .price {
          font-size: 1.8rem;
          font-weight: 700;
          color: #fff;
        }

        .action-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          margin-top: 16px;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(14, 165, 233, 0.4);
        }

        .controls {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-bottom: 40px;
          z-index: 20;
        }

        .control-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .control-btn:hover {
          background: white;
          color: #0f172a;
          transform: scale(1.1);
        }

        .reflection {
           position: absolute;
           bottom: -20px;
           left: 0;
           width: 100%;
           height: 30px;
           background: radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 70%);
           border-radius: 50%;
           transform: scaleY(0.4);
           filter: blur(5px);
           z-index: -1;
        }

      `}</style>

            <div className="background-glow" />

            <header className="header">
                <h1>Premium Showcase</h1>
                <p>Experience our exclusive collection in style</p>
            </header>

            <div className="carousel-stage">
                {products.map((product, index) => {
                    // Calculate offset relative to active index
                    let offset = index - activeIndex;

                    // Handle infinite loop visual logic for array
                    if (offset < -1 * Math.floor(products.length / 2)) offset += products.length;
                    if (offset > Math.floor(products.length / 2)) offset -= products.length;

                    // Only render visible items to keep DOM clean if list is huge (optional, but good for < 20)
                    const absOffset = Math.abs(offset);
                    const isActive = offset === 0;

                    // Dynamic styles based on offset
                    const style = {
                        transform: `
                            translateX(${offset * 220}px) 
                            translateZ(${-absOffset * 250}px) 
                            rotateY(${offset * -25}deg)
                        `,
                        zIndex: 100 - absOffset,
                        opacity: absOffset > 3 ? 0 : 1 - (absOffset * 0.15),
                        filter: `blur(${absOffset * 2}px) brightness(${1 - absOffset * 0.15})`,
                        pointerEvents: isActive ? 'auto' : 'none',
                    };

                    if (absOffset > 3) return null; // Hide non-visible

                    return (
                        <div
                            key={product._id || index}
                            className="carousel-item"
                            style={style}
                            onClick={() => setActiveIndex(index)}
                        >
                            <div className="card-inner">
                                <div className="image-wrapper">
                                    <img src={getImageUrl(product.image)} alt={product.name}
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=Product'} />
                                </div>
                                <div className="content">
                                    <div>
                                        <span className="product-tag">{product.category || 'Premium'}</span>
                                        <h3 className="title">{product.name}</h3>
                                        <div className="price-row">
                                            <span className="price">₹{product.price?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <button className="action-btn">View Details</button>
                                </div>
                            </div>
                            {isActive && <div className="reflection"></div>}
                        </div>
                    );
                })}
            </div>

            <div className="controls">
                <button className="control-btn" onClick={handlePrev}>←</button>
                <button className="control-btn" onClick={handleNext}>→</button>
            </div>

        </div>
    );
}

const LoadingSpinner = () => (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' }}>
        Loading Premium Experience...
    </div>
);

const ErrorMessage = ({ message }) => (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#ff6b6b' }}>
        {message}
    </div>
);
