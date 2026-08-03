"use client";

import { Clone, useGLTF } from "@react-three/drei";
import { useMemo, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CoffeeMugProps {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number | [number, number, number];
    opacity?: number;
    ref?: React.Ref<any>;
    onLoaded?: (localDiameter: number) => void;
    scrollProgress?: React.RefObject<{ value: number }>;
}

export default function CoffeeMug({
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 0.1,
    opacity = 1.0,
    ref,
    onLoaded,
    scrollProgress,
}: CoffeeMugProps) {
    const { scene } = useGLTF("/models/coffeecup.glb");
    const innerRef = useRef<THREE.Group>(null);

    // Report local circular rim diameter back to parent once the model loads
    useEffect(() => {
        if (onLoaded && scene) {
            let rimMesh: THREE.Object3D | null = null;
            scene.traverse((child: any) => {
                if (child.isMesh && (child.name.includes("Rosetta") || child.name.includes("Latte"))) {
                    rimMesh = child;
                }
            });

            if (rimMesh) {
                const rimBox = new THREE.Box3().setFromObject(rimMesh);
                const size = new THREE.Vector3();
                rimBox.getSize(size);
                const localDiameter = Math.max(size.x, size.z);
                onLoaded(localDiameter);
            } else {
                const box = new THREE.Box3().setFromObject(scene);
                const size = new THREE.Vector3();
                box.getSize(size);
                const localDiameter = Math.max(size.x, size.z);
                onLoaded(localDiameter);
            }
        }
    }, [scene, onLoaded]);

    const clonedScene = useMemo(() => {
        const cl = scene.clone();
        
        // Find circular cup rim mesh for horizontal (X, Z) centering
        let rimMesh: THREE.Object3D | null = null;
        cl.traverse((child: any) => {
            if (child.isMesh && (child.name.includes("Rosetta") || child.name.includes("Latte"))) {
                rimMesh = child;
            }
        });

        // Bounding box of full cup to measure height from bottom to top
        const fullBox = new THREE.Box3().setFromObject(cl);
        const rimCenter = new THREE.Vector3();
        if (rimMesh) {
            const rimBox = new THREE.Box3().setFromObject(rimMesh);
            rimBox.getCenter(rimCenter);
        } else {
            fullBox.getCenter(rimCenter);
        }

        // Overall central point for rotations:
        // - X, Z: center point of circular rim
        // - Y: half height from bottom to top of cup: (min.y + max.y) / 2
        const centralPoint = new THREE.Vector3(
            rimCenter.x,
            (fullBox.min.y + fullBox.max.y) / 2,
            rimCenter.z
        );

        cl.position.sub(centralPoint); // Shift pivot to central point for rotations

        cl.traverse((child: any) => {
            if (child.isMesh && child.material) {
                child.material = child.material.clone();
                // If logo mesh overlay, enable depth writing and polygon offset to avoid Z-fighting
                if (
                    child.name.includes("ChatGPT") ||
                    child.name.includes("preview") ||
                    child.material.name?.includes("ChatGPT")
                ) {
                    child.material.transparent = true;
                    child.material.depthWrite = true;
                    child.material.polygonOffset = true;
                    child.material.polygonOffsetFactor = -1;
                    child.material.polygonOffsetUnits = -1;
                }
                if (opacity < 1.0) {
                    child.material.transparent = true;
                    child.material.opacity = opacity;
                }
            }
        });
        return cl;
    }, [scene, opacity]);

    useFrame(() => {
        if (!innerRef.current) return;
        innerRef.current.rotation.set(0, 0, 0);
        innerRef.current.position.set(0, 0, 0);
    });

    return (
        <group
            ref={ref}
            position={position}
            rotation={rotation}
            scale={scale}
        >
            <group ref={innerRef}>
                <Clone object={clonedScene} />
            </group>
        </group>
    );
}

useGLTF.preload("/models/coffeecup.glb");