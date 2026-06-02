/* ---------------------------------------------------------
   WOODSCAPE - Premium Interactions & Scroll Engine
   --------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('progressBar');
    const preloaderStatus = document.getElementById('preloaderStatus');
    const mockupImage = document.getElementById('mockupImage');
    const mainHeader = document.getElementById('mainHeader');
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const scrollProgressBar = document.getElementById('scrollProgressBar');
    const backToTop = document.getElementById('backToTop');
    
    // Links to scroll targets
    const scrollLinks = document.querySelectorAll('[data-scroll]');

    /* ---------------------------------------------------------
       1. Preloader Engine (Syncs with Background Image Load)
       --------------------------------------------------------- */
    let progress = 0;
    
    // Fast initial progress simulation (stops at 80% to wait for actual image load)
    const simulateLoad = setInterval(() => {
        if (progress < 80) {
            progress += Math.floor(Math.random() * 5) + 3;
            if (progress > 80) progress = 80;
            updatePreloader(progress);
        }
    }, 50);

    function updatePreloader(val) {
        if (progressBar) progressBar.style.width = `${val}%`;
        
        if (val < 30) {
            preloaderStatus.textContent = "Connecting to Workspace...";
        } else if (val < 60) {
            preloaderStatus.textContent = "Loading Asset Package...";
        } else if (val < 80) {
            preloaderStatus.textContent = "Rendering Mockup Canvas...";
        } else if (val < 100) {
            preloaderStatus.textContent = "Optimizing Performance...";
        } else {
            preloaderStatus.textContent = "Experience Initiated";
        }
    }

    function completePreloader() {
        clearInterval(simulateLoad);
        let currentProgress = progress;
        
        // Fast-forward from current level to 100% once asset is cached
        const finishLoad = setInterval(() => {
            if (currentProgress < 100) {
                currentProgress += 4;
                if (currentProgress > 100) currentProgress = 100;
                updatePreloader(currentProgress);
            } else {
                clearInterval(finishLoad);
                setTimeout(() => {
                    if (preloader) {
                        preloader.classList.add('fade-out');
                        // Allow body scroll after preloader closes
                        document.body.style.overflowY = 'auto';
                    }
                }, 400);
            }
        }, 20);
    }

    // Disable body scroll while preloader is active
    document.body.style.overflowY = 'hidden';

    // Verify image loading state
    if (mockupImage) {
        if (mockupImage.complete) {
            completePreloader();
        } else {
            mockupImage.addEventListener('load', completePreloader);
            mockupImage.addEventListener('error', () => {
                console.warn("Background image loading failed, skipping preloader.");
                completePreloader();
            });
        }
    } else {
        completePreloader();
    }

    /* ---------------------------------------------------------
       2. Smooth Scrolling & Ratio Mapping
       --------------------------------------------------------- */
    scrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const scrollRatio = parseFloat(link.getAttribute('data-scroll'));
            if (isNaN(scrollRatio)) return; // Skip if it's a contact detail mailto/tel link

            e.preventDefault();
            
            // Close mobile menu if active
            if (mobileDrawer && mobileDrawer.classList.contains('open')) {
                mobileDrawer.classList.remove('open');
                mobileNavToggle.classList.remove('open');
                mobileNavToggle.setAttribute('aria-expanded', 'false');
            }

            const documentHeight = document.documentElement.scrollHeight;
            const viewportHeight = window.innerHeight;
            const maxScrollY = documentHeight - viewportHeight;
            
            // Calculate target vertical pixel height
            const targetY = maxScrollY * scrollRatio;
            
            window.scrollTo({
                top: targetY,
                behavior: 'smooth'
            });
        });
    });

    /* ---------------------------------------------------------
       3. Sticky Header Scroll Animations & direction detection
       --------------------------------------------------------- */
    let lastScrollY = window.scrollY;

    function handleHeaderScroll() {
        const currentScrollY = window.scrollY;

        // Class toggles for scrolled header background
        if (currentScrollY > 50) {
            mainHeader.classList.add('header-scrolled');
        } else {
            mainHeader.classList.remove('header-scrolled');
        }

        // Hide header when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > 150) {
            mainHeader.classList.add('header-hidden');
        } else {
            mainHeader.classList.remove('header-hidden');
        }

        lastScrollY = currentScrollY;
    }

    /* ---------------------------------------------------------
       4. Dynamic Scroll Spy (Syncs Active Links with Scroll Ratio)
       --------------------------------------------------------- */
    const spyLinks = document.querySelectorAll('.nav-menu .nav-link, .mobile-nav .mobile-link');
    const scrollRatios = [0, 0.15, 0.33, 0.52, 0.74, 0.94]; // Nav target mappings

    function handleScrollSpy() {
        const currentScrollY = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        const maxScrollY = documentHeight - viewportHeight;
        
        const currentRatio = maxScrollY > 0 ? currentScrollY / maxScrollY : 0;
        
        // Find nearest defined section ratio
        let targetActiveRatio = 0;
        let minimumDifference = 1.0;

        scrollRatios.forEach(ratio => {
            const difference = Math.abs(currentRatio - ratio);
            if (difference < minimumDifference) {
                minimumDifference = difference;
                targetActiveRatio = ratio;
            }
        });

        // Set active class on corresponding elements
        spyLinks.forEach(link => {
            const linkRatio = parseFloat(link.getAttribute('data-scroll'));
            if (linkRatio === targetActiveRatio) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /* ---------------------------------------------------------
       5. Scroll Progress Bar & Floating Top Button
       --------------------------------------------------------- */
    function handleScrollIndicators() {
        const currentScrollY = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        const maxScrollY = documentHeight - viewportHeight;
        
        const scrollPercentage = maxScrollY > 0 ? (currentScrollY / maxScrollY) * 100 : 0;

        if (scrollProgressBar) {
            scrollProgressBar.style.width = `${scrollPercentage}%`;
        }

        if (backToTop) {
            if (currentScrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    }

    // Scroll listener aggregation for performance
    window.addEventListener('scroll', () => {
        handleHeaderScroll();
        handleScrollSpy();
        handleScrollIndicators();
    }, { passive: true });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /* ---------------------------------------------------------
       6. Mobile Drawer Toggle Controls
       --------------------------------------------------------- */
    if (mobileNavToggle && mobileDrawer) {
        mobileNavToggle.addEventListener('click', () => {
            const isOpen = mobileDrawer.classList.contains('open');
            if (isOpen) {
                mobileDrawer.classList.remove('open');
                mobileNavToggle.classList.remove('open');
                mobileNavToggle.setAttribute('aria-expanded', 'false');
            } else {
                mobileDrawer.classList.add('open');
                mobileNavToggle.classList.add('open');
                mobileNavToggle.setAttribute('aria-expanded', 'true');
            }
        });
    }
});
