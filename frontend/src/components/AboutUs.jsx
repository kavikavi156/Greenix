import { Link } from 'react-router-dom';
import '../css/ProfessionalEcommerce.css';
import '../css/Overlays.css';

export default function AboutUs() {
    return (
        <div className="enhanced-home">
            {/* Shared Header for consistency */}
            <header className="fresh-flow-header" style={{ position: 'relative', background: 'rgba(15, 59, 33, 0.95)' }}>
                <div className="header-top" style={{ background: '#0f3b21' }}>
                    <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link to="/" className="fresh-logo" style={{ textDecoration: 'none' }}>
                            <svg className="leaf-icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
                                <path d="M20 5C20 5 8 10 8 22C8 28 12 32 18 34C18 34 15 28 18 24C21 20 20 15 20 15C20 15 19 20 22 24C25 28 22 34 22 34C28 32 32 28 32 22C32 10 20 5 20 5Z" fill="#72cf61" />
                            </svg>
                            <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '1.5rem', marginLeft: '10px' }}>Greenixx</span>
                        </Link>

                        <div className="header-actions">
                            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500', marginRight: '20px' }}>Home</Link>
                            <Link to="/about" style={{ color: '#72cf61', textDecoration: 'none', fontWeight: '500' }}>About Us</Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* About Us Hero */}
            <section className="about-hero" style={{
                padding: '6rem 2rem',
                background: 'linear-gradient(rgba(15, 59, 33, 0.85), rgba(15, 59, 33, 0.85)), url("/hero-bg-agri.jpg") center/cover',
                color: 'white',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', marginTop: '2rem' }}>Cultivating <span style={{ color: '#72cf61' }}>Excellence</span></h1>
                <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', opacity: 0.9, lineHeight: 1.6 }}>
                    At Greenixx, we believe in the power of modern agriculture to feed the world sustainably.
                    Our mission is to empower farmers with cutting-edge tools, premium supplies, and real-time digital insights.
                </p>
            </section>

            {/* Mission & Vision Section */}
            <section style={{ padding: '5rem 2rem', background: '#f8fafc' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>

                    <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                        <h3 style={{ color: '#0f3b21', fontSize: '1.8rem', marginBottom: '1rem', fontWeight: '700' }}>Our Mission</h3>
                        <p style={{ color: '#475569', lineHeight: 1.7 }}>
                            To revolutionize traditional farming by providing accessible, high-quality agricultural inputs and data-driven crop advisory. We aim to increase crop yields while promoting sustainable and eco-friendly farming practices.
                        </p>
                    </div>

                    <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌍</div>
                        <h3 style={{ color: '#0f3b21', fontSize: '1.8rem', marginBottom: '1rem', fontWeight: '700' }}>Our Vision</h3>
                        <p style={{ color: '#475569', lineHeight: 1.7 }}>
                            To be the leading digital agricultural ecosystem in the nation, bridging the gap between technological innovation and grassroots farming communities for a greener, more prosperous future.
                        </p>
                    </div>

                </div>
            </section>

            {/* Stats/Timeline Section */}
            <section style={{ padding: '5rem 2rem', background: 'white' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', color: '#0f3b21', marginBottom: '1rem', fontWeight: '800' }}>The Greenixx Journey</h2>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '4rem' }}>Over two decades of dedication to the agricultural sector.</p>

                    <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
                        <div>
                            <div style={{ fontSize: '3.5rem', fontWeight: '800', color: '#72cf61' }}>25+</div>
                            <div style={{ color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.5rem' }}>Years of Excellence</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '3.5rem', fontWeight: '800', color: '#72cf61' }}>10K+</div>
                            <div style={{ color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.5rem' }}>Happy Farmers</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '3.5rem', fontWeight: '800', color: '#72cf61' }}>500+</div>
                            <div style={{ color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.5rem' }}>Products Sourced</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section style={{ padding: '5rem 2rem', background: '#f8fafc' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', color: '#0f3b21', marginBottom: '1rem', fontWeight: '800' }}>Our Core Values</h2>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                            These principles guide every decision we make and every product we deliver.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        {[
                            { icon: '🌱', title: 'Sustainability', desc: 'Promoting farming practices that protect our earth for future generations.' },
                            { icon: '🤝', title: 'Community', desc: 'Building strong relationships with farmers, dealers, and agricultural experts.' },
                            { icon: '💡', title: 'Innovation', desc: 'Leveraging modern technology to solve traditional farming challenges.' },
                            { icon: '🛡️', title: 'Integrity', desc: 'Ensuring transparency, quality, and trust in every transaction.' }
                        ].map((value, index) => (
                            <div key={index} style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{value.icon}</div>
                                <h4 style={{ color: '#0f3b21', fontSize: '1.4rem', marginBottom: '1rem', fontWeight: '700' }}>{value.title}</h4>
                                <p style={{ color: '#64748b', lineHeight: 1.6 }}>{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story Section / Approach */}
            <section style={{ padding: '6rem 2rem', background: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '4rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', maxWidth: '800px' }}>
                        <h2 style={{ fontSize: '2.5rem', color: '#0f3b21', marginBottom: '1.5rem', fontWeight: '800' }}>Our Story</h2>
                        <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                            Founded with a deep respect for farming communities, Greenixx started as a small local supplier and has grown into a comprehensive digital platform. We recognized that farmers needed more than just supplies; they needed a trusted partner who could provide real-time insights, quality checks, and seamless market access.
                        </p>
                        <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.8 }}>
                            Today, our platform connects thousands of users, bridging the gap between traditional agriculture and modern technological advancements. We are committed to fostering an ecosystem where every seed planted yields maximum potential.
                        </p>
                    </div>
                </div>
            </section>

            {/* Meet Our Team Section */}
            <section style={{ padding: '5rem 2rem', background: '#f8fafc' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', color: '#0f3b21', marginBottom: '1rem', fontWeight: '800' }}>Meet The Team</h2>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem auto' }}>
                        Dedicated professionals with decades of combined experience in agriculture, technology, and supply chain management.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
                        {[
                            { name: 'Arun Kumar', role: 'Chief Executive Officer', bg: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop' },
                            { name: 'Dr. Priya Sharma', role: 'Head of Agronomy', bg: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop' },
                            { name: 'Vikram Singh', role: 'Supply Chain Director', bg: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop' },
                            { name: 'Anita Patel', role: 'Community Outreach', bg: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop' }
                        ].map((member, index) => (
                            <div key={index} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{ height: '250px', backgroundImage: `url(${member.bg})`, backgroundSize: 'cover', backgroundPosition: 'center top' }}></div>
                                <div style={{ padding: '1.5rem' }}>
                                    <h4 style={{ color: '#0f3b21', fontSize: '1.25rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>{member.name}</h4>
                                    <p style={{ color: '#72cf61', fontWeight: '600', margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '6rem 2rem', background: '#0f3b21', color: 'white', textAlign: 'center' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem' }}>Ready to Grow Together?</h2>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '2.5rem' }}>
                        Join the agricultural revolution. Explore our wide range of premium products and get intelligent crop advisory right at your fingertips.
                    </p>
                    <Link to="/" style={{ background: '#72cf61', color: '#0f3b21', padding: '1rem 2.5rem', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', transition: 'background-color 0.2s ease', boxShadow: '0 4px 15px rgba(114, 207, 97, 0.4)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8ae677'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#72cf61'}>
                        Get Started Today
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="professional-footer" style={{ background: '#0f3b21' }}>
                <div style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#94a3b8' }}>&copy; {new Date().getFullYear()} Greenixx Agricultural Solutions. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
