document.addEventListener('DOMContentLoaded', () => {

    const header = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const navItems = navLinks.querySelectorAll('a');

    // 1. Sticky Navbar Effect on Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Hamburger animasyonu için basit bir class eklenebilir, 
        // şu an sadece aç kapa yapıyor
    });

    // 3. Close Mobile Menu when a link is clicked
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // 4. Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Floating header yüksekliği ve payını hesaba katarak scroll
                const headerHeight = header.offsetHeight + 35;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
    // 5. Theme Toggle Logic
    const themeToggleBtn = document.getElementById('themeToggle');

    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            
            if (document.body.classList.contains('light-mode')) {
                localStorage.setItem('theme', 'light');
            } else {
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // 6. Smooth Scroll Reveal & Stagger Animation (Mindloop Style)
    const revealElements = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    // "Keşfedilmiş mantığı": öğe bir kez açılınca sayfa yenilenene kadar tekrar tetiklenmez
                    observer.unobserve(entry.target);
                    // Animasyon bitince gecikmeleri sıfırlayarak tema geçişlerinin eşzamanlı olmasını sağlarız
                    setTimeout(() => {
                        entry.target.classList.add('reveal-complete');
                    }, 850);
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
        // Fallback
        revealElements.forEach(el => el.classList.add('revealed'));
    }

    // 7. Prevent accidental dragging on cards and buttons
    document.querySelectorAll('.service-card, .stat-card, .accordion-item, .info-card, .btn, .social-pill').forEach(el => {
        el.addEventListener('dragstart', (e) => e.preventDefault());
    });

});

