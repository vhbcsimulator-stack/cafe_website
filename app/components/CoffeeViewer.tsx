"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrthographicCamera, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CoffeeMug from "./CoffeeMug";

// Register ScrollTrigger for GSAP scroll-driven animations
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ==========================================
// CONFIGURATION CONSTANTS
// ==========================================
const CUP_O_SCALE = 1.0;
const CUP_Y_OFFSET = 0;
const CUP_FINAL_TILT_X = -70; // Pitch angle so top rim is UP and logo faces viewer
const CUP_FINAL_TILT_Y = 12;  // Slight 3/4 turn
const CUP_FINAL_TILT_Z = 0;   // Keep cup upright (no 180 deg flip)
const CUP_ARC_HEIGHT = 0;

const MENU_ITEMS = [
    {
        id: "01",
        number: "01",
        title: "ICED CAFE\nLATTE",
        flavor: "Espresso · Steamed Milk · Premium Blend",
        image: "/assets/iced-cafe-latte.jpeg",
    },
    {
        id: "02",
        number: "02",
        title: "ICED CARAMEL\nMACCHIATO",
        flavor: "Espresso · Vanilla Syrup · Caramel Drizzle",
        image: "/assets/iced-caramel-macchiato.jpeg",
    },
    {
        id: "03",
        number: "03",
        title: "ICED SPANISH\nLATTE",
        flavor: "Espresso · Sweetened Condense · Velvet Milk",
        image: "/assets/iced-spanish-latte.jpeg",
    },
];

interface MainSceneProps {
    alignment: {
        x: number;
        z: number;
        targetScale: number;
        oHeight: number;
    };
    cupRef: React.RefObject<THREE.Group | null>;
    onModelLoaded: (diameter: number) => void;
    scrollProgress: React.RefObject<{ value: number }>;
}

/**
 * MainScene handles the R3F Canvas components, Orthographic Camera,
 * lights, and real-time scroll mapping inside the useFrame render loop.
 */
function MainScene({ alignment, cupRef, onModelLoaded, scrollProgress }: MainSceneProps) {
    const { size } = useThree();
    const localDiameterRef = useRef<number>(0);

    useFrame(() => {
        if (!cupRef.current || !scrollProgress.current) return;

        const progress = scrollProgress.current.value; // 0 → 4

        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (mediaQuery.matches) {
            // In reduced-motion mode, reset and hide the 3D cup since we fade in the static story visual
            cupRef.current.position.set(alignment.x, 0, alignment.z);
            cupRef.current.scale.setScalar(alignment.targetScale);
            cupRef.current.quaternion.set(0, 0, 0, 1);
            return;
        }

        // ── Phase 1 (0→0.55): brand transition ──────────────────────────────────
        const brandProgress = THREE.MathUtils.clamp(progress / 0.55, 0, 1);
        const eased = THREE.MathUtils.smoothstep(brandProgress, 0, 1);

        // Position: lerp from "O" to center
        const startX = alignment.x;
        const startZ = alignment.z;
        const x0 = THREE.MathUtils.lerp(startX, 0, eased);
        const z0 = THREE.MathUtils.lerp(startZ, 0, eased);

        // Scale: Welcome "O" size -> Hero cup size
        const startScale = alignment.targetScale;
        const finalCupDiameter = THREE.MathUtils.clamp(size.width * 0.16, 150, size.height * 0.32);
        const endScale = localDiameterRef.current
            ? finalCupDiameter / localDiameterRef.current
            : 0.08;

        // ── Quaternion definitions ────────────────────────────────────────────────
        // Start: upright, no tilt (matches flat Welcome "O" appearance)
        const startQuaternion = new THREE.Quaternion(); // identity

        // VHERMOSA base pose: forward-facing, slightly tilted
        const baseEuler = new THREE.Euler(
            THREE.MathUtils.degToRad(CUP_FINAL_TILT_X),
            THREE.MathUtils.degToRad(CUP_FINAL_TILT_Y),
            THREE.MathUtils.degToRad(CUP_FINAL_TILT_Z)
        );
        const baseQuaternion = new THREE.Quaternion().setFromEuler(baseEuler);

        // Menu pose: top-down angled view showing Rosetta Latte Art
        const menuEuler = new THREE.Euler(
            THREE.MathUtils.degToRad(-35),
            THREE.MathUtils.degToRad(15),
            THREE.MathUtils.degToRad(0)
        );
        const menuQuaternion = new THREE.Quaternion().setFromEuler(menuEuler);

        // ── Phase 2 (0.65→0.90): cup moves to lower right, menu view ────────────
        const menuTransition = THREE.MathUtils.clamp((progress - 0.65) / 0.25, 0, 1);
        const menuEased = THREE.MathUtils.smoothstep(menuTransition, 0, 1);

        // ── Phase 3 (3.30→4.00): story handoff (drift to lower left and fade out) ──
        const storyTransition = THREE.MathUtils.clamp((progress - 3.30) / 0.70, 0, 1);
        const storyEased = THREE.MathUtils.smoothstep(storyTransition, 0, 1);

        // 1. Position calculation across timeline
        let currentX = x0;
        let currentZ = z0;
        if (progress > 0.55) {
            const menuX = THREE.MathUtils.lerp(0, size.width * 0.36, menuEased);
            const menuZ = THREE.MathUtils.lerp(0, size.height * 0.30, menuEased);
            currentX = THREE.MathUtils.lerp(menuX, size.width * -0.22, storyEased);
            currentZ = THREE.MathUtils.lerp(menuZ, size.height * 0.20, storyEased);
        }
        cupRef.current.position.set(currentX, 0, currentZ);

        // 2. Continuous rotation calculation with smooth 3-phase chain
        //    Phase A (0 → 0.55): entrance — lerp from identity to base pose
        //    Phase B (0.55 → 0.65): VHERMOSA hold — spin Y continuously
        //    Phase C (0.65 → 0.90): transition to menu view
        let finalQuaternion: THREE.Quaternion;
        if (progress <= 0.55) {
            // Entrance: smoothly tilt from flat to the VHERMOSA base pose
            // Add a gentle spin that goes 0→360° over the entrance range so it arrives
            // facing forward (full circle = same orientation) — pure smooth look
            const entryT = THREE.MathUtils.smoothstep(progress / 0.55, 0, 1);
            const entrySpinAngle = entryT * Math.PI * 2; // full circle during entrance
            const entrySpinQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), entrySpinAngle);
            const entryTargetQ = baseQuaternion.clone().multiply(entrySpinQ);
            finalQuaternion = startQuaternion.clone().slerp(entryTargetQ, entryT);
        } else if (progress <= 0.65) {
            // VHERMOSA hold: cup maintains base pose, keep spinning Y
            // holdT goes 0→1 over (0.55→0.65)
            const holdT = THREE.MathUtils.smoothstep((progress - 0.55) / 0.10, 0, 1);
            const holdSpinAngle = holdT * Math.PI * 2; // additional full rotation during hold
            const holdSpinQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), holdSpinAngle);
            finalQuaternion = baseQuaternion.clone().multiply(holdSpinQ);
        } else {
            // Transition to menu view
            finalQuaternion = new THREE.Quaternion().slerpQuaternions(baseQuaternion, menuQuaternion, menuEased);
        }
        cupRef.current.quaternion.copy(finalQuaternion);

        // 3. Scale calculation across timeline
        const menuCupDiameter = THREE.MathUtils.clamp(size.width * 0.11, 100, size.height * 0.22);
        const menuTargetScale = localDiameterRef.current
            ? menuCupDiameter / localDiameterRef.current
            : 0.06;
        const brandScale = THREE.MathUtils.lerp(startScale, endScale, eased);
        const menuScale = THREE.MathUtils.lerp(brandScale, menuTargetScale, menuEased);
        const finalScale = THREE.MathUtils.lerp(menuScale, menuScale * 0.6, storyEased);
        cupRef.current.scale.setScalar(finalScale);

        // 4. Opacity calculation across timeline
        const cupOpacity = THREE.MathUtils.lerp(1.0, 0.0, storyEased);
        cupRef.current.traverse((child: any) => {
            if (child.isMesh && child.material) {
                child.material.transparent = true;
                child.material.opacity = cupOpacity;
            }
        });
    });

    const handleModelLoaded = (diameter: number) => {
        localDiameterRef.current = diameter;
        onModelLoaded(diameter);
    };

    return (
        <>
            <OrthographicCamera
                makeDefault
                left={-size.width / 2}
                right={size.width / 2}
                top={size.height / 2}
                bottom={-size.height / 2}
                near={0.1}
                far={2000}
                position={[0, 1000, 0]}
                up={[0, 0, -1]}
                rotation={[-Math.PI / 2, 0, 0]}
            />

            {/* === CINEMATIC LIGHT RIG === */}

            {/* Ambient: soft ambient light */}
            <ambientLight intensity={0.7} color="#fff8ee" />

            {/* KEY LIGHT — warm golden key light from upper-front-left */}
            <directionalLight
                position={[-600, 1200, 800]}
                intensity={3.8}
                color="#fff3e0"
                castShadow
            />

            {/* FILL LIGHT — soft cool fill from right side */}
            <directionalLight
                position={[1200, 400, 600]}
                intensity={1.5}
                color="#e8f0fe"
            />

            {/* RIM / BACKLIGHT — edge highlight from behind */}
            <directionalLight
                position={[0, 800, -1200]}
                intensity={2.2}
                color="#ffffff"
            />

            {/* GROUND BOUNCE — warm amber from below */}
            <directionalLight
                position={[0, -800, 200]}
                intensity={0.6}
                color="#c07830"
            />

            {/* ACCENT SPOT — specular pop on glossy ceramic and logo */}
            <pointLight
                position={[0, 900, 300]}
                intensity={1.8}
                color="#fff8e8"
                distance={2500}
                decay={2}
            />

            <Suspense fallback={null}>
                <group ref={cupRef}>
                    <CoffeeMug
                        onLoaded={handleModelLoaded}
                        scrollProgress={scrollProgress}
                        position={[0, 0, 0]}
                        rotation={[0, 0, 0]}
                        scale={1}
                    />
                </group>
                {/* warehouse preset gives rich HDR reflections on ceramic surfaces */}
                <Environment preset="warehouse" environmentIntensity={0.35} />
                <ContactShadows
                    position={[0, -100, 0]}
                    opacity={0.55}
                    scale={500}
                    blur={3.5}
                    far={350}
                    color="#1a0800"
                />
            </Suspense>
        </>
    );
}

function CustomScrollbar() {
    const thumbRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateThumb = () => {
            if (!thumbRef.current) return;
            const docHeight = document.documentElement.scrollHeight;
            const winHeight = window.innerHeight;
            const scrollTop = window.scrollY;

            // Calculate thumb height
            const heightRatio = winHeight / docHeight;
            const thumbHeight = Math.max(winHeight * heightRatio, 40); // min 40px

            // Calculate thumb top position
            const maxScroll = docHeight - winHeight;
            const scrollRatio = maxScroll > 0 ? scrollTop / maxScroll : 0;
            const maxThumbTop = winHeight - thumbHeight - 12; // accounting for vertical padding
            const thumbTop = scrollRatio * maxThumbTop;

            thumbRef.current.style.height = `${thumbHeight}px`;
            thumbRef.current.style.transform = `translateY(${thumbTop}px)`;
        };

        window.addEventListener("scroll", updateThumb);
        window.addEventListener("resize", updateThumb);

        // ResizeObserver to watch document body size changes (e.g. model loads)
        const resizeObserver = new ResizeObserver(() => {
            updateThumb();
        });
        resizeObserver.observe(document.body);

        // Initial run
        updateThumb();

        // Implement drag to scroll
        let isDragging = false;
        let startY = 0;
        let startScrollTop = 0;

        const handleMouseDown = (e: MouseEvent) => {
            isDragging = true;
            startY = e.clientY;
            startScrollTop = window.scrollY;
            document.body.style.userSelect = "none";
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const deltaY = e.clientY - startY;
            const docHeight = document.documentElement.scrollHeight;
            const winHeight = window.innerHeight;
            const maxScroll = docHeight - winHeight;

            const thumbHeight = thumbRef.current ? thumbRef.current.offsetHeight : 0;
            const maxThumbTop = winHeight - thumbHeight - 12;

            const scrollDelta = (deltaY / maxThumbTop) * maxScroll;
            window.scrollTo(0, startScrollTop + scrollDelta);
        };

        const handleMouseUp = () => {
            isDragging = false;
            document.body.style.userSelect = "";
        };

        const thumb = thumbRef.current;
        if (thumb) {
            thumb.addEventListener("mousedown", handleMouseDown);
        }
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("scroll", updateThumb);
            window.removeEventListener("resize", updateThumb);
            resizeObserver.disconnect();
            if (thumb) {
                thumb.removeEventListener("mousedown", handleMouseDown);
            }
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    return (
        <div ref={trackRef} className="custom-scroll-track">
            <div ref={thumbRef} className="custom-scroll-thumb" />
        </div>
    );
}

export default function CoffeeViewer() {
    const oRef = useRef<HTMLSpanElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const cupRef = useRef<THREE.Group>(null);
    const localDiameterRef = useRef<number>(0);

    const [hasLoadedModel, setHasLoadedModel] = useState(false);
    const [isReplaced, setIsReplaced] = useState(false);
    const scrollProgress = useRef({ value: 0 });

    const [alignment, setAlignment] = useState({
        x: 0,
        z: 0,
        targetScale: 0.04,
        oHeight: 0,
    });

    const updateAlignment = () => {
        if (!oRef.current || !canvasRef.current) return;
        const oRect = oRef.current.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const oCenterX = oRect.left + oRect.width / 2;
        const oCenterY = oRect.top + oRect.height / 2;
        const canvasCenterX = canvasRect.left + canvasRect.width / 2;
        const canvasCenterY = canvasRect.top + canvasRect.height / 2;
        const x3d = oCenterX - canvasCenterX;
        const z3d = (oCenterY - canvasCenterY) + CUP_Y_OFFSET;
        const targetScaleVal = localDiameterRef.current
            ? (oRect.width * CUP_O_SCALE) / localDiameterRef.current
            : 0.04;
        setAlignment({ x: x3d, z: z3d, targetScale: targetScaleVal, oHeight: oRect.height });
        setIsReplaced(true);
    };

    const onModelLoaded = (diameter: number) => {
        localDiameterRef.current = diameter;
        setHasLoadedModel(true);
        updateAlignment();
    };

    useEffect(() => {
        if (!hasLoadedModel) return;

        const handleResize = () => {
            updateAlignment();
            ScrollTrigger.refresh();
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("orientationchange", handleResize);

        const observer = new ResizeObserver(() => {
            updateAlignment();
            ScrollTrigger.refresh();
        });
        if (oRef.current) {
            observer.observe(oRef.current);
        }

        // Trigger reflow & recalculation once fonts load
        document.fonts.ready.then(() => {
            updateAlignment();
            ScrollTrigger.refresh();
        });
        updateAlignment();
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("orientationchange", handleResize);
        };
    }, [hasLoadedModel]);

    useEffect(() => {
        if (!hasLoadedModel) return;

        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const hasReducedMotion = mediaQuery.matches;

        if (hasReducedMotion) {
            // Respect reduced motion: clear animated CSS props & set static visible states
            gsap.set(".welcome-letter, .brand-layer, .menu-layer, .story-line, .story-kicker, .story-copy, .story-link, .welcome-scroll-indicator", { clearProps: "all" });
            gsap.set(".story-visual-wrap", { clipPath: "inset(0 0% 0 0)" });
            gsap.set(".menu-drink-image", { opacity: 1 });
            return;
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".coffee-story",
                start: "top top",
                end: "bottom top", // covers unpinning & scrolling phase
                scrub: 0.8,
                invalidateOnRefresh: true,
            },
        });

        // ── SCENE 1 → 2: WELCOME exits (0.12–0.26), VHERMOSA CAFE enters (0.20–0.55) ─
        tl.to(".welcome-scroll-indicator", { opacity: 0, y: 15, duration: 0.12 }, 0.02);
        tl.to(".welcome-letter", { opacity: 0, yPercent: -25, x: (index: number) => (index - 3) * 35, stagger: { each: 0.03, from: "center" }, duration: 0.20 }, 0.12);
        tl.to(".brand-layer", { opacity: 1, duration: 0.08 }, 0.20);
        tl.fromTo(".brand-letter", { opacity: 0, yPercent: 40, scaleY: 1.12, x: (index: number) => (index - 3.5) * -12 }, { opacity: 1, yPercent: 0, scaleY: 1.12, x: 0, stagger: { each: 0.03, from: "center" }, duration: 0.28, ease: "power2.out" }, 0.20);
        tl.fromTo(".cafe-letter", { opacity: 0, yPercent: 30, x: (index: number) => (index - 1.5) * -30 }, { opacity: 1, yPercent: 0, x: 0, stagger: 0.04, duration: 0.22, ease: "power2.out" }, 0.32);

        // Background darkens gradually across the signature drinks timeline
        tl.to(".coffee-story-bg-overlay", { opacity: 0.25, ease: "none", duration: 0.8 }, 0);

        // ── SCENE 2 → 3: VHERMOSA CAFE text exits & cup transitions to next spot (0.65–0.90) ───
        tl.to(".cafe-letter", {
            x: (index: number) => (index - 1.5) * 700,
            opacity: 0,
            stagger: { each: 0.03, from: "center" },
            duration: 0.16,
            ease: "power3.in",
        }, 0.65);
        tl.to(".brand-letter", {
            opacity: 0,
            yPercent: -30,
            stagger: { each: 0.02, from: "center" },
            duration: 0.18,
            ease: "power2.in",
        }, 0.67);
        tl.to(".coffee-story-bg-overlay", { opacity: 0.60, duration: 0.30 }, 0.65);
        tl.to(".menu-layer", { opacity: 1, duration: 0.16 }, 0.85);
        tl.fromTo(".menu-scroll-hint", { opacity: 0 }, { opacity: 1, duration: 0.18 }, 0.95);

        // ── MENU ITEM 01: enters 1.05 → holds → exits 1.70 (AFTER cup finishes moving at 0.90) ──
        tl.fromTo(".menu-item-01 .menu-number",
            { yPercent: 22, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.20, ease: "power2.out" }, 1.05);
        tl.fromTo(".menu-item-01 .menu-drink-title",
            { yPercent: 40, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.22, ease: "power2.out" }, 1.10);
        tl.fromTo(".menu-item-01 .menu-divider",
            { scaleX: 0, opacity: 0 },
            { scaleX: 1, opacity: 1, duration: 0.16, ease: "power2.out", transformOrigin: "left center" }, 1.22);
        tl.fromTo(".menu-item-01 .menu-drink-flavor",
            { yPercent: 20, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.16, ease: "power2.out" }, 1.27);
        tl.fromTo(".menu-item-01 .menu-drink-image",
            { xPercent: 12, opacity: 0 },
            { xPercent: 0, opacity: 1, duration: 0.25, ease: "power2.out" }, 1.10);
        // Exit window: 1.60 – 1.70
        tl.to(".menu-item-01 .menu-number, .menu-item-01 .menu-drink-title, .menu-item-01 .menu-divider, .menu-item-01 .menu-drink-flavor", {
            opacity: 0, yPercent: -22, duration: 0.12, ease: "power2.in",
        }, 1.60);
        tl.to(".menu-item-01 .menu-drink-image", {
            opacity: 0, xPercent: -12, scale: 0.96, duration: 0.12, ease: "power2.in",
        }, 1.60);

        // ── MENU ITEM 02: enters 1.80 → holds → exits 2.45 ─────────────────────
        tl.fromTo(".menu-item-02 .menu-number",
            { yPercent: 22, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.20, ease: "power2.out" }, 1.80);
        tl.fromTo(".menu-item-02 .menu-drink-title",
            { yPercent: 40, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.22, ease: "power2.out" }, 1.85);
        tl.fromTo(".menu-item-02 .menu-divider",
            { scaleX: 0, opacity: 0 },
            { scaleX: 1, opacity: 1, duration: 0.16, ease: "power2.out", transformOrigin: "left center" }, 1.97);
        tl.fromTo(".menu-item-02 .menu-drink-flavor",
            { yPercent: 20, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.16, ease: "power2.out" }, 2.02);
        tl.fromTo(".menu-item-02 .menu-drink-image",
            { xPercent: 12, opacity: 0 },
            { xPercent: 0, opacity: 1, duration: 0.25, ease: "power2.out" }, 1.85);
        // Exit window: 2.35 – 2.45
        tl.to(".menu-item-02 .menu-number, .menu-item-02 .menu-drink-title, .menu-item-02 .menu-divider, .menu-item-02 .menu-drink-flavor", {
            opacity: 0, yPercent: -22, duration: 0.12, ease: "power2.in",
        }, 2.35);
        tl.to(".menu-item-02 .menu-drink-image", {
            opacity: 0, xPercent: -12, scale: 0.96, duration: 0.12, ease: "power2.in",
        }, 2.35);

        // ── MENU ITEM 03: enters 2.55 → holds ───────────────────────
        tl.fromTo(".menu-item-03 .menu-number",
            { yPercent: 22, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.20, ease: "power2.out" }, 2.55);
        tl.fromTo(".menu-item-03 .menu-drink-title",
            { yPercent: 40, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.22, ease: "power2.out" }, 2.60);
        tl.fromTo(".menu-item-03 .menu-divider",
            { scaleX: 0, opacity: 0 },
            { scaleX: 1, opacity: 1, duration: 0.16, ease: "power2.out", transformOrigin: "left center" }, 2.72);
        tl.fromTo(".menu-item-03 .menu-drink-flavor",
            { yPercent: 20, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.16, ease: "power2.out" }, 2.77);
        tl.fromTo(".menu-item-03 .menu-drink-image",
            { xPercent: 12, opacity: 0 },
            { xPercent: 0, opacity: 1, duration: 0.25, ease: "power2.out" }, 2.60);

        // ── SCENE 3 → 4: SIGNATURE EXIT & STORY IMAGE REVEAL (3.30 → 4.00) ──────
        tl.to(".menu-item-03 .menu-text-content", {
            yPercent: -25,
            opacity: 0,
            duration: 0.25,
            ease: "none",
        }, 3.30);
        tl.to(".menu-scroll-hint", { opacity: 0, duration: 0.15 }, 3.30);

        // final featured drink image moves left and scales down
        tl.to(".menu-item-03 .menu-drink-image", {
            xPercent: -80,
            yPercent: 10,
            scale: 0.72,
            opacity: 0,
            duration: 0.40,
            ease: "power2.inOut",
        }, 3.40);

        // Reveal Our Story image mask
        tl.fromTo(".story-visual-wrap",
            { clipPath: "inset(0 100% 0 0)" },
            { clipPath: "inset(0 0% 0 0)", ease: "power2.inOut", duration: 0.45 },
            3.45
        );
        tl.fromTo(".story-image-el",
            { scale: 1.08, xPercent: -3 },
            { scale: 1, xPercent: 0, ease: "power2.out", duration: 0.45 },
            3.45
        );

        // ── Progress ref: 0 → 4.0 across full scroll ───────────────────────────────
        tl.to(scrollProgress.current, { value: 4.0, ease: "none", duration: 4.0 }, 0);

        return () => { if (tl.scrollTrigger) tl.scrollTrigger.kill(); tl.kill(); };
    }, [hasLoadedModel]);

    // Separate ScrollTrigger for page background and image fade transition
    useEffect(() => {
        if (!hasLoadedModel) return;

        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (mediaQuery.matches) {
            gsap.set(".page-background", { backgroundColor: "#eee5d7" });
            gsap.set(".page-background-image", { opacity: 0 });
            return;
        }

        const bgTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".story-section",
                start: "top bottom",
                end: "top 35%",
                scrub: true,
            }
        });

        bgTl.to(".page-background", {
            backgroundColor: "#eee5d7",
            ease: "none",
        }, 0);

        bgTl.to(".page-background-image", {
            opacity: 0,
            ease: "none",
        }, 0);

        return () => { bgTl.kill(); };
    }, [hasLoadedModel]);

    // Separate ScrollTrigger for Our Story content entrance
    useEffect(() => {
        if (!hasLoadedModel) return;

        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const hasReducedMotion = mediaQuery.matches;

        if (hasReducedMotion) {
            gsap.set(".story-line, .story-kicker, .story-copy, .story-link", { opacity: 1, y: 0, yPercent: 0 });
            return;
        }

        const storyEntrance = gsap.timeline({
            scrollTrigger: {
                trigger: ".story-content",
                start: "top 75%",
                once: true,
            }
        });

        storyEntrance.fromTo(".story-kicker",
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
        );

        storyEntrance.fromTo(".story-line",
            { yPercent: 110 },
            { yPercent: 0, stagger: 0.08, duration: 0.55, ease: "power3.out" },
            "-=0.3"
        );

        storyEntrance.fromTo(".story-copy",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
            "-=0.3"
        );

        storyEntrance.fromTo(".story-link",
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
            "-=0.4"
        );

        return () => { storyEntrance.kill(); };
    }, [hasLoadedModel]);

    return (
        <>
            <CustomScrollbar />
            {/* Full-screen color layer underneath both sections */}
            <div className="page-background" />
            <div className="page-background-image" />

            <section className="coffee-story">
                <div className="coffee-stage">
                    {/* Background image layer pinned to the sticky viewport */}
                    <div className="coffee-story-bg-overlay" />



                    {/* Scene 1: Welcome Layer */}
                    <div className="welcome-layer">
                        <div className="welcome-text-overlay">
                            <h1 className="welcome-heading" aria-label="Welcome">
                                <span className="welcome-letter">W</span>
                                <span className="welcome-letter">E</span>
                                <span className="welcome-letter">L</span>
                                <span className="welcome-letter">C</span>
                                <span ref={oRef} className={`welcome-letter welcome-o ${isReplaced ? "is-replaced" : ""}`}>O</span>
                                <span className="welcome-letter">M</span>
                                <span className="welcome-letter">E</span>
                            </h1>
                        </div>
                        <div className="welcome-scroll-indicator">
                            <span className="scroll-indicator-text">Scroll to explore</span>
                            <div className="scroll-indicator-mouse">
                                <div className="scroll-indicator-wheel" />
                            </div>
                        </div>
                    </div>

                    {/* Scene 2: Brand Layer */}
                    <div className="brand-layer">
                        <h1 className="brand-title" aria-label="VHERMOSA">
                            {"VHERMOSA".split("").map((letter, index) => (
                                <span key={index} className="brand-letter" aria-hidden="true">
                                    {letter}
                                </span>
                            ))}
                        </h1>
                        <div className="cafe-word" aria-label="Cafe">
                            {"CAFE".split("").map((letter, index) => (
                                <span key={index} className="cafe-letter" aria-hidden="true">
                                    {letter}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Scene 3: Menu Layer */}
                    <div className="menu-layer">
                        {MENU_ITEMS.map((item) => (
                            <div key={item.id} className={`menu-item menu-item-${item.id}`}>
                                <div className="menu-text-content">
                                    <p className="menu-number">{item.number}</p>
                                    <h2 className="menu-drink-title">
                                        {item.title.split("\n").map((line, i) => (
                                            <span key={i} style={{ display: "block" }}>{line}</span>
                                        ))}
                                    </h2>
                                    <div className="menu-divider" />
                                    <p className="menu-drink-flavor">{item.flavor}</p>
                                </div>
                                <div className="menu-image-content">
                                    <img
                                        src={item.image}
                                        className="menu-drink-image"
                                        alt={item.title.replace("\n", " ")}
                                    />
                                </div>
                            </div>
                        ))}
                        <p className="menu-scroll-hint">Scroll to explore</p>
                    </div>

                    {/* 3D Model Canvas Front Layer (covers whole container) */}
                    <div ref={canvasRef} className="coffee-canvas">
                        <Canvas
                            frameloop="always"
                            dpr={typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1}
                            gl={{
                                antialias: true,
                                powerPreference: "high-performance",
                                alpha: true,
                            }}
                            style={{ background: "transparent", pointerEvents: "none" }}
                        >
                            <MainScene
                                alignment={alignment}
                                cupRef={cupRef}
                                onModelLoaded={onModelLoaded}
                                scrollProgress={scrollProgress}
                            />
                        </Canvas>
                    </div>
                </div>
                {/* Scroll filler section (height: 600vh since track is 700vh, and stage is 100vh) */}
                <div className="scroll-filler-section" />
            </section>

            {/* Scene 4: Our Story Section */}
            <section className="story-section" id="story">
                <div className="story-grid">
                    <div className="story-visual">
                        <div className="story-visual-wrap">
                            <img
                                src="/assets/barista.jpeg"
                                className="story-image-el"
                                alt="Our Story Barista"
                            />
                        </div>
                    </div>

                    <div className="story-content">
                        <span className="story-kicker">Our Story</span>

                        <h2 className="story-title">
                            <span className="story-line-mask">
                                <span className="story-line">Crafted with care.</span>
                            </span>
                            <span className="story-line-mask">
                                <span className="story-line">Shared with warmth.</span>
                            </span>
                        </h2>

                        <p className="story-copy">
                            Vhermosa began with a simple belief: coffee should feel personal.
                            Every cup is prepared with thoughtful ingredients, careful technique,
                            and the intention to create a moment worth slowing down for.
                        </p>

                        <a href="/about" className="story-link">
                            Discover our story
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}