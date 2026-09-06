"use client";

import { useEffect } from "react";

/**
 * Lapisan interaksi landing page: scroll reveal, progress bar, nav shrink,
 * spotlight kursor pada kartu, dan animasi angka statistik.
 * Semua efek dimatikan otomatis bila pengguna memilih prefers-reduced-motion.
 */
export default function LandingEffects() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups = [];

    // 1. Scroll reveal
    const revealables = Array.from(document.querySelectorAll("[data-reveal]"));
    if (reduced) {
      revealables.forEach((el) => el.classList.add("in-view"));
    } else if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
      );
      revealables.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    } else {
      revealables.forEach((el) => el.classList.add("in-view"));
    }

    // 2. Progress bar + nav state
    const bar = document.querySelector(".scroll-progress > i");
    const nav = document.querySelector(".landing-nav");
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    // 3. Spotlight kursor
    if (!reduced && window.matchMedia("(hover: hover)").matches) {
      const spots = Array.from(document.querySelectorAll("[data-spotlight]"));
      const onMove = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
      };
      spots.forEach((el) => el.addEventListener("pointermove", onMove));
      cleanups.push(() => spots.forEach((el) => el.removeEventListener("pointermove", onMove)));
    }

    // 4. Counter statistik
    const counters = Array.from(document.querySelectorAll("[data-count]"));
    if (counters.length) {
      if (reduced) {
        counters.forEach((el) => { el.textContent = el.dataset.count; });
      } else {
        const run = (el) => {
          const target = Number(el.dataset.count);
          const started = performance.now();
          const duration = 1100;
          const tick = (now) => {
            const p = Math.min((now - started) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = String(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        };
        const co = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              run(entry.target);
              co.unobserve(entry.target);
            });
          },
          { threshold: 0.5 }
        );
        counters.forEach((el) => { el.textContent = "0"; co.observe(el); });
        cleanups.push(() => co.disconnect());
      }
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
