import { Link } from 'react-router-dom';
import '../css/ProfessionalEcommerce.css';
import '../css/Overlays.css';
import '../css/AboutUs.css';
import storeHero from '../assets/store-hero.png';
import proprietorImg from '../assets/proprietor.png';

export default function AboutUs() {
    return (
        <div className="about-container">
            {/* Consistent Multi-page Header */}
            <header className="fresh-flow-header" style={{ position: 'relative', background: 'var(--primary-green)' }}>
                <div className="header-top" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
                        <Link to="/" className="fresh-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                            <svg className="leaf-icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
                                <path d="M20 5C20 5 8 10 8 22C8 28 12 32 18 34C18 34 15 28 18 24C21 20 20 15 20 15C20 15 19 20 22 24C25 28 22 34 22 34C28 32 32 28 32 22C32 10 20 5 20 5Z" fill="#72cf61" />
                            </svg>
                            <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '1.8rem', marginLeft: '12px', letterSpacing: '-1px' }}>Greenixx</span>
                        </Link>

                        <nav className="header-actions">
                            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '600', marginRight: '30px' }}>Home</Link>
                            <Link to="/about" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontWeight: '600' }}>About Us</Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Premium Hero Section */}
            <section className="about-hero-section">
                <h1>Cultivating <span className="highlight">Excellence</span> Since 2021</h1>
                <p className="hero-subtitle">
                    Welcome to Pavithra Traders, where we combine decades of agricultural wisdom with modern innovation. Located in the heart of Thoppampatti, Palani, we are dedicated to empowering farmers with premium supplies and sustainable solutions.
                </p>
            </section>

            {/* Info Cards */}
            <div className="mission-vision-grid">
                <div className="info-card">
                    <span className="card-icon">🎯</span>
                    <h3>Our Mission</h3>
                    <p>
                        To revolutionize farming in the Thoppampatti region by providing high-quality fertilizers, seeds, and oils that maximize productivity while protecting our soil for future generations.
                    </p>
                </div>

                <div className="info-card">
                    <span className="card-icon">🌍</span>
                    <h3>Our Vision</h3>
                    <p>
                        To become the region's most trusted agricultural hub, bridging the gap between national quality standards and local farming needs through transparent and fair practices.
                    </p>
                </div>
            </div>

            {/* Story & Image Section */}
            <section className="story-layout">
                <div className="story-content">
                    <h2>Our Journey</h2>
                    <p>
                        Pavithra Traders was founded with a simple yet powerful goal: to provide the farming community of Thoppampatti and Palani with access to world-class agricultural inputs. What started as a local dream has grown into a cornerstone for local agriculture.
                    </p>
                    <p>
                        Under the leadership of our proprietor, Sureshkumar, we have consistently expanded our catalog to include specialized mineral fertilizers, vegetable oils, and organic soil enhancers. We believe that every farmer deserves the best tools to nurture their land.
                    </p>
                </div>
                <div className="story-image-container">
                    <img src={storeHero} alt="Pavithra Traders Storefront" />
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-number">4+</span>
                        <span className="stat-label">Years of Trust</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">1000+</span>
                        <span className="stat-label">Local Farmers</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">50+</span>
                        <span className="stat-label">Quality Products</span>
                    </div>
                </div>
            </section>

            {/* Team/Proprietor Section */}
            <section className="team-section">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Leadership</h2>
                </div>
                <div className="team-grid">
                    <div className="team-card">
                        <div className="team-img" style={{ backgroundImage: `url(${proprietorImg})` }}></div>
                        <div className="team-info">
                            <h4>Sureshkumar</h4>
                            <p>Proprietor & Founder</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Location Section */}
            <section className="location-section">
                <div className="location-container">
                    <div className="address-box">
                        <h3>Visit Our Store</h3>
                        <p><strong>Pavithra Traders</strong></p>
                        <p>2/382, Palani Main Road,</p>
                        <p>Thoppampatti, Dindigul District,</p>
                        <p>Tamil Nadu - 624617, India</p>

                        <div className="contact-info">
                            <div className="contact-item">
                                <span>📧</span>
                                <div>info@pavithratraders.com</div>
                            </div>
                            <div className="contact-item">
                                <span>📞</span>
                                <div>+91 (Area Code) XXXXX-XXXXX</div>
                            </div>
                            <div className="contact-item">
                                <span>🕒</span>
                                <div>Mon - Sat: 9:00 AM - 8:00 PM</div>
                            </div>
                        </div>
                    </div>

                    <div className="map-placeholder">
                        <iframe
                            title="Google Maps Location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15690.000000000002!2d77.493863!3d10.552885!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba9d00000000001%3A0x0!2sThoppampatti%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade">
                        </iframe>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '6rem 2rem', background: '#0f3b21', color: 'white', textAlign: 'center' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem' }}>Empowering Agriculture Together</h2>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '2.5rem' }}>
                        Join thousands of farmers who trust Pavithra Traders for their agricultural needs. Get the best results for your crops today.
                    </p>
                    <Link to="/" style={{ background: 'var(--accent-green)', color: '#0f3b21', padding: '1.2rem 3rem', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', transition: 'all 0.3s ease', boxShadow: '0 10px 25px rgba(114, 207, 97, 0.4)' }}>
                        Shop Our Collection
                    </Link>
                </div>
            </section>

            <footer className="professional-footer" style={{ background: 'var(--primary-green)', textAlign: 'center', padding: '3rem 2rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>&copy; {new Date().getFullYear()} Pavithra Traders & Greenixx Solutions. All rights reserved.</p>
            </footer >
        </div >
    );
}
