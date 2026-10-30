document.addEventListener('DOMContentLoaded', () => {

    const header = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const navItems = navLinks ? navLinks.querySelectorAll('a') : [];

    const setMenuState = (isOpen) => {
        if (!navLinks || !mobileMenuBtn) return;
        navLinks.classList.toggle('active', isOpen);
        mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Menüyü Kapat' : 'Menüyü Aç');
    };

    // 1. Sticky Navbar Effect on Scroll (rAF-throttled + state-guarded to avoid redundant DOM writes)
    if (header) {
        let isScrolled = window.scrollY > 50;
        let scrollTicking = false;
        header.classList.toggle('scrolled', isScrolled);
        document.body.classList.toggle('is-scrolled', isScrolled);

        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                window.requestAnimationFrame(() => {
                    const nextScrolled = window.scrollY > 50;
                    if (nextScrolled !== isScrolled) {
                        isScrolled = nextScrolled;
                        header.classList.toggle('scrolled', isScrolled);
                        document.body.classList.toggle('is-scrolled', isScrolled);
                    }
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        }, { passive: true });
    }

    // 2. Mobile Menu Toggle + Keyboard & Outside-Click Resilience
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = !navLinks.classList.contains('active');
            setMenuState(isOpen);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                setMenuState(false);
                mobileMenuBtn.focus();
            }
        });

        document.addEventListener('click', (e) => {
            if (
                navLinks.classList.contains('active') &&
                !navLinks.contains(e.target) &&
                !mobileMenuBtn.contains(e.target)
            ) {
                setMenuState(false);
            }
        });
    }

    // 3. Close Mobile Menu when a link is clicked
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            setMenuState(false);
        });
    });

    // 4. Smooth Scrolling for anchor links with Keyboard Focus Transfer
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerHeight = header ? header.offsetHeight + 35 : 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = targetId === '#mainContent'
                    ? 0
                    : Math.max(0, elementPosition + window.scrollY - headerHeight);
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });

                if (!targetElement.hasAttribute('tabindex')) {
                    targetElement.setAttribute('tabindex', '-1');
                }
                targetElement.focus({ preventScroll: true });
            }
        });
    });

    // 4b. Active Section Navigation Indicator (aria-current="location")
    const sectionElements = document.querySelectorAll('main section[id]');
    const sectionNavLinks = document.querySelectorAll('.nav-menu-links a[href^="#"]');

    if ('IntersectionObserver' in window && sectionElements.length > 0 && sectionNavLinks.length > 0) {
        const setCurrentSection = (id) => {
            sectionNavLinks.forEach(link => {
                if (link.getAttribute('href') === `#${id}`) {
                    link.setAttribute('aria-current', 'location');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        };

        setCurrentSection('hero');

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target.id) {
                    setCurrentSection(entry.target.id);
                }
            });
        }, {
            rootMargin: '-35% 0px -55% 0px',
            threshold: 0
        });

        sectionElements.forEach(sec => sectionObserver.observe(sec));
    }

    // 5. Theme Toggle Logic with Storage Resilience & ARIA Sync
    const themeToggleBtn = document.getElementById('themeToggle');

    const getStoredTheme = () => {
        try {
            return localStorage.getItem('theme');
        } catch {
            return null;
        }
    };

    const setStoredTheme = (value) => {
        try {
            localStorage.setItem('theme', value);
        } catch {
            // Storage unavailable (e.g. strict privacy mode)
        }
    };

    const syncThemeA11y = (isLight) => {
        if (!themeToggleBtn) return;
        themeToggleBtn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
        themeToggleBtn.setAttribute('aria-label', isLight ? 'Koyu temaya geç' : 'Açık temaya geç');
    };

    if (getStoredTheme() === 'light') {
        document.body.classList.add('light-mode');
        syncThemeA11y(true);
    } else {
        syncThemeA11y(false);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-mode');
            setStoredTheme(isLight ? 'light' : 'dark');
            syncThemeA11y(isLight);
        });
    }

    // 6. GSAP & ScrollTrigger Animation System (with IntersectionObserver Fallback)
    const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

    if (hasGSAP) {
        const { gsap, ScrollTrigger } = window;
        gsap.registerPlugin(ScrollTrigger);
        document.documentElement.classList.add('gsap-enabled');

        const mm = gsap.matchMedia();

        mm.add('(prefers-reduced-motion: no-preference)', () => {
            // A. Hero Choreographed Entrance Timeline
            const heroTl = gsap.timeline({
                defaults: { ease: 'power3.out', duration: 0.75 }
            });

            heroTl
                .from('.hero-title-brand', {
                    y: 28,
                    opacity: 0,
                    clearProps: 'transform,opacity'
                })
                .from('.hero-title-accent', {
                    scale: 0.92,
                    opacity: 0,
                    duration: 0.55,
                    clearProps: 'transform,opacity'
                }, '-=0.48')
                .from('.hero-title-statement', {
                    y: 20,
                    opacity: 0,
                    duration: 0.65,
                    clearProps: 'transform,opacity'
                }, '-=0.42')
                .from('.hero-subtitle', {
                    y: 18,
                    opacity: 0,
                    duration: 0.65,
                    clearProps: 'transform,opacity'
                }, '-=0.45')
                .from('.hero-buttons .btn', {
                    y: 16,
                    opacity: 0,
                    stagger: 0.1,
                    duration: 0.6,
                    clearProps: 'transform,opacity'
                }, '-=0.42')
                .from('.hero-stage-frame', {
                    y: 30,
                    scale: 0.97,
                    opacity: 0,
                    duration: 0.85,
                    clearProps: 'transform,opacity'
                }, '-=0.68')
                .from('.hero-bar > *', {
                    y: 18,
                    opacity: 0,
                    stagger: 0.08,
                    duration: 0.55,
                    clearProps: 'transform,opacity'
                }, '-=0.5');

            // B. Hero Scroll-Linked Parallax (Scrub)
            gsap.to('.hero-slash', {
                yPercent: 14,
                xPercent: -6,
                ease: 'none',
                scrollTrigger: {
                    trigger: '#hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 0.6
                }
            });

            gsap.to('.hero-bg', {
                yPercent: 10,
                ease: 'none',
                scrollTrigger: {
                    trigger: '#hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 0.6
                }
            });

            // C. Animated Metric Counters (20+, 2000+, %100)
            const animateCountersIn = (containerSelector) => {
                const container = document.querySelector(containerSelector);
                if (!container) return;
                const counters = container.querySelectorAll('[data-count-to]');
                if (counters.length === 0) return;

                ScrollTrigger.create({
                    trigger: container,
                    start: 'top 88%',
                    once: true,
                    onEnter: () => {
                        counters.forEach(counter => {
                            const targetVal = parseInt(counter.getAttribute('data-count-to') || '0', 10);
                            const prefix = counter.getAttribute('data-count-prefix') || '';
                            const suffix = counter.getAttribute('data-count-suffix') || '';
                            const state = { val: 0 };

                            gsap.to(state, {
                                val: targetVal,
                                duration: 1.35,
                                ease: 'power2.out',
                                snap: { val: 1 },
                                onUpdate: () => {
                                    counter.textContent = `${prefix}${Math.round(state.val)}${suffix}`;
                                }
                            });
                        });
                    }
                });
            };

            animateCountersIn('.hero-stage-metrics');
            animateCountersIn('.about-stats-grid');

            // D. Section Headers Choreography (.section-header-split)
            gsap.utils.toArray('.section-header-split').forEach(headerEl => {
                const title = headerEl.querySelector('.section-title-bold');
                const desc = headerEl.querySelector('.section-desc-bold');
                const targets = [title, desc].filter(Boolean);

                gsap.from(targets, {
                    y: 26,
                    opacity: 0,
                    duration: 0.72,
                    stagger: 0.12,
                    ease: 'power3.out',
                    clearProps: 'transform,opacity',
                    scrollTrigger: {
                        trigger: headerEl,
                        start: 'top 86%',
                        once: true
                    }
                });
            });

            // E. Services Section Bento Matrix Stagger
            gsap.from('#services .service-card', {
                y: 36,
                opacity: 0,
                duration: 0.75,
                stagger: 0.12,
                ease: 'power3.out',
                clearProps: 'transform,opacity',
                scrollTrigger: {
                    trigger: '.services-matrix',
                    start: 'top 84%',
                    once: true
                }
            });

            // F. About Section Split & Stats Ledger Choreography
            const aboutTl = gsap.timeline({
                scrollTrigger: {
                    trigger: '#about .about-container',
                    start: 'top 82%',
                    once: true
                },
                defaults: { ease: 'power3.out' }
            });

            aboutTl
                .from('#about .about-portrait-frame', {
                    x: -24,
                    y: 20,
                    opacity: 0,
                    duration: 0.8,
                    clearProps: 'transform,opacity'
                })
                .from([
                    '#about .section-title-bold',
                    '#about .about-lead',
                    '#about .trainer-quote'
                ], {
                    y: 24,
                    opacity: 0,
                    duration: 0.7,
                    stagger: 0.12,
                    clearProps: 'transform,opacity'
                }, '-=0.55')
                .from('#about .stat-card', {
                    y: 20,
                    opacity: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    clearProps: 'transform,opacity'
                }, '-=0.35');

            // G. Gallery Section 5-Panel Stagger
            gsap.from('#gallery .accordion-item', {
                y: 32,
                opacity: 0,
                duration: 0.72,
                stagger: 0.09,
                ease: 'power3.out',
                clearProps: 'transform,opacity',
                scrollTrigger: {
                    trigger: '.gallery-accordion',
                    start: 'top 85%',
                    once: true
                }
            });

            // H. Contact Section Cards & Map Stage Stagger
            gsap.from(['#contact .info-card', '#contact .map-stage'], {
                y: 32,
                opacity: 0,
                duration: 0.75,
                stagger: 0.14,
                ease: 'power3.out',
                clearProps: 'transform,opacity',
                scrollTrigger: {
                    trigger: '.contact-container',
                    start: 'top 84%',
                    once: true
                }
            });

            // I. Footer Entrance
            gsap.from('.footer-inner', {
                y: 20,
                opacity: 0,
                duration: 0.65,
                ease: 'power2.out',
                clearProps: 'transform,opacity',
                scrollTrigger: {
                    trigger: '.footer',
                    start: 'top 92%',
                    once: true
                }
            });

            // J. Interactive Service Card Icon Micro-Physics
            document.querySelectorAll('.service-card').forEach(card => {
                const icon = card.querySelector('.service-icon');
                if (!icon) return;
                card.addEventListener('mouseenter', () => {
                    gsap.to(icon, {
                        scale: 1.08,
                        rotation: -4,
                        duration: 0.28,
                        ease: 'back.out(2)',
                        overwrite: 'auto'
                    });
                });
                card.addEventListener('mouseleave', () => {
                    gsap.to(icon, {
                        scale: 1,
                        rotation: 0,
                        duration: 0.25,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });
                });
            });
        });
    } else {
        // Fallback: Native IntersectionObserver if GSAP scripts fail to load
        const revealElements = document.querySelectorAll('.reveal');
        if ('IntersectionObserver' in window) {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        el.classList.add('revealed');
                        observer.unobserve(el);
                        el.addEventListener('transitionend', () => {
                            el.classList.add('reveal-complete');
                        }, { once: true });
                    }
                });
            }, {
                threshold: 0.12,
                rootMargin: '0px 0px -40px 0px'
            });

            revealElements.forEach(el => {
                revealObserver.observe(el);
            });
        } else {
            revealElements.forEach(el => el.classList.add('revealed', 'reveal-complete'));
        }
    }

    // 7. Gallery Accordion Touch / Keyboard Activation
    const accordionItems = document.querySelectorAll('.accordion-item');
    if (accordionItems.length > 0) {
        accordionItems[0].classList.add('is-active');

        const activateAccordionItem = (targetItem) => {
            accordionItems.forEach(item => {
                const isActive = item === targetItem;
                item.classList.toggle('is-active', isActive);
                item.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            });
        };

        accordionItems.forEach(item => {
            item.addEventListener('click', () => {
                activateAccordionItem(item);
            });

            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activateAccordionItem(item);
                }
            });
        });
    }

    // 8. Prevent accidental dragging on buttons/links only (keep content text selectable)
    document.querySelectorAll('.btn, .social-pill, .floating-whatsapp').forEach(el => {
        el.addEventListener('dragstart', (e) => e.preventDefault());
    });

});

