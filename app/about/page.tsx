"use client";

import { useEffect, useState } from "react";

export default function AboutPage() {
    useEffect(() => {
        // Simple intersection observer for fade-up reveal animation
        const observerOptions = {
            root: null,
            rootMargin: "0px",
            threshold: 0.15,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const fadeElements = document.querySelectorAll(".fade-up");
        fadeElements.forEach((el) => observer.observe(el));

        return () => {
            fadeElements.forEach((el) => observer.unobserve(el));
        };
    }, []);

    return (
        <div className="about-page-body">


            {/* Hero Section */}
            <section className="about-hero">
                <div className="about-hero-overlay" />
                <img
                    alt="Close up of a barista pouring latte art into a ceramic cup in a warm, dimly lit cafe setting"
                    className="about-hero-img"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHzPstUH64GqHcknUWQO6nMxJwtk9jeCJy2X2kFdgcR2JXAKdGU-kHwTrMdFRJ_QnDK70EQiAQqpINXdf-WG-txfleyEkYpXRK_zeWiTct1OEhkHCmJF2xLEQqxtLBAKlO-cBt-roVcJNUj8oBHy33bWwu6K9hKmCnisA5X-IWkGKjOAHwK_C7xxbpRL7ZYSyTgayonCm9153yR8n6iPDZvpiM-4781mmO-LnN0T1EDWdWsJBv-QRj-g"
                />
                <div className="about-hero-content">
                    <p className="about-hero-kicker fade-up">Our Story</p>
                    <h1 className="about-hero-title fade-up" style={{ transitionDelay: "100ms" }}>
                        Coffee made with intention. Moments shared with warmth.
                    </h1>
                    <p className="about-hero-copy fade-up" style={{ transitionDelay: "200ms" }}>
                        We believe that a great cup of coffee is more than just a drink—it's a pause, a ritual, and a way to connect. Welcome to our space.
                    </p>
                </div>
                <a href="#story-start" className="about-hero-scroll">
                    <span className="about-hero-scroll-text">Scroll</span>
                    <div className="about-hero-scroll-icon">↓</div>
                </a>
            </section>

            {/* Brand Story Section */}
            <section id="story-start" className="about-section-padding about-container">
                <div className="about-grid-12">
                    <div className="about-story-visual-col fade-up">
                        <p className="about-story-kicker-sidebar">The Beginning</p>
                        <img
                            alt="Wide shot of a minimalist, light-filled cafe interior with wooden tables, archways, and a barista behind a curved counter"
                            className="about-story-image"
                            src="/assets/our-story.jpg"
                        />
                    </div>
                    <div className="about-story-text-col fade-up">
                        <span className="about-story-number">01</span>
                        <h2 className="about-section-title">More than a daily ritual</h2>
                        <p className="about-story-copy-lg">
                            Vhermosa Café began with a simple idea: to create a space that feels like a deep breath. A place where the chaotic pace of the city fades away, replaced by the comforting hum of conversation and the rich aroma of freshly ground espresso.
                        </p>
                        <p className="about-story-copy-md">
                            Every detail of our cafe, from the warm minimalist design to the carefully sourced beans, is designed to foster a sense of calm and belonging. We aren't just serving coffee; we're curating an experience.
                        </p>
                    </div>
                </div>
            </section>

            {/* Full-width Statement */}
            <section
                className="about-statement-section fade-up"
                style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCHydyQaAblzg_SSv4-xa8hczhvVSCffIquAHO_lPeWlCQ99tMEdv_5xPG8ysyQQUuxiyjqP_fEZtj7FGcn-BciwkHh33Q-XGs5PmTLx__kwO8TIzaz0A66H4YImeV1ra0BrHGOo7w1eiJR0w_tr7vBUTdp_rLcm8V1QgcmeRQfiJ4wU2Yj28N5GtIEzrMQkrutudKrnhoYQx-BdiymQHPFt24klQBcq226ScD6bSlFZYvXJWyvvDVZdA')`,
                }}
            >
                <div className="about-statement-overlay" />
                <div className="about-statement-content">
                    <h2 className="about-statement-title">
                        Made with care. <br />
                        Shared with warmth.
                    </h2>
                </div>
            </section>

            {/* Values Section */}
            <section className="about-section-padding about-container">
                <div className="about-values-header fade-up">
                    <h2 className="about-values-title">Our guiding principles</h2>
                    <p className="about-values-subtitle">
                        The values that shape every cup we pour and every interaction we share.
                    </p>
                </div>
                <div className="about-values-list">
                    {/* Value 1 */}
                    <div className="about-value-row fade-up">
                        <div className="about-value-number-col">
                            <span className="about-value-number">01</span>
                        </div>
                        <div className="about-value-content-col">
                            <h3 className="about-value-title">Thoughtful Craft</h3>
                            <p className="about-value-desc">
                                We approach coffee making as an art form, paying meticulous attention to extraction, temperature, and technique to bring out the best in every roast.
                            </p>
                        </div>
                    </div>
                    {/* Value 2 */}
                    <div className="about-value-row fade-up">
                        <div className="about-value-number-col">
                            <span className="about-value-number">02</span>
                        </div>
                        <div className="about-value-content-col">
                            <h3 className="about-value-title">Quality Ingredients</h3>
                            <p className="about-value-desc">
                                From ethically sourced single-origin beans to organic dairy and house-made syrups, we compromise on nothing when it comes to flavor.
                            </p>
                        </div>
                    </div>
                    {/* Value 3 */}
                    <div className="about-value-row fade-up">
                        <div className="about-value-number-col">
                            <span className="about-value-number">03</span>
                        </div>
                        <div className="about-value-content-col">
                            <h3 className="about-value-title">Warm Hospitality</h3>
                            <p className="about-value-desc">
                                We believe a great cafe is built on genuine connection. Our team is dedicated to making every guest feel seen, welcomed, and appreciated.
                            </p>
                        </div>
                    </div>
                    {/* Value 4 */}
                    <div className="about-value-row fade-up">
                        <div className="about-value-number-col">
                            <span className="about-value-number">04</span>
                        </div>
                        <div className="about-value-content-col">
                            <h3 className="about-value-title">Meaningful Spaces</h3>
                            <p className="about-value-desc">
                                Our environment is intentionally designed to be a sanctuary—a place of quiet inspiration amidst the noise of the everyday.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Craft Section */}
            <section className="about-craft-section">
                <div className="about-container about-craft-grid">
                    <div className="about-craft-text-col fade-up">
                        <span className="about-craft-number">02</span>
                        <h2 className="about-section-title">Made carefully, served beautifully</h2>
                        <p className="about-craft-copy">
                            Every espresso shot is dialed in with precision, every milk pitcher steamed to the perfect micro-foam texture. We view our craft as an ongoing pursuit of excellence, blending deep technical knowledge with creative expression.
                        </p>
                        <a href="/menu" className="about-craft-cta">
                            Discover Our Signature Drinks
                            <span className="about-cta-arrow">→</span>
                        </a>
                    </div>
                    <div className="about-craft-visual-col fade-up">
                        <div className="about-craft-shadow-box" />
                        <img
                            alt="Baristas working behind a modern espresso machine in a bustling, well-lit cafe with marble countertops and brass accents"
                            className="about-craft-image"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2wgk0vX4WvYzGh9V4wu3WseRtRDV9-2630wgaOYgWB5nCwcWyBI70gGkWiFTx8TiPt78_0tzUDIMfreVmeWA0Exm7OJkPhEAB4DNJLxtl30R_YgWA4kjMBxob4349jF0h2WCVrw24Z_bJjGfJC4l12R8kh7fyz8ZYgj9kuQ0mKotj1BiE23xhaBLABng9DT_UC6IeZLuPcZ2kj_J7PrIVo3A5V7s1ToP36BV7UpsYFek9eF5MC6sRPw"
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="about-footer">
                <div className="about-footer-grid">
                    <div className="about-footer-brand-col">
                        <a href="/" className="about-footer-title">
                            Vhermosa Café
                        </a>
                        <p className="about-footer-copyright">
                            © 2026 Vhermosa Café. All rights reserved.
                        </p>
                    </div>
                    <div className="about-footer-links-col">
                        <h4 className="about-footer-col-title">Explore</h4>
                        <a href="/menu" className="about-footer-link">
                            Menu
                        </a>
                        <a href="/about" className="about-footer-link active-link">
                            Our Story
                        </a>
                        <a href="/location" className="about-footer-link">
                            Locations
                        </a>
                        <a href="/promo" className="about-footer-link">
                            Promo
                        </a>
                        <a href="/about#contact" className="about-footer-link">
                            Contact
                        </a>
                    </div>
                    <div className="about-footer-links-col" id="contact">
                        <h4 className="about-footer-col-title">Connect</h4>
                        <a href="https://instagram.com" className="about-footer-link" target="_blank" rel="noopener noreferrer">
                            Instagram
                        </a>
                        <a href="https://facebook.com" className="about-footer-link" target="_blank" rel="noopener noreferrer">
                            Facebook
                        </a>
                        <a href="#newsletter" className="about-footer-link">
                            Newsletter
                        </a>
                    </div>
                    <div id="location">
                        <h4 className="about-footer-col-title">Visit</h4>
                        <p className="about-footer-address">
                            123 Bean Street
                            <br />
                            Coffeeville, CF 12345
                        </p>
                        <p className="about-footer-hours">Mon-Sun: 7am - 5pm</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
