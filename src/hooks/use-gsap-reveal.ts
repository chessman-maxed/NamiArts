"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-setup";

interface RevealOptions {
  direction?: "up" | "down" | "left" | "right" | "fade";
  delay?: number;
  duration?: number;
  distance?: number;
  stagger?: number;
  parallaxSpeed?: number;
  triggerStart?: string;
}

export function useGsapReveal<T extends HTMLElement = HTMLDivElement>(options: RevealOptions = {}) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !elementRef.current) return;

    const el = elementRef.current;
    const {
      direction = "up",
      delay = 0,
      duration = 0.9,
      distance = 35,
      stagger = 0,
      parallaxSpeed,
      triggerStart = "top 88%",
    } = options;

    const ctx = gsap.context(() => {
      let x = 0;
      let y = 0;

      if (direction === "up") y = distance;
      if (direction === "down") y = -distance;
      if (direction === "left") x = distance;
      if (direction === "right") x = -distance;

      const children = el.children.length > 1 && stagger > 0 ? Array.from(el.children) : el;

      gsap.fromTo(
        children,
        {
          opacity: 0,
          x,
          y,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          delay,
          stagger: stagger > 0 ? stagger : undefined,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: triggerStart,
            toggleActions: "play none none none",
          },
        }
      );

      if (parallaxSpeed !== undefined) {
        gsap.to(el, {
          yPercent: parallaxSpeed,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      }
    }, el);

    return () => ctx.revert();
  }, [options]);

  return elementRef;
}

export function useGsapParallax<T extends HTMLElement = HTMLDivElement>(speed: number = 8) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !elementRef.current) return;

    const el = elementRef.current;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: speed,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [speed]);

  return elementRef;
}
