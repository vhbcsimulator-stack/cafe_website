"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import menuDataJson from "../menu.json";

// TypeScript Interfaces
interface MenuItem {
    name: string;
    price: number;
    category: string;
    shortDescription: string;
}

interface MenuCategory {
    id: string;
    name: string;
    description?: string;
    items: MenuItem[];
}

interface MenuData {
    brand: {
        name: string;
        currency: string;
        currencySymbol: string;
    };
    categories: MenuCategory[];
}

const menuData = menuDataJson as MenuData;

// Slugify helper to map images or generate fallbacks
const getSlug = (name: string) => {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
};

// Image mapping for available assets
const menuImageMap: Record<string, string> = {
    // Hot Coffee
    "americano": "assets/hot-americano.jpeg",
    "cafe-latte": "assets/hot-cafe-latte.jpeg",
    "caramel-macchiato": "assets/hot-caramel-macchiato.jpeg",
    "spanish-latte": "assets/hot-spanish-latte.jpeg",
    "hazelnut-mocha-latte": "assets/hot-hazelnut-mocha-latte.jpeg",
    "vanilla-latte": "assets/hot-vanilla-latte.jpeg",
    "white-mocha-latte": "assets/hot-white-mocha-latte.jpeg",
    "strawberry-mocha": "assets/hot-strawberry-mocha.jpeg",
    "rock-salt-latte": "assets/hot-rock-salt-latte.jpeg",
    "biscoff-latte": "assets/hot-biscoff-latte.jpeg",

    // Iced Coffee
    "iced-americano": "assets/iced-americano.jpeg",
    "iced-cafe-latte": "/assets/iced-cafe-latte.jpeg",
    "iced-caramel-macchiato": "/assets/iced-caramel-macchiato.jpeg",
    "iced-spanish-latte": "/assets/iced-spanish-latte.jpeg",
    "iced-hazelnut-mocha-latte": "/assets/iced-hazelnut-mocha-latte.jpeg",
    "iced-vanilla-latte": "/assets/iced-vanilla-latte.jpeg",
    "iced-white-mocha-latte": "assets/iced-white-mocha-latte.jpeg",
    "iced-strawberry-mocha": "assets/iced-strawberry-mocha.jpeg",
    "iced-rock-salt-latte": "assets/iced-rock-salt-latte.jpeg",
    "iced-biscoff-latte": "assets/iced-biscoff-latte.jpeg",

    // Non-Coffee
    "signature-hot-choco": "assets/signature-hot-choco.jpeg",
    "signature-iced-choco": "assets/signature-iced-choco.jpeg",
    "white-chocolate": "assets/white-choco.jpeg",
    "matcha-latte": "assets/matcha-latte.jpeg",
    "iced-strawberry-milk": "assets/iced-strawberry-milk.jpeg",
    "iced-matcha-peanut-butter": "assets/iced-matcha-peanut-butter.jpeg",

    // Frappe Drinks
    "java-chip": "assets/java-chip.jpeg",
    "chocolate": "assets/chocolate.jpeg",
    "salted-caramel-cream-cheese": "assets/salted-caramel-cream-cheese.jpeg",
    "strawberry-frappe": "assets/strawberry-frappe.jpeg",
    "strawberry-cream-cheese": "assets/strawberry-cream-cheese.jpeg",

    // Pasta
    "chicken-pesto": "assets/chicken-pesto.jpeg",
    "seafood-marinara": "assets/marinara-seafood.jpeg",
    "beef-bolognese": "assets/beef-bologne.jpeg",

    // Burgers
    "juicy-beef-burger": "assets/burger.jpeg"
};

// Fallback category icon graphics (returns SVG markup based on category ID)
const getFallbackIcon = (categoryId: string) => {
    switch (categoryId) {
        case "hot-coffee":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                    <path d="M2 21h18v-2H2v2M20 8h-2V5h2v3M4 19h12v-4H4v4m0-6h12V5H4v8m16-5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-4v7h4M2 8h1v3H2V8z" />
                </svg>
            );
        case "iced-coffee":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                    <path d="M8 2h8v2H8V2M5 6h14l-1.5 14.5c-.1.9-.9 1.5-1.8 1.5H8.3c-.9 0-1.7-.6-1.8-1.5L5 6m3 4v8h2v-8H8m4 0v8h2v-8h-2z" />
                </svg>
            );
        case "non-coffee":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                    <path d="M2 21h18v-2H2v2M6 19h10V9H6v10m12-7h1v4h-1v-4m0-5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-3v7h3M6 7h10V5H6v2z" />
                </svg>
            );
        case "frappe-drinks":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                    <path d="M12 2C8.69 2 6 4.69 6 8v1h12V8c0-3.31-2.69-6-6-6m-4 9h8v9H8v-9m9.5 0c-.83 0-1.5-.67-1.5-1.5V9h2v.5c0 .83-.67 1.5-1.5 1.5z" />
                </svg>
            );
        case "pasta":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
            );
        case "burgers":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                    <path d="M12 2C8.69 2 6 4.69 6 8v1h12V8c0-3.31-2.69-6-6-6m-9 10h18v2H3v-2m1 4h16c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2z" />
                </svg>
            );
        default:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z" />
                </svg>
            );
    }
};

export default function MenuPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("");
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [isMenuNavSticky, setIsMenuNavSticky] = useState(false);

    const isScrollingRef = useRef(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const modalCloseBtnRef = useRef<HTMLButtonElement | null>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    // Dynamic category offset for header spacing
    const CATEGORY_OFFSET = 110;

    // Currency Formatter
    const phpFormatter = useMemo(() => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }, []);

    // Extract Featured items dynamically
    const featuredItems = useMemo(() => {
        const found: MenuItem[] = [];
        const seenNames = new Set<string>();

        for (const cat of menuData.categories) {
            for (const item of cat.items) {
                const isIcedCafeLatte = item.name === "Café Latte" && item.category === "Iced Coffee";
                const isChickenPesto = item.name === "Chicken Pesto";
                const isBeefBurger = item.name === "Juicy Beef Burger";

                if ((isIcedCafeLatte || isChickenPesto || isBeefBurger) && !seenNames.has(item.name)) {
                    found.push(item);
                    seenNames.add(item.name);
                }
            }
        }
        return found;
    }, []);

    // Filter items based on search query
    const filteredCategories = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return menuData.categories;

        return menuData.categories
            .map((cat) => {
                const matchedItems = cat.items.filter(
                    (item) =>
                        item.name.toLowerCase().includes(query) ||
                        item.category.toLowerCase().includes(query) ||
                        item.shortDescription.toLowerCase().includes(query)
                );
                return { ...cat, items: matchedItems };
            })
            .filter((cat) => cat.items.length > 0);
    }, [searchQuery]);

    // Total matched item count
    const totalMatchCount = useMemo(() => {
        return filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0);
    }, [filteredCategories]);

    // Split categories into Drinks vs Food for the editorial divider
    const beverageCategories = useMemo(() => {
        return filteredCategories.filter(cat =>
            ["hot-coffee", "iced-coffee", "non-coffee", "frappe-drinks"].includes(cat.id)
        );
    }, [filteredCategories]);

    const foodCategories = useMemo(() => {
        return filteredCategories.filter(cat =>
            ["pasta", "burgers"].includes(cat.id)
        );
    }, [filteredCategories]);

    // Sticky Category bar state
    useEffect(() => {
        const handleScroll = () => {
            const navBarEl = document.querySelector(".menu-category-nav-wrapper");
            if (navBarEl) {
                const rect = navBarEl.getBoundingClientRect();
                setIsMenuNavSticky(rect.top <= 96); // offset by header height
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Intersection Observer for scrollspy category tabs
    useEffect(() => {
        if (isScrollingRef.current) return;

        const observerOptions = {
            root: null,
            rootMargin: `-${CATEGORY_OFFSET}px 0px -60% 0px`,
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            if (isScrollingRef.current) return;

            // Find the first intersecting category section
            const visibleEntry = entries.find((entry) => entry.isIntersecting);
            if (visibleEntry) {
                setActiveCategory(visibleEntry.target.id);
            }
        }, observerOptions);

        menuData.categories.forEach((cat) => {
            const el = document.getElementById(cat.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [filteredCategories]);

    // Handle Scroll Spy navigation click
    const handleCategoryClick = (id: string) => {
        const targetElement = document.getElementById(id);
        if (!targetElement) return;

        // Temporarily disable the Intersection Observer during smooth scroll
        isScrollingRef.current = true;
        setActiveCategory(id);

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

        const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
            top: elementPosition - CATEGORY_OFFSET,
            behavior: "smooth"
        });

        scrollTimeoutRef.current = setTimeout(() => {
            isScrollingRef.current = false;
        }, 800);
    };

    // Modal Interaction Functions
    const openModal = (item: MenuItem) => {
        previousFocusRef.current = document.activeElement as HTMLElement;
        setSelectedItem(item);
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        setSelectedItem(null);
        document.body.style.overflow = "";
        if (previousFocusRef.current) {
            previousFocusRef.current.focus();
        }
    };

    // Close Modal on Esc Key and Focus Trap
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedItem) return;
            if (e.key === "Escape") {
                closeModal();
            }
            if (e.key === "Tab") {
                // Focus trap logic
                const modalEl = document.querySelector(".menu-item-modal-dialog");
                if (modalEl) {
                    const focusables = modalEl.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex="0"]'
                    );
                    const firstEl = focusables[0] as HTMLElement;
                    const lastEl = focusables[focusables.length - 1] as HTMLElement;

                    if (e.shiftKey && document.activeElement === firstEl) {
                        lastEl.focus();
                        e.preventDefault();
                    } else if (!e.shiftKey && document.activeElement === lastEl) {
                        firstEl.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        if (selectedItem && modalCloseBtnRef.current) {
            modalCloseBtnRef.current.focus();
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedItem]);

    // Sub-component: Menu Item Card
    const MenuItemCard = ({ item, isFeatured = false }: { item: MenuItem; isFeatured?: boolean }) => {
        const slug = getSlug(item.name);
        const hasIced = item.category.toLowerCase().includes("iced");
        const matchingKey = hasIced ? `iced-${slug}` : slug;
        const imageSrc = menuImageMap[matchingKey] || menuImageMap[slug];

        return (
            <div
                className={`menu-item-card ${isFeatured ? "featured-card" : ""}`}
                onClick={() => openModal(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openModal(item);
                    }
                }}
            >
                {/* Image Section */}
                <div className="menu-card-image-wrap">
                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt={item.name}
                            className="menu-card-img"
                            loading="lazy"
                        />
                    ) : (
                        <div className="menu-card-fallback-graphic" aria-hidden="true">
                            <div className="menu-fallback-icon">
                                {getFallbackIcon(getSlug(item.category))}
                            </div>
                            <span className="menu-fallback-bg-letter">
                                {item.name.charAt(0)}
                            </span>
                        </div>
                    )}
                    {isFeatured && <span className="menu-card-badge">Café Favorite</span>}
                </div>

                {/* Content Section */}
                <div className="menu-card-content">
                    <div className="menu-card-header">
                        <h3 className="menu-card-title">{item.name}</h3>
                        <span className="menu-card-price">{phpFormatter.format(item.price)}</span>
                    </div>
                    <p className="menu-card-desc">{item.shortDescription}</p>
                    <span className="menu-card-category-tag">{item.category}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="menu-page-container">
            {/* 1. Hero Section */}
            <section className="menu-hero">
                <div className="menu-hero-overlay" />
                <div className="menu-hero-content">
                    <p className="menu-hero-eyebrow">VHermosa Café</p>
                    <h1 className="menu-hero-title">Crafted for Every Craving</h1>
                    <p className="menu-hero-desc">
                        From carefully prepared coffee and refreshing frappes to comforting pasta and satisfying meals,
                        discover flavors made for meaningful moments.
                    </p>
                    <button
                        className="menu-hero-primary-btn"
                        onClick={() => {
                            const target = document.getElementById("menu-section-start");
                            if (target) {
                                target.scrollIntoView({ behavior: "smooth", block: "start" });
                            }
                        }}
                    >
                        View Our Menu
                    </button>
                </div>
            </section>

            {/* Content Start Reference Node */}
            <div id="menu-section-start" />

            {/* 2. Sticky Category Navigation & Search */}
            <div className="menu-category-nav-wrapper">
                <div className={`menu-category-nav-bar ${isMenuNavSticky ? "sticky" : ""}`}>
                    <div className="menu-category-nav-container">
                        <div className="menu-category-scroll-container">
                            {menuData.categories.map((cat) => {
                                const isCategoryActive = activeCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        className={`menu-category-tab ${isCategoryActive ? "active" : ""}`}
                                        onClick={() => handleCategoryClick(cat.id)}
                                        aria-selected={isCategoryActive}
                                        role="tab"
                                    >
                                        {cat.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Search Bar Area */}
            <section className="menu-search-section">
                <div className="menu-search-wrapper">
                    <div className="menu-search-input-container">
                        <span className="menu-search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search coffee, pasta, drinks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search coffee, pasta, drinks"
                            className="menu-search-input"
                        />
                        {searchQuery && (
                            <button
                                className="menu-search-clear-btn"
                                onClick={() => setSearchQuery("")}
                                aria-label="Clear Search"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <p className="menu-search-result-count" role="status">
                            {totalMatchCount === 0
                                ? "No items match your search"
                                : `Found ${totalMatchCount} matching ${totalMatchCount === 1 ? "item" : "items"}`
                            }
                        </p>
                    )}
                </div>
            </section>

            {/* 4. Featured Menu Area (Hidden when searching) */}
            {!searchQuery && featuredItems.length > 0 && (
                <section className="menu-featured-section">
                    <div className="menu-section-title-wrap">
                        <span className="menu-section-kicker">Chef's Specials</span>
                        <h2 className="menu-section-heading">Featured Favorites</h2>
                        <div className="menu-section-accent-line" />
                    </div>
                    <div className="menu-featured-grid">
                        {featuredItems.map((item, index) => (
                            <MenuItemCard key={`featured-${index}`} item={item} isFeatured={true} />
                        ))}
                    </div>
                </section>
            )}

            {/* 5. Dynamic Categories Grid */}
            <div className="menu-main-content">
                {totalMatchCount === 0 ? (
                    <div className="menu-empty-state">
                        <div className="menu-empty-state-icon">☕</div>
                        <h3 className="menu-empty-state-title">No items found</h3>
                        <p className="menu-empty-state-desc">
                            We couldn't find any menu items matching "{searchQuery}". Try adjusting your search keywords!
                        </p>
                        <button className="menu-empty-state-reset-btn" onClick={() => setSearchQuery("")}>
                            Reset Search
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Beverages Categories */}
                        {beverageCategories.length > 0 && (
                            <div className="menu-beverages-wrapper">
                                {beverageCategories.map((category) => (
                                    <section key={category.id} id={category.id} className="menu-category-section">
                                        <div className="menu-category-header">
                                            <h2 className="menu-category-title">
                                                {category.name}
                                                <span className="menu-category-count">({category.items.length})</span>
                                            </h2>
                                            {category.description && (
                                                <p className="menu-category-description">{category.description}</p>
                                            )}
                                        </div>
                                        <div className="menu-items-grid">
                                            {category.items.map((item, index) => (
                                                <MenuItemCard key={`${category.id}-${index}`} item={item} />
                                            ))}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        )}

                        {/* 9. Brand Story Divider (Rendered between Beverages and Foods if both are visible) */}
                        {!searchQuery && beverageCategories.length > 0 && foodCategories.length > 0 && (
                            <section className="brand-story-divider">
                                <div className="brand-story-divider-overlay" />
                                <div className="brand-story-divider-content">
                                    <h3 className="brand-story-divider-title">Coffee First. Comfort Always.</h3>
                                    <p className="brand-story-divider-text">
                                        At VHermosa Café, every cup and plate is prepared to make ordinary moments feel a little more special.
                                    </p>
                                </div>
                            </section>
                        )}

                        {/* Food Categories */}
                        {foodCategories.length > 0 && (
                            <div className="menu-food-wrapper">
                                {foodCategories.map((category) => (
                                    <section key={category.id} id={category.id} className="menu-category-section">
                                        <div className="menu-category-header">
                                            <h2 className="menu-category-title">
                                                {category.name}
                                                <span className="menu-category-count">({category.items.length})</span>
                                            </h2>
                                            {category.description && (
                                                <p className="menu-category-description">{category.description}</p>
                                            )}
                                        </div>
                                        <div className="menu-items-grid">
                                            {category.items.map((item, index) => (
                                                <MenuItemCard key={`${category.id}-${index}`} item={item} />
                                            ))}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* 8. Item Detail Modal Dialog */}
            {selectedItem && (
                <div
                    className="menu-item-modal-overlay"
                    onClick={closeModal}
                    role="presentation"
                >
                    <div
                        className="menu-item-modal-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Image Header */}
                        <div className="menu-modal-image-container">
                            {(() => {
                                const slug = getSlug(selectedItem.name);
                                const hasIced = selectedItem.category.toLowerCase().includes("iced");
                                const matchingKey = hasIced ? `iced-${slug}` : slug;
                                const imageSrc = menuImageMap[matchingKey] || menuImageMap[slug];

                                return imageSrc ? (
                                    <img
                                        src={imageSrc}
                                        alt={selectedItem.name}
                                        className="menu-modal-img"
                                    />
                                ) : (
                                    <div className="menu-modal-fallback-graphic">
                                        <div className="menu-modal-fallback-icon">
                                            {getFallbackIcon(getSlug(selectedItem.category))}
                                        </div>
                                        <span className="menu-modal-fallback-bg-letter">
                                            {selectedItem.name.charAt(0)}
                                        </span>
                                    </div>
                                );
                            })()}

                            {/* Close Button */}
                            <button
                                ref={modalCloseBtnRef}
                                className="menu-modal-close-btn"
                                onClick={closeModal}
                                aria-label="Close details"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body Info */}
                        <div className="menu-modal-body">
                            <span className="menu-modal-category-tag">{selectedItem.category}</span>
                            <h2 id="modal-title" className="menu-modal-title">
                                {selectedItem.name}
                            </h2>
                            <p className="menu-modal-price">{phpFormatter.format(selectedItem.price)}</p>

                            <div className="menu-modal-divider" />

                            <h4 className="menu-modal-section-subtitle">Description</h4>
                            <p className="menu-modal-desc">{selectedItem.shortDescription}</p>

                            {/* Inquiry CTA */}
                            <a href="/about#contact" className="menu-modal-cta-btn" onClick={closeModal}>
                                Ask About This Item
                            </a>
                        </div>
                    </div>
                </div>
            )}
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
                        <a href="/menu" className="about-footer-link active-link">
                            Menu
                        </a>
                        <a href="/about" className="about-footer-link">
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
