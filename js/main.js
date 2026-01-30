/* ============================================
   GÎTE PAILLE & FOIN - MAIN JAVASCRIPT
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ----- Loader -----
    const loader = document.getElementById('loader');
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 1500);
    });

    // ----- Navbar Scroll Effect -----
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ----- Mobile Navigation -----

    // Hamburger menu open/close
    navToggle.addEventListener('click', () => {
        const isActive = navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        // Prevent body scroll when menu open (mobile)
        if (isActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Close menu on link click (mobile)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // ----- Active Navigation Link -----
    const sections = document.querySelectorAll('section[id]');

    function updateActiveNav() {
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 200;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);

    // ----- Smooth Scroll -----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ----- Reveal on Scroll -----
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    function revealOnScroll() {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;

        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;

            if (elementTop < windowHeight - revealPoint) {
                element.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // ----- Counter Animation -----
    const counters = document.querySelectorAll('[data-count]');
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;

        counters.forEach(counter => {
            const rect = counter.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                countersAnimated = true;
                const target = parseInt(counter.getAttribute('data-count'));
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;

                const updateCounter = () => {
                    current += step;
                    if (current < target) {
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };

                updateCounter();
            }
        });
    }

    window.addEventListener('scroll', animateCounters);
    animateCounters(); // Initial check

    // ----- Gallery Filter & Load More -----
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const loadMoreBtn = document.getElementById('load-more-gallery');
    const galleryCounter = document.getElementById('gallery-counter');
    const ITEMS_PER_PAGE = 6; // 2 lignes de 3
    let visibleCount = ITEMS_PER_PAGE;
    let currentFilter = 'all';

    function getFilteredItems() {
        return Array.from(galleryItems).filter(item => {
            const category = item.getAttribute('data-category') || '';
            return currentFilter === 'all' || category.includes(currentFilter);
        });
    }

    function updateGalleryDisplay() {
        const filteredItems = getFilteredItems();
        const totalFiltered = filteredItems.length;
        
        // Cacher toutes les photos d'abord
        galleryItems.forEach(item => {
            item.classList.add('hidden');
        });
        
        // Afficher seulement les photos visibles selon le filtre et le compteur
        filteredItems.forEach((item, index) => {
            if (index < visibleCount) {
                item.classList.remove('hidden');
            }
        });
        
        // Mettre à jour le compteur
        const shown = Math.min(visibleCount, totalFiltered);
        galleryCounter.textContent = shown + ' / ' + totalFiltered + ' photos';
        
        // Cacher/afficher le bouton
        if (loadMoreBtn) {
            if (visibleCount >= totalFiltered) {
                loadMoreBtn.parentElement.classList.add('hidden');
            } else {
                loadMoreBtn.parentElement.classList.remove('hidden');
            }
        }
    }

    // Initialiser l'affichage
    updateGalleryDisplay();

    // Bouton Afficher plus
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            visibleCount += ITEMS_PER_PAGE;
            updateGalleryDisplay();
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentFilter = btn.getAttribute('data-filter');
            visibleCount = ITEMS_PER_PAGE; // Reset au changement de filtre
            updateGalleryDisplay();
        });
    });

    // ----- Lightbox -----
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    let currentImageIndex = 0;
    const galleryImages = [];

    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        const title = item.querySelector('.gallery-title');
        
        galleryImages.push({
            src: img.src,
            caption: title ? title.textContent : ''
        });

        item.addEventListener('click', () => {
            currentImageIndex = index;
            openLightbox();
        });
    });

    function openLightbox() {
        lightbox.classList.add('active');
        updateLightboxImage();
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateLightboxImage() {
        lightboxImg.src = galleryImages[currentImageIndex].src;
        lightboxCaption.textContent = galleryImages[currentImageIndex].caption;
    }

    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        updateLightboxImage();
    }

    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightboxImage();
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', nextImage);
    lightboxPrev.addEventListener('click', prevImage);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });

    // ----- Back to Top -----
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    // ----- Parallax Effect -----
    const heroContent = document.querySelector('.hero-content');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
        }
    });

    // ----- Particles -----
    const particlesContainer = document.getElementById('particles');
    
    function createParticles() {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particle.style.width = (Math.random() * 8 + 4) + 'px';
            particle.style.height = particle.style.width;
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            particlesContainer.appendChild(particle);
        }
    }
    
    createParticles();

    // ----- Form Handling -----
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Simple validation
            if (!data.name || !data.email || !data.checkin || !data.checkout || !data.guests) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
            submitBtn.disabled = true;

            try {
                // Envoi réel via Formspree
                const response = await fetch('https://formspree.io/f/xojwywoq', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Message envoyé !';
                    submitBtn.style.background = '#2C5530';
                    
                    setTimeout(() => {
                        contactForm.reset();
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        submitBtn.style.background = '';
                        
                        alert('Merci pour votre demande ! Nous vous répondrons dans les plus brefs délais.');
                    }, 2000);
                } else {
                    throw new Error('Erreur lors de l\'envoi');
                }
            } catch (error) {
                submitBtn.innerHTML = '<i class="fas fa-times"></i> Erreur';
                submitBtn.style.background = '#dc3545';
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    
                    alert('Une erreur est survenue. Veuillez réessayer ou nous contacter directement par téléphone.');
                }, 2000);
            }
        });

        // Date validation
        const checkinInput = document.getElementById('checkin');
        const checkoutInput = document.getElementById('checkout');

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        checkinInput.setAttribute('min', today);

        checkinInput.addEventListener('change', () => {
            checkoutInput.setAttribute('min', checkinInput.value);
            if (checkoutInput.value && checkoutInput.value < checkinInput.value) {
                checkoutInput.value = '';
            }
        });
    }

    // ----- Magnetic Button Effect -----
    const magneticBtns = document.querySelectorAll('.btn-primary, .btn-secondary');

    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // ----- Testimonials Auto-scroll (optional) -----
    // Could add auto-scrolling for testimonials carousel

    // ----- Lazy Loading Images -----
    const images = document.querySelectorAll('img[src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px'
    });

    images.forEach(img => {
        imageObserver.observe(img);
    });

    // ----- Tilt Effect on Cards -----
    const tiltCards = document.querySelectorAll('.room-card, .activity-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ----- Print/Console Easter Egg -----
    console.log('%c🏡 Gîte Paille & Foin', 'font-size: 24px; font-weight: bold; color: #8B6914;');
    console.log('%cBienvenue à Senzeille ! 🌾', 'font-size: 14px; color: #2C5530;');
    console.log('%cSite créé avec ❤️', 'font-size: 12px; color: #666;');
});

// ----- Preload Critical Images -----
function preloadImages() {
    const criticalImages = [
        'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1920&h=1080&fit=crop'
    ];

    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

preloadImages();
