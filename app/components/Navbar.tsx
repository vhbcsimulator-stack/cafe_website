"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on path changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Scroll and hover behavior for menu page
    useEffect(() => {
        if (pathname !== "/menu") {
            setIsHidden(false);
            return;
        }

        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > 50 && currentScrollY > lastScrollY) {
                // Scrolling down - hide main navigation
                setIsHidden(true);
            } else if (currentScrollY === 0) {
                // Scrolled to top - show main navigation
                setIsHidden(false);
            }
            lastScrollY = currentScrollY;
        };

        const handleMouseMove = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (target && target.closest(".menu-category-nav-bar")) {
                setIsHidden(false);
                return;
            }
            if (window.scrollY > 50) {
                if (e.clientY <= 80) {
                    setIsHidden(false);
                } else if (e.clientY > 120 && !isOpen) {
                    setIsHidden(true);
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [pathname, isOpen]);

    // Apply global main-nav-hidden class on document body to sync sticky category nav offset
    useEffect(() => {
        if (isHidden) {
            document.body.classList.add("main-nav-hidden");
        } else {
            document.body.classList.remove("main-nav-hidden");
        }
        return () => {
            document.body.classList.remove("main-nav-hidden");
        };
    }, [isHidden]);

    const handleFocus = () => {
        setIsHidden(false);
    };

    if (!mounted) {
        return null;
    }

    const navLinks = [
        { label: "Home", href: "/" },
        { label: "Menu", href: "/menu" },
        { label: "Our Story", href: "/about" },
        { label: "Location", href: "/location" },
        { label: "Promo", href: "/promo" },
    ];

    const isBannerVisible = pathname !== "/promo";

    return (
        <>
            {isBannerVisible && (
                <div className={`global-promo-banner ${isHidden ? "banner-hidden" : ""}`}>
                    <div className="global-promo-banner-content">
                        <span className="global-promo-banner-badge">Limited Offer</span>
                        <span className="global-promo-banner-text">Only 100 Café Membership slots available.</span>
                        <a href="/promo" className="global-promo-banner-link">
                            Register Now
                        </a>
                    </div>
                </div>
            )}
            <header 
                className={`nav-bar-wrapper ${scrolled ? "scrolled" : ""} ${isHidden ? "nav-hidden" : ""} ${isBannerVisible ? "with-banner" : ""}`}
                onFocus={handleFocus}
            >
            <a href="/" className="nav-logo">
                VHermosa Cafe
            </a>
            
            <nav className="nav-links">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <a 
                            key={link.label} 
                            href={link.href} 
                            className={`nav-link-item ${isActive ? "active" : ""}`}
                        >
                            {link.label}
                        </a>
                    );
                })}
            </nav>

            <a href="/location" className="nav-cta-btn">
                Visit Us
            </a>

            {/* Hamburger button for mobile */}
            <button 
                className={`nav-mobile-toggle ${isOpen ? "open" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Navigation"
            >
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
            </button>

            {/* Mobile drawer */}
            <div className={`nav-mobile-drawer ${isOpen ? "open" : ""}`}>
                <nav className="nav-mobile-links">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <a 
                                key={link.label} 
                                href={link.href} 
                                className={`nav-mobile-link-item ${isActive ? "active" : ""}`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </a>
                        );
                    })}
                    <a 
                        href="/location" 
                        className="nav-mobile-cta-btn"
                        onClick={() => setIsOpen(false)}
                    >
                        Visit Us
                    </a>
                </nav>
            </div>
        </header>
        </>
    );
}
