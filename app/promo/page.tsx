"use client";

import { useEffect, useState, useRef } from "react";

// Image configuration for the Promo page
const promoImages = {
    hero: "/assets/poster.jpeg", // Default visual references
    brandBg: "/assets/bg.png"
};

interface FormErrors {
    firstName?: string;
    lastName?: string;
    mobileNumber?: string;
    email?: string;
    address?: string;
    preferredClaimDate?: string;
    preferredClaimTime?: string;
    membershipQuantity?: string;
    consent?: string;
}

export default function PromoPage() {
    const [mounted, setMounted] = useState(false);
    const [slotsRemaining, setSlotsRemaining] = useState<number | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(true);

    // Form inputs state
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        mobileNumber: "",
        email: "",
        address: "",
        preferredClaimDate: "",
        preferredClaimTime: "Morning (7:00 AM - 11:59 AM)",
        membershipQuantity: 1,
        message: "",
        consentAccuracy: false,
        consentClaim: false,
        consentPrivacy: false
    });

    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [referenceCode, setReferenceCode] = useState("");
    const [submitError, setSubmitError] = useState("");

    // Accordion terms state
    const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setActiveAccordion(activeAccordion === index ? null : index);
    };

    // Get today's date formatted as YYYY-MM-DD for date-picker min attribute
    const getTodayDateString = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };

    // Fetch availability on mount
    const fetchAvailability = async () => {
        try {
            const res = await fetch("/api/promo-register");
            if (res.ok) {
                const data = await res.json();
                setSlotsRemaining(data.slotsRemaining);
            }
        } catch (err) {
            console.error("Failed to load availability:", err);
        } finally {
            setSlotsLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchAvailability();
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
        // Clear field-specific error as user types
        if (formErrors[name as keyof FormErrors]) {
            setFormErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const errors: FormErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // PH Phone formats: 09XXXXXXXXX, +639XXXXXXXXX, 639XXXXXXXXX
        const phPhoneRegex = /^(09|\+639|639)\d{9}$/;

        if (!formData.firstName.trim()) errors.firstName = "Please enter your first name.";
        if (!formData.lastName.trim()) errors.lastName = "Please enter your last name.";
        if (!formData.mobileNumber.trim()) {
            errors.mobileNumber = "Please enter your mobile number.";
        } else if (!phPhoneRegex.test(formData.mobileNumber.replace(/\s/g, ""))) {
            errors.mobileNumber = "Please enter a valid Philippine mobile number (e.g., 09171234567).";
        }

        if (!formData.email.trim()) {
            errors.email = "Please enter your email address.";
        } else if (!emailRegex.test(formData.email.trim())) {
            errors.email = "Please enter a valid email address.";
        }

        if (!formData.address.trim()) errors.address = "Please enter your complete address.";
        if (!formData.preferredClaimDate) errors.preferredClaimDate = "Please select your preferred claiming date.";
        if (!formData.preferredClaimTime) errors.preferredClaimTime = "Please select your preferred claiming time.";

        const qty = Number(formData.membershipQuantity);
        if (isNaN(qty) || qty < 1) {
            errors.membershipQuantity = "Membership quantity must be at least 1.";
        }

        if (!formData.consentAccuracy || !formData.consentClaim || !formData.consentPrivacy) {
            errors.consent = "You must check and agree to all confirmations to register.";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError("");

        if (!validateForm()) {
            // Scroll to the first error
            const firstErrorKey = Object.keys(formErrors)[0];
            if (firstErrorKey) {
                const element = document.getElementsByName(firstErrorKey)[0];
                element?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/promo-register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok) {
                setReferenceCode(data.referenceCode);
                setSubmitSuccess(true);
                // Refresh slot count
                fetchAvailability();
                // Scroll to top of success section
                setTimeout(() => {
                    const successSection = document.getElementById("success-screen");
                    successSection?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 100);
            } else {
                setSubmitError(data.error || "Something went wrong. Please try again.");
            }
        } catch (err) {
            setSubmitError("Failed to connect to the server. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleScrollToForm = (e: React.MouseEvent) => {
        e.preventDefault();
        const target = document.getElementById("register-form-section");
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if (!mounted) {
        return null;
    }

    const isSoldOut = slotsRemaining !== null && slotsRemaining <= 0;

    return (
        <div className="promo-page-container">
            {/* Structured Data (SEO JSON-LD Offer) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Product",
                        "name": "VHermosa Café Membership",
                        "image": promoImages.hero,
                        "description": "One-year VHermosa Café Membership. Enjoy free coffee per day and exclusive member perks.",
                        "offers": {
                            "@type": "Offer",
                            "price": "999",
                            "priceCurrency": "PHP",
                            "availability": isSoldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
                            "seller": {
                                "@type": "CafeOrCoffeeShop",
                                "name": "VHermosa Café"
                            }
                        }
                    })
                }}
            />

            {/* 1. ANNOUNCEMENT BAR */}
            <div className="promo-announcement-bar">
                <div className="promo-announcement-content">
                    <span className="promo-announcement-badge">Limited Offer</span>
                    <span className="promo-announcement-text">Only 100 Café Membership slots available.</span>
                    {!isSoldOut && (
                        <a href="#register-form-section" onClick={handleScrollToForm} className="promo-announcement-cta">
                            Register Now →
                        </a>
                    )}
                </div>
            </div>

            <main className="promo-main-content">
                {/* 2. HERO SECTION */}
                <section className="promo-hero" aria-labelledby="promo-hero-title">
                    <div className="promo-hero-grid">
                        <div className="promo-hero-text-col">
                            <span className="promo-hero-eyebrow">Limited Café Membership Offer</span>
                            <h1 id="promo-hero-title" className="promo-hero-title">
                                Enjoy Free Coffee Every Day for One Year
                            </h1>

                            <div className="promo-hero-price-panel">
                                <span className="promo-hero-price-label">Membership Fee</span>
                                <div className="promo-hero-price-wrap">
                                    <span className="promo-hero-price-currency">₱</span>
                                    <span className="promo-hero-price-val">999</span>
                                    <span className="promo-hero-price-duration">/ year</span>
                                </div>
                            </div>

                            <p className="promo-hero-desc">
                                Become one of only 100 VHermosa Café members and enjoy exclusive benefits created for coffee lovers.
                            </p>

                            <div className="promo-hero-actions">
                                {!isSoldOut ? (
                                    <a
                                        href="#register-form-section"
                                        onClick={handleScrollToForm}
                                        className="promo-hero-primary-btn"
                                    >
                                        Register for Membership
                                    </a>
                                ) : (
                                    <button className="promo-hero-primary-btn disabled" disabled>
                                        Slots Filled
                                    </button>
                                )}
                                <a href="#perks-section" className="promo-hero-secondary-btn">
                                    See Member Perks
                                </a>
                            </div>

                            <p className="promo-hero-trust-note">
                                * Voucher or membership card must be claimed personally at VHermosa Café after registration confirmation.
                            </p>
                        </div>

                        <div className="promo-hero-visual-col">
                            <div className="promo-hero-img-container">
                                <img
                                    src={promoImages.hero}
                                    alt="VHermosa Café Membership promotion featuring a cup of coffee and a limited offer for 100 members"
                                    className="promo-hero-img"
                                />
                                <div className="promo-badge-floating">
                                    <span className="promo-badge-number">100</span>
                                    <span className="promo-badge-lbl">Members Only</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. MEMBERSHIP OFFER SUMMARY */}
                <section className="promo-summary-section">
                    <div className="promo-container">
                        {/* Live Slot Status Panel */}
                        <div className="promo-status-panel">
                            {slotsLoading ? (
                                <p className="promo-status-text loading">Checking slot availability...</p>
                            ) : isSoldOut ? (
                                <p className="promo-status-text sold-out">The first 100 membership slots have been filled.</p>
                            ) : (
                                <p className="promo-status-text active">
                                    Membership registration is currently open.
                                    {slotsRemaining !== null && (
                                        <strong className="promo-status-highlight"> {slotsRemaining} slots remaining!</strong>
                                    )}
                                </p>
                            )}
                        </div>

                        <div className="promo-summary-grid">
                            <div className="promo-summary-card">
                                <div className="promo-summary-icon-wrap">
                                    ₱
                                </div>
                                <h3 className="promo-summary-val">₱999</h3>
                                <p className="promo-summary-label">Membership Fee</p>
                                <p className="promo-summary-sub">One-time payment for a full year of perks</p>
                            </div>

                            <div className="promo-summary-card">
                                <div className="promo-summary-icon-wrap">
                                    1y
                                </div>
                                <h3 className="promo-summary-val">1 Year</h3>
                                <p className="promo-summary-label">Duration</p>
                                <p className="promo-summary-sub">Active for 365 days from confirmation</p>
                            </div>

                            <div className="promo-summary-card">
                                <div className="promo-summary-icon-wrap">
                                    ☕
                                </div>
                                <h3 className="promo-summary-val">Free Coffee</h3>
                                <p className="promo-summary-label">Daily Benefit</p>
                                <p className="promo-summary-sub">Enjoy your free cup of coffee per day</p>
                            </div>

                            <div className="promo-summary-card">
                                <div className="promo-summary-icon-wrap">
                                    👥
                                </div>
                                <h3 className="promo-summary-val">100 Slots</h3>
                                <p className="promo-summary-label">Availability</p>
                                <p className="promo-summary-sub">Strictly limited membership circle</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. EXCLUSIVE MEMBER PERKS */}
                <section id="perks-section" className="promo-perks-section" aria-labelledby="perks-heading">
                    <div className="promo-container">
                        <div className="promo-section-header">
                            <h2 id="perks-heading" className="promo-section-title">Exclusive Member Perks</h2>
                            <p className="promo-section-subtitle">
                                More than a daily coffee—membership gives you access to special café experiences throughout the year.
                            </p>
                        </div>

                        <div className="promo-perks-grid">
                            {/* Perk 1 */}
                            <div className="promo-perk-card">
                                <div className="promo-perk-icon-wrap">
                                    🏷️
                                </div>
                                <h3 className="promo-perk-title">Member Discount</h3>
                                <p className="promo-perk-desc">Exclusive offers and promos</p>
                            </div>

                            {/* Perk 2 */}
                            <div className="promo-perk-card">
                                <div className="promo-perk-icon-wrap">
                                    🎂
                                </div>
                                <h3 className="promo-perk-title">Birthday Treat</h3>
                                <p className="promo-perk-desc">Special surprise just for you</p>
                            </div>

                            {/* Perk 3 */}
                            <div className="promo-perk-card">
                                <div className="promo-perk-icon-wrap">
                                    ⭐
                                </div>
                                <h3 className="promo-perk-title">Priority Access</h3>
                                <p className="promo-perk-desc">Access to new promos and events</p>
                            </div>

                            {/* Perk 4 */}
                            <div className="promo-perk-card">
                                <div className="promo-perk-icon-wrap">
                                    ☕
                                </div>
                                <h3 className="promo-perk-title">Premium Quality Coffee</h3>
                                <p className="promo-perk-desc">Made for coffee lovers</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. HOW REGISTRATION WORKS */}
                <section className="promo-how-section" aria-labelledby="how-heading">
                    <div className="promo-container">
                        <div className="promo-section-header">
                            <h2 id="how-heading" className="promo-section-title">How to Join</h2>
                        </div>

                        <div className="promo-steps-grid">
                            <div className="promo-step-card">
                                <span className="promo-step-num">01</span>
                                <h3 className="promo-step-title">Complete Form</h3>
                                <p className="promo-step-desc">
                                    Provide your correct contact information and submit your membership request.
                                </p>
                            </div>

                            <div className="promo-step-card">
                                <span className="promo-step-num">02</span>
                                <h3 className="promo-step-title">Wait for Confirmation</h3>
                                <p className="promo-step-desc">
                                    VHermosa Café will review your registration and contact you with the next steps.
                                </p>
                            </div>

                            <div className="promo-step-card">
                                <span className="promo-step-num">03</span>
                                <h3 className="promo-step-title">Claim at the Café</h3>
                                <p className="promo-step-desc">
                                    After confirmation, personally visit VHermosa Café to claim your physical voucher or membership card.
                                </p>
                            </div>
                        </div>

                        <div className="promo-how-notice">
                            <p>
                                <strong>Important Note:</strong> Registration alone does not complete the membership. The voucher or membership card must be claimed at VHermosa Café.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 6. REGISTRATION FORM OR SUCCESS SCREEN */}
                <section id="register-form-section" className="promo-form-section" aria-labelledby="form-heading">
                    <div className="promo-form-container">
                        {submitSuccess ? (
                            /* 9. SUCCESS SCREEN */
                            <div id="success-screen" className="promo-success-panel" role="status" aria-live="polite">
                                <div className="promo-success-icon-wrap">
                                    ✓
                                </div>
                                <h2 className="promo-success-title">Registration Request Received</h2>
                                <p className="promo-success-text">
                                    Thank you for registering for the VHermosa Café Membership. Our team will review your submission and contact you with confirmation and instructions for claiming your voucher or membership card at VHermosa Café.
                                </p>
                                {referenceCode && (
                                    <div className="promo-success-reference">
                                        <span className="ref-label">Registration Reference:</span>
                                        <strong className="ref-code">{referenceCode}</strong>
                                    </div>
                                )}
                                <div className="promo-success-reminder">
                                    <p><strong>Reminder:</strong> Please do not visit to claim the card until you receive confirmation from VHermosa Café.</p>
                                </div>
                                <div className="promo-success-actions">
                                    <a href="/" className="promo-success-btn-primary">Return to Home</a>
                                    <a href="/menu" className="promo-success-btn-secondary">View Menu</a>
                                </div>
                            </div>
                        ) : (
                            /* REGISTRATION FORM */
                            <>
                                <div className="promo-form-header">
                                    <h2 id="form-heading" className="promo-form-section-title">Register for Café Membership</h2>
                                    <p className="promo-form-section-subtitle">
                                        Complete the form below to request your one-year VHermosa Café Membership.
                                    </p>
                                </div>

                                {isSoldOut ? (
                                    <div className="promo-sold-out-alert">
                                        <p><strong>Registrations Closed:</strong> The first 100 membership slots have been filled. We are no longer accepting new registration requests.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleFormSubmit} className="promo-registration-form">
                                        {submitError && (
                                            <div className="promo-submit-error-alert" role="alert">
                                                {submitError}
                                            </div>
                                        )}

                                        <div className="promo-form-row">
                                            <div className="promo-form-group">
                                                <label htmlFor="firstName" className="promo-field-label">First Name *</label>
                                                <input
                                                    id="firstName"
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    className={`promo-input-field ${formErrors.firstName ? "input-error" : ""}`}
                                                    placeholder="First Name"
                                                    disabled={isSubmitting}
                                                />
                                                {formErrors.firstName && <span className="field-error-msg">{formErrors.firstName}</span>}
                                            </div>

                                            <div className="promo-form-group">
                                                <label htmlFor="lastName" className="promo-field-label">Last Name *</label>
                                                <input
                                                    id="lastName"
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    className={`promo-input-field ${formErrors.lastName ? "input-error" : ""}`}
                                                    placeholder="Last Name"
                                                    disabled={isSubmitting}
                                                />
                                                {formErrors.lastName && <span className="field-error-msg">{formErrors.lastName}</span>}
                                            </div>
                                        </div>

                                        <div className="promo-form-row">
                                            <div className="promo-form-group">
                                                <label htmlFor="mobileNumber" className="promo-field-label">Mobile Number *</label>
                                                <input
                                                    id="mobileNumber"
                                                    type="tel"
                                                    name="mobileNumber"
                                                    value={formData.mobileNumber}
                                                    onChange={handleInputChange}
                                                    className={`promo-input-field ${formErrors.mobileNumber ? "input-error" : ""}`}
                                                    placeholder="e.g., 09171234567"
                                                    disabled={isSubmitting}
                                                />
                                                {formErrors.mobileNumber && <span className="field-error-msg">{formErrors.mobileNumber}</span>}
                                            </div>

                                            <div className="promo-form-group">
                                                <label htmlFor="email" className="promo-field-label">Email Address *</label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className={`promo-input-field ${formErrors.email ? "input-error" : ""}`}
                                                    placeholder="your.email@example.com"
                                                    disabled={isSubmitting}
                                                />
                                                {formErrors.email && <span className="field-error-msg">{formErrors.email}</span>}
                                            </div>
                                        </div>

                                        <div className="promo-form-group">
                                            <label htmlFor="address" className="promo-field-label">Complete Address *</label>
                                            <input
                                                id="address"
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className={`promo-input-field ${formErrors.address ? "input-error" : ""}`}
                                                placeholder="Street, Barangay, City, Province"
                                                disabled={isSubmitting}
                                            />
                                            {formErrors.address && <span className="field-error-msg">{formErrors.address}</span>}
                                        </div>

                                        <div className="promo-form-row">
                                            <div className="promo-form-group">
                                                <label htmlFor="preferredClaimDate" className="promo-field-label">Preferred Claiming Date *</label>
                                                <input
                                                    id="preferredClaimDate"
                                                    type="date"
                                                    name="preferredClaimDate"
                                                    min={getTodayDateString()}
                                                    value={formData.preferredClaimDate}
                                                    onChange={handleInputChange}
                                                    className={`promo-input-field ${formErrors.preferredClaimDate ? "input-error" : ""}`}
                                                    disabled={isSubmitting}
                                                />
                                                {formErrors.preferredClaimDate && <span className="field-error-msg">{formErrors.preferredClaimDate}</span>}
                                            </div>

                                            <div className="promo-form-group">
                                                <label htmlFor="preferredClaimTime" className="promo-field-label">Preferred Claiming Time *</label>
                                                <select
                                                    id="preferredClaimTime"
                                                    name="preferredClaimTime"
                                                    value={formData.preferredClaimTime}
                                                    onChange={handleInputChange}
                                                    className="promo-select-field"
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="Morning (7:00 AM - 11:59 AM)">Morning (7:00 AM - 11:59 AM)</option>
                                                    <option value="Afternoon (12:00 PM - 5:00 PM)">Afternoon (12:00 PM - 5:00 PM)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="promo-form-row">
                                            <div className="promo-form-group">
                                                <label htmlFor="membershipQuantity" className="promo-field-label">Number of Memberships *</label>
                                                <input
                                                    id="membershipQuantity"
                                                    type="number"
                                                    name="membershipQuantity"
                                                    min="1"
                                                    value={formData.membershipQuantity}
                                                    onChange={handleInputChange}
                                                    className={`promo-input-field ${formErrors.membershipQuantity ? "input-error" : ""}`}
                                                    disabled={isSubmitting}
                                                />
                                                {formErrors.membershipQuantity && <span className="field-error-msg">{formErrors.membershipQuantity}</span>}
                                            </div>
                                        </div>

                                        <div className="promo-form-group">
                                            <label htmlFor="message" className="promo-field-label">Message or Special Request</label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                className="promo-textarea-field"
                                                placeholder="Any additional messages or questions..."
                                                rows={4}
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        {/* Consent Agreements */}
                                        <div className="promo-consents-container">
                                            <div className="promo-consent-group">
                                                <input
                                                    id="consentAccuracy"
                                                    type="checkbox"
                                                    name="consentAccuracy"
                                                    checked={formData.consentAccuracy}
                                                    onChange={handleInputChange}
                                                    className="promo-checkbox"
                                                    disabled={isSubmitting}
                                                />
                                                <label htmlFor="consentAccuracy" className="promo-consent-lbl">
                                                    I confirm that the information I provided is correct. *
                                                </label>
                                            </div>

                                            <div className="promo-consent-group">
                                                <input
                                                    id="consentClaim"
                                                    type="checkbox"
                                                    name="consentClaim"
                                                    checked={formData.consentClaim}
                                                    onChange={handleInputChange}
                                                    className="promo-checkbox"
                                                    disabled={isSubmitting}
                                                />
                                                <label htmlFor="consentClaim" className="promo-consent-lbl">
                                                    I understand that the voucher or membership card must be personally claimed at VHermosa Café after registration confirmation. *
                                                </label>
                                            </div>

                                            <div className="promo-consent-group">
                                                <input
                                                    id="consentPrivacy"
                                                    type="checkbox"
                                                    name="consentPrivacy"
                                                    checked={formData.consentPrivacy}
                                                    onChange={handleInputChange}
                                                    className="promo-checkbox"
                                                    disabled={isSubmitting}
                                                />
                                                <label htmlFor="consentPrivacy" className="promo-consent-lbl">
                                                    I agree that VHermosa Café may use my submitted information to process my membership registration and contact me regarding this promotion. *
                                                </label>
                                            </div>
                                            {formErrors.consent && <span className="field-error-msg">{formErrors.consent}</span>}
                                        </div>

                                        <div className="promo-form-actions">
                                            <button
                                                type="submit"
                                                className="promo-form-submit-btn"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? "Processing..." : "Submit Membership Registration"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </>
                        )}
                    </div>
                </section>

                {/* 10. MEMBERSHIP CARD CLAIMING REMINDER */}
                <section className="promo-claim-section" aria-labelledby="claim-heading">
                    <div className="promo-container">
                        <div className="promo-claim-card">
                            <div className="promo-claim-icon-wrap">
                                📍
                            </div>
                            <h2 id="claim-heading" className="promo-claim-title">Claim Your Voucher Card at VHermosa Café</h2>
                            <p className="promo-claim-desc">
                                After your registration has been reviewed and confirmed, visit VHermosa Café personally to claim your physical voucher or membership card.
                            </p>
                            <div className="promo-claim-details">
                                <p className="promo-claim-addr">
                                    <strong>Location:</strong> 130 Tagaytay - Nasugbu Hwy, Laurel, Batangas, 4221
                                </p>
                            </div>
                            <div className="promo-claim-actions">
                                <a
                                    href="/location"
                                    className="promo-claim-btn-primary"
                                >
                                    Get Directions
                                </a>
                                <a
                                    href="tel:+639171277112"
                                    className="promo-claim-btn-secondary"
                                >
                                    Call Café
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 11. PROMOTION TERMS SECTION */}
                <section className="promo-terms-section" aria-labelledby="terms-heading">
                    <div className="promo-container">
                        <h2 id="terms-heading" className="promo-terms-title">Important Membership Information</h2>

                        <div className="promo-accordion">
                            {/* Accordion Item 1 */}
                            <div className="promo-accordion-item">
                                <button
                                    onClick={() => toggleAccordion(0)}
                                    className="promo-accordion-trigger"
                                    aria-expanded={activeAccordion === 0}
                                >
                                    <span>What is the membership fee and duration?</span>
                                    <span className="accordion-icon">{activeAccordion === 0 ? "−" : "+"}</span>
                                </button>
                                <div className={`promo-accordion-panel ${activeAccordion === 0 ? "expanded" : ""}`}>
                                    <p>The VHermosa Café Membership fee is ₱999. The membership is active for a duration of one year (365 days) from the date of official registration confirmation.</p>
                                </div>
                            </div>

                            {/* Accordion Item 2 */}
                            <div className="promo-accordion-item">
                                <button
                                    onClick={() => toggleAccordion(1)}
                                    className="promo-accordion-trigger"
                                    aria-expanded={activeAccordion === 1}
                                >
                                    <span>How does the free coffee benefit work?</span>
                                    <span className="accordion-icon">{activeAccordion === 1 ? "−" : "+"}</span>
                                </button>
                                <div className={`promo-accordion-panel ${activeAccordion === 1 ? "expanded" : ""}`}>
                                    <p>Members receive free coffee per day, subject to the official redemption mechanics. Complete membership mechanics and redemption terms will be confirmed by VHermosa Café upon registration or card claiming.</p>
                                </div>
                            </div>

                            {/* Accordion Item 3 */}
                            <div className="promo-accordion-item">
                                <button
                                    onClick={() => toggleAccordion(2)}
                                    className="promo-accordion-trigger"
                                    aria-expanded={activeAccordion === 2}
                                >
                                    <span>Is the membership limit strict?</span>
                                    <span className="accordion-icon">{activeAccordion === 2 ? "−" : "+"}</span>
                                </button>
                                <div className={`promo-accordion-panel ${activeAccordion === 2 ? "expanded" : ""}`}>
                                    <p>Yes. The promotion is strictly limited to 100 registered members. Registrations are subject to availability and confirmation by VHermosa Café.</p>
                                </div>
                            </div>

                            {/* Accordion Item 4 */}
                            <div className="promo-accordion-item">
                                <button
                                    onClick={() => toggleAccordion(3)}
                                    className="promo-accordion-trigger"
                                    aria-expanded={activeAccordion === 3}
                                >
                                    <span>How do I claim my physical card?</span>
                                    <span className="accordion-icon">{activeAccordion === 3 ? "−" : "+"}</span>
                                </button>
                                <div className={`promo-accordion-panel ${activeAccordion === 3 ? "expanded" : ""}`}>
                                    <p>The voucher or membership card must be claimed personally at VHermosa Café after confirmation. Registration is subject to review and confirmation by VHermosa Café.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 12. BRAND MESSAGE SECTION */}
                <section className="promo-brand-divider" style={{ backgroundImage: `linear-gradient(rgba(47, 19, 11, 0.85), rgba(47, 19, 11, 0.95)), url(${promoImages.brandBg})` }}>
                    <div className="promo-brand-content">
                        <span className="promo-brand-eyebrow">VHermosa Café Values</span>
                        <h2 className="promo-brand-title">Great Coffee. Great Community. Brighter Days.</h2>
                        <p className="promo-brand-text">
                            Join a community created for people who appreciate good coffee, meaningful moments, and everyday reasons to smile.
                        </p>
                    </div>
                </section>

                {/* 13. FINAL CALL TO ACTION */}
                <section className="promo-final-cta-section" aria-labelledby="final-cta-heading">
                    <div className="promo-cta-box">
                        <h2 id="final-cta-heading" className="promo-final-cta-title">Be One of the First 100 Members</h2>
                        <p className="promo-final-cta-desc">
                            Register today for the VHermosa Café Membership and take the first step toward enjoying your free coffee benefit and exclusive member perks.
                        </p>
                        <div className="promo-final-cta-actions">
                            {!isSoldOut ? (
                                <a
                                    href="#register-form-section"
                                    onClick={handleScrollToForm}
                                    className="promo-final-cta-btn-primary"
                                >
                                    Register Now
                                </a>
                            ) : (
                                <button className="promo-final-cta-btn-primary disabled" disabled>
                                    Registrations Closed
                                </button>
                            )}
                            <a href="#perks-section" className="promo-final-cta-btn-secondary">
                                View Membership Details
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            {/* 14. FOOTER */}
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
                        <a href="/location" className="about-footer-link">
                            Locations
                        </a>
                        <a href="/promo" className="about-footer-link active-link">
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
