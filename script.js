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
    
    // View Switcher Elements
    const btnDesktopView = document.getElementById('btnDesktopView');
    const btnMobileView = document.getElementById('btnMobileView');
    const mobileDrawerToggler = document.getElementById('mobileDrawerToggler');

    let currentViewMode = 'desktop';

    const sectionScrollMapping = {
        '#home': 0,
        '#about': 1,
        '#services': 2,
        '#projects': 3,
        '#process': 4,
        '#contact': 5
    };

    const desktopScrollRatios = [0, 0.1428, 0.3154, 0.4971, 0.7514, 0.9426];
    // Calibrated mobile scroll ratios
    const mobileScrollRatios = [0, 0.1474, 0.2652, 0.3508, 0.4618, 0.7859];

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
            e.preventDefault();
            
            // Close mobile menu if active
            if (mobileDrawer && mobileDrawer.classList.contains('open')) {
                mobileDrawer.classList.remove('open');
                mobileNavToggle.classList.remove('open');
                mobileNavToggle.setAttribute('aria-expanded', 'false');
            }

            const href = link.getAttribute('href');
            let scrollRatio = parseFloat(link.getAttribute('data-scroll'));
            
            // Use active mode ratio mapping if it is a section link
            const sectionIndex = sectionScrollMapping[href];
            if (sectionIndex !== undefined) {
                scrollRatio = currentViewMode === 'mobile' ? mobileScrollRatios[sectionIndex] : desktopScrollRatios[sectionIndex];
            }

            if (isNaN(scrollRatio)) return; // Skip if it's a contact detail mailto/tel link

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

    function handleScrollSpy() {
        const currentScrollY = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        const maxScrollY = documentHeight - viewportHeight;
        
        const currentRatio = maxScrollY > 0 ? currentScrollY / maxScrollY : 0;
        
        const activeRatios = currentViewMode === 'mobile' ? mobileScrollRatios : desktopScrollRatios;
        
        // Find nearest defined section ratio index
        let targetIndex = 0;
        let minimumDifference = 1.0;

        activeRatios.forEach((ratio, idx) => {
            const difference = Math.abs(currentRatio - ratio);
            if (difference < minimumDifference) {
                minimumDifference = difference;
                targetIndex = idx;
            }
        });

        const sections = ['#home', '#about', '#services', '#projects', '#process', '#contact'];
        const targetSection = sections[targetIndex];

        // Set active class on corresponding elements
        spyLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === targetSection) {
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

    /* ---------------------------------------------------------
       7. View Mode Switcher Logic (Desktop & Mobile)
       --------------------------------------------------------- */
    function setViewMode(mode) {
        if (currentViewMode === mode) return;
        
        currentViewMode = mode;
        
        // Update body class
        if (mode === 'mobile') {
            document.body.classList.add('mobile-mode');
            if (mockupImage) {
                mockupImage.src = 'landing_mobile_optimized.jpg';
                mockupImage.alt = 'Woodscape Interior Design Mobile Page';
            }
            if (btnMobileView) btnMobileView.classList.add('active');
            if (btnDesktopView) btnDesktopView.classList.remove('active');
            if (mobileDrawerToggler) {
                mobileDrawerToggler.textContent = 'Desktop View';
                mobileDrawerToggler.classList.add('active');
            }
        } else {
            document.body.classList.remove('mobile-mode');
            if (mockupImage) {
                mockupImage.src = 'landing_bg_optimized_1920.jpg';
                mockupImage.alt = 'Woodscape Interior Design Landing Page';
            }
            if (btnDesktopView) btnDesktopView.classList.add('active');
            if (btnMobileView) btnMobileView.classList.remove('active');
            if (mobileDrawerToggler) {
                mobileDrawerToggler.textContent = 'Mobile View';
                mobileDrawerToggler.classList.remove('active');
            }
        }

        // Scroll back to top to prevent ratio misalignment on mode change
        window.scrollTo({ top: 0, behavior: 'auto' });

        // Update progress and spy immediately
        setTimeout(() => {
            handleScrollSpy();
            handleScrollIndicators();
        }, 100);
    }

    // Event Listeners for Switcher UI
    if (btnDesktopView) {
        btnDesktopView.addEventListener('click', () => setViewMode('desktop'));
    }
    if (btnMobileView) {
        btnMobileView.addEventListener('click', () => setViewMode('mobile'));
    }
    if (mobileDrawerToggler) {
        mobileDrawerToggler.addEventListener('click', (e) => {
            e.preventDefault();
            // Close mobile menu
            if (mobileDrawer && mobileDrawer.classList.contains('open')) {
                mobileDrawer.classList.remove('open');
                mobileNavToggle.classList.remove('open');
                mobileNavToggle.setAttribute('aria-expanded', 'false');
            }
            setViewMode(currentViewMode === 'desktop' ? 'mobile' : 'desktop');
        });
    }
});
