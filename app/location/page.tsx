"use client";

import { useEffect, useState, useRef } from "react";

// Easily replaceable image path configuration
const locationImages = {
    hero: "/assets/shop.jpeg",
    feature: "/assets/shop.jpeg" // Using shop.jpeg as placeholder for both
};

export default function LocationPage() {
    const [mounted, setMounted] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Contact Form States
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "General Inquiry",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formSuccess, setFormSuccess] = useState(false);

    const addressText = "130 Tagaytay - Nasugbu Hwy, Laurel, Batangas, 4221";
    const mapUrl = "https://maps.app.goo.gl/KjPwXHnTNDtohHPNA";

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        setIsSubmitting(false);
        setFormSuccess(true);
        setFormData({
            name: "",
            email: "",
            subject: "General Inquiry",
            message: ""
        });
    };

    useEffect(() => {
        setMounted(true);
        return () => {
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        };
    }, []);

    const handleCopyAddress = async () => {
        try {
            await navigator.clipboard.writeText(addressText);
            setCopySuccess(true);

            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
            copyTimeoutRef.current = setTimeout(() => {
                setCopySuccess(false);
            }, 3000);
        } catch (err) {
            console.error("Failed to copy address: ", err);
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="location-page-container">
            {/* Structured Data (SEO JSON-LD) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CafeOrCoffeeShop",
                        "name": "VHermosa Café",
                        "image": locationImages.hero,
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "130 Tagaytay - Nasugbu Hwy",
                            "addressLocality": "Laurel",
                            "addressRegion": "Batangas",
                            "postalCode": "4221",
                            "addressCountry": "PH"
                        },
                        "telephone": "+63 917 127 7112",
                        "email": "teppanyakitagaytaytaalview@gmail.com"
                    })
                }}
            />

            <main className="location-main-content">
                {/* 1. HERO SECTION */}
                <section className="location-hero" aria-labelledby="hero-title">
                    <div className="location-hero-grid">
                        <div className="location-hero-text-col">
                            <span className="location-hero-eyebrow">Visit VHermosa Café</span>
                            <h1 id="hero-title" className="location-hero-title">
                                Your Coffee Escape Along Tagaytay–Nasugbu Highway
                            </h1>
                            <p className="location-hero-desc">
                                Discover a warm and welcoming café destination in Laurel, Batangas, where comforting food, handcrafted drinks, and relaxing surroundings come together.
                            </p>
                            <div className="location-hero-actions">
                                <a
                                    href="#details-section"
                                    className="location-hero-primary-btn"
                                >
                                    View Details
                                </a>
                            </div>
                        </div>
                        <div className="location-hero-visual-col">
                            <div className="location-hero-img-wrap">
                                <img
                                    src={locationImages.hero}
                                    alt="Exterior view of VHermosa Café along Tagaytay–Nasugbu Highway in Laurel, Batangas"
                                    className="location-hero-img"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. CONSOLIDATED DETAILS SECTION */}
                <section id="details-section" className="location-details-section" aria-labelledby="details-heading">
                    <div className="location-info-container">
                        <div className="location-info-header">
                            <h2 id="details-heading" className="location-section-title">Get in Touch</h2>
                        </div>

                        <div className="location-split-grid">
                            {/* Left Side: Unified Contact Card */}
                            <div className="location-unified-card">
                                <h3 className="location-card-title-main">Contact Details</h3>
                                
                                <div className="location-unified-row">
                                    <div className="location-card-icon-wrap">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                        </svg>
                                    </div>
                                    <div className="location-unified-content">
                                        <h4 className="location-detail-label">Our Address</h4>
                                        <p className="location-detail-value address-value">
                                            130 Tagaytay - Nasugbu Hwy,<br />
                                            Laurel, Batangas, 4221
                                        </p>
                                        <div className="location-card-actions">
                                            <a
                                                href={mapUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="location-card-btn-primary"
                                                aria-label="Open VHermosa Café location in Google Maps"
                                            >
                                                Open in Maps
                                            </a>
                                            <button
                                                onClick={handleCopyAddress}
                                                className="location-card-btn-secondary"
                                                aria-label="Copy VHermosa Café address"
                                            >
                                                Copy Address
                                            </button>
                                            {copySuccess && (
                                                <span className="location-copy-toast" role="status" aria-live="polite">
                                                    Address copied!
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="location-unified-divider" />

                                <div className="location-unified-row">
                                    <div className="location-card-icon-wrap">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true">
                                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                        </svg>
                                    </div>
                                    <div className="location-unified-content">
                                        <h4 className="location-detail-label">Call Us</h4>
                                        <p className="location-detail-value">0917 127 7112</p>
                                        <a
                                            href="tel:+639171277112"
                                            className="location-detail-btn"
                                            aria-label="Call VHermosa Café at 0917 127 7112"
                                        >
                                            Call Now
                                        </a>
                                    </div>
                                </div>

                                <div className="location-unified-divider" />

                                <div className="location-unified-row">
                                    <div className="location-card-icon-wrap">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true">
                                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                        </svg>
                                    </div>
                                    <div className="location-unified-content">
                                        <h4 className="location-detail-label">Email Us</h4>
                                        <p className="location-detail-value email-value">teppanyakitagaytaytaalview@gmail.com</p>
                                        <a
                                            href="mailto:teppanyakitagaytaytaalview@gmail.com"
                                            className="location-detail-btn"
                                            aria-label="Email VHermosa Café"
                                        >
                                            Send Email
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Contact Form */}
                            <div className="location-contact-form-wrap">
                                <h3 className="location-form-title">Send us a Message</h3>
                                {formSuccess ? (
                                    <div className="location-form-success" role="alert">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24" className="success-icon" aria-hidden="true">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                        </svg>
                                        <p>Thank you for reaching out! We have received your message and will get back to you shortly.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleFormSubmit} className="location-contact-form">
                                        <div className="location-form-row">
                                            <div className="location-form-group">
                                                <label htmlFor="name-input" className="location-field-label">Name</label>
                                                <input
                                                    id="name-input"
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleFormChange}
                                                    className="location-form-input"
                                                    placeholder="Your Name"
                                                    required
                                                />
                                            </div>
                                            <div className="location-form-group">
                                                <label htmlFor="email-input" className="location-field-label">Email Address</label>
                                                <input
                                                    id="email-input"
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleFormChange}
                                                    className="location-form-input"
                                                    placeholder="your.email@example.com"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="location-form-group">
                                            <label htmlFor="subject-input" className="location-field-label">Subject</label>
                                            <select
                                                id="subject-input"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleFormChange}
                                                className="location-form-select"
                                                required
                                            >
                                                <option value="General Inquiry">General Inquiry</option>
                                                <option value="Event Booking">Private Event Booking</option>
                                                <option value="Catering">Catering Inquiry</option>
                                                <option value="Feedback">Feedback</option>
                                            </select>
                                        </div>
                                        <div className="location-form-group">
                                            <label htmlFor="message-input" className="location-field-label">Message</label>
                                            <textarea
                                                id="message-input"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleFormChange}
                                                className="location-form-textarea"
                                                placeholder="Tell us what's on your mind..."
                                                rows={5}
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="location-form-submit-btn"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <span className="btn-spinner-text">
                                                    Sending...
                                                </span>
                                            ) : (
                                                "Send Message"
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. MAP SECTION */}
                <section className="location-map-section" aria-labelledby="plan-visit-heading">
                    <div className="location-info-container">
                        <div className="location-map-header">
                            <h2 id="plan-visit-heading" className="location-section-title">Plan Your Visit</h2>
                            <p className="location-map-subtitle">
                                Located along Tagaytay–Nasugbu Highway in Laurel, Batangas, the café is easy to access for guests coming from nearby Tagaytay and Batangas destinations.
                            </p>
                        </div>
                        <div className="location-map-frame-wrap">
                            <iframe
                                title="Google Maps showing VHermosa Café location"
                                src="https://maps.google.com/maps?q=130%20Tagaytay%20-%20Nasugbu%20Hwy,%20Laurel,%20Batangas,%204221&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                width="100%"
                                height="450"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>
                </section>

                {/* 4. GALLERY / SECONDARY IMAGE FEATURE */}
                <section className="location-gallery-section" aria-labelledby="gallery-heading">
                    <div className="location-info-container">
                        <div className="location-gallery-grid">
                            <div className="location-gallery-visual">
                                <div className="location-gallery-img-wrap">
                                    <img
                                        src={locationImages.feature}
                                        alt="Panoramic interior view of VHermosa Café cozy atmosphere"
                                        className="location-gallery-img"
                                        loading="lazy"
                                    />
                                </div>
                                <span className="location-gallery-caption">A Warm Place to Pause</span>
                            </div>
                            <div className="location-gallery-text">
                                <h2 id="gallery-heading" className="location-gallery-title">A Warm Place to Pause</h2>
                                <p className="location-gallery-desc">
                                    Enjoy a relaxed café atmosphere designed for good food, handcrafted drinks, and meaningful moments.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* 5. FOOTER */}
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
                        <a href="/about" className="about-footer-link">
                            Our Story
                        </a>
                        <a href="/location" className="about-footer-link active-link">
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
                            130 Tagaytay - Nasugbu Hwy,<br />
                            Laurel, Batangas, 4221
                        </p>
                        <p className="about-footer-hours">Mon-Sun: 7am - 5pm</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
