


/* ============================================
   RESPONSIVE VIEWPORT HEIGHT FIX
   Add this to your main.js file
   ============================================ */

// 1. Real Viewport Height Calculator
function setRealVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--real-vh', `${vh}px`);
}

// 2. Browser Detection (for CSS-specific fixes)
function detectBrowser() {
    const ua = navigator.userAgent.toLowerCase();
    const html = document.documentElement;
    
    // Remove all browser classes first
    html.classList.remove('browser-chrome', 'browser-firefox', 'browser-safari', 
                          'browser-edge', 'browser-brave', 'browser-opera');
    
    if (ua.indexOf('edg/') > -1 || ua.indexOf('edge/') > -1) {
        html.classList.add('browser-edge');
    } else if (ua.indexOf('brave') > -1) {
        html.classList.add('browser-brave');
    } else if (ua.indexOf('opr/') > -1 || ua.indexOf('opera') > -1) {
        html.classList.add('browser-opera');
    } else if (ua.indexOf('chrome') > -1 && ua.indexOf('edg') === -1) {
        html.classList.add('browser-chrome');
    } else if (ua.indexOf('safari') > -1 && ua.indexOf('chrome') === -1) {
        html.classList.add('browser-safari');
    } else if (ua.indexOf('firefox') > -1) {
        html.classList.add('browser-firefox');
    }
}

// 3. Device Detection
function detectDevice() {
    const html = document.documentElement;
    const width = window.innerWidth;
    
    // Remove all device classes
    html.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
    
    if (width <= 768) {
        html.classList.add('device-mobile');
    } else if (width <= 1024) {
        html.classList.add('device-tablet');
    } else {
        html.classList.add('device-desktop');
    }
}

// 4. Orientation Detection
function detectOrientation() {
    const html = document.documentElement;
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    
    html.classList.remove('orientation-portrait', 'orientation-landscape');
    html.classList.add(`orientation-${orientation}`);
    
    html.setAttribute('data-orientation', orientation);
}

// 5. iOS Safe Area Support
function handleSafeArea() {
    // iOS 11+ için safe area padding'leri ayarla
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        document.documentElement.classList.add('ios-device');
        
        // Safe area değişkenlerini ayarla
        const safeAreaTop = getComputedStyle(document.documentElement)
            .getPropertyValue('--safe-area-inset-top') || '0px';
        const safeAreaBottom = getComputedStyle(document.documentElement)
            .getPropertyValue('--safe-area-inset-bottom') || '0px';
        
        // CSS değişkenlerine aktar
        document.documentElement.style.setProperty('--ios-safe-top', safeAreaTop);
        document.documentElement.style.setProperty('--ios-safe-bottom', safeAreaBottom);
    }
}

// 6. Touch Device Detection
function detectTouch() {
    const html = document.documentElement;
    const hasTouch = 'ontouchstart' in window || 
                     navigator.maxTouchPoints > 0 || 
                     navigator.msMaxTouchPoints > 0;
    
    if (hasTouch) {
        html.classList.add('touch-device');
    } else {
        html.classList.add('no-touch');
    }
}

// 7. Throttled Resize Handler (Performance Optimization)
let resizeTimeout;
function handleResize() {
    // Debounce resize events
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        setRealVH();
        detectDevice();
        detectOrientation();
    }, 150);
}

// 8. Initialize Everything
function initResponsive() {
    // İlk yükleme
    setRealVH();
    detectBrowser();
    detectDevice();
    detectOrientation();
    detectTouch();
    handleSafeArea();
    
    // Event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
        // Orientation change'de biraz bekle (tarayıcı UI geçişi için)
        setTimeout(() => {
            setRealVH();
            detectOrientation();
        }, 100);
    });
    
    // Scroll event için (mobile address bar'ı handle etmek için)
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                setRealVH();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Focus/blur events (keyboard açılıp kapanınca)
    window.addEventListener('focus', setRealVH);
    window.addEventListener('blur', setRealVH);
}

// 9. DOM Ready - Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initResponsive);
} else {
    initResponsive();
}

/* ============================================
   LOADING SCREEN HANDLER
   ============================================ */
function initLoadingScreen() {
    // Sayfa tamamen yüklendiğinde (tüm resimler, videolar, vb.)
    window.addEventListener('load', function() {
        // Küçük bir gecikme ekle (typewriter animasyonunun tamamlanması için)
        setTimeout(function() {
            // Loading sınıfını kaldır
            document.body.classList.remove('loading');
            
            // Content section'ları yumuşak bir şekilde göster
            const contentSections = document.querySelectorAll('.content-section');
            contentSections.forEach((section, index) => {
                setTimeout(() => {
                    section.style.transition = 'opacity 0.6s ease, visibility 0.6s ease';
                    section.style.opacity = '1';
                    section.style.visibility = 'visible';
                }, index * 50); // Her section için küçük bir gecikme
            });
            
            // Scroll indicator'ı göster
            const scrollIndicator = document.querySelector('.scroll-indicator');
            if (scrollIndicator) {
                scrollIndicator.style.transition = 'opacity 0.6s ease, visibility 0.6s ease';
                scrollIndicator.style.opacity = '1';
                scrollIndicator.style.visibility = 'visible';
            }
            
            // Container'a scroll özelliğini geri ver
            const container = document.querySelector('.container');
            if (container) {
                container.style.overflow = 'scroll';
                container.style.overflowY = 'scroll';
                container.style.pointerEvents = 'auto';
            }
        }, 1500); // Typewriter animasyonu için 1.5 saniye bekle
    });
}

// Loading screen'i başlat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoadingScreen);
} else {
    initLoadingScreen();
}

// 10. Page Visibility API (tab değişimlerinde)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        setRealVH();
    }
});

// 11. Export functions (eğer modül sistemi kullanıyorsan)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setRealVH,
        detectBrowser,
        detectDevice,
        detectOrientation,
        detectTouch,
        initResponsive
    };
}

/* ============================================
   USAGE EXAMPLE IN YOUR EXISTING CODE
   ============================================ */

// Mevcut kodunuzun başına bu satırları ekleyin:
/*
// Initialize responsive fixes
initResponsive();

// Artık tüm CSS'inizde var(--real-vh) kullanabilirsiniz
// Örnek: height: calc(var(--real-vh, 1vh) * 100);
*/

/* ============================================
   MOBILE KEYBOARD HANDLING (BONUS)
   ============================================ */

// Mobile'da klavye açılınca viewport değişimini handle et
let lastHeight = window.innerHeight;
window.visualViewport?.addEventListener('resize', () => {
    const currentHeight = window.visualViewport.height;
    const diff = lastHeight - currentHeight;
    
    // Klavye açıldı
    if (diff > 150) {
        document.documentElement.classList.add('keyboard-open');
        document.body.style.height = `${currentHeight}px`;
    } 
    // Klavye kapandı
    else if (diff < -150) {
        document.documentElement.classList.remove('keyboard-open');
        document.body.style.height = '';
    }
    
    lastHeight = currentHeight;
    setRealVH();
});

/* ============================================
   DEBUG MODE (Development Only)
   ============================================ */

function debugResponsive() {
    const info = {
        'Window Width': window.innerWidth,
        'Window Height': window.innerHeight,
        'Device Pixel Ratio': window.devicePixelRatio,
        'Screen Width': screen.width,
        'Screen Height': screen.height,
        'Orientation': window.innerHeight > window.innerWidth ? 'Portrait' : 'Landscape',
        'Touch Support': 'ontouchstart' in window,
        'User Agent': navigator.userAgent,
        '--real-vh': getComputedStyle(document.documentElement).getPropertyValue('--real-vh')
    };
    
    console.table(info);
}

// Debug modunu aktif etmek için console'da çalıştır:
// debugResponsive();

/* ============================================
   PERFORMANCE MONITORING
   ============================================ */

// Resize performansını izle
let resizeCount = 0;
let resizeStart = Date.now();

const originalHandleResize = handleResize;
handleResize = function() {
    resizeCount++;
    
    // Her 50 resize event'inde performans raporu
    if (resizeCount % 50 === 0) {
        const duration = Date.now() - resizeStart;
        const avgTime = duration / resizeCount;
        
        if (avgTime > 16.67) { // 60fps için 16.67ms threshold
            console.warn(`Resize performance issue: ${avgTime.toFixed(2)}ms average`);
        }
        
        // Reset counters
        resizeCount = 0;
        resizeStart = Date.now();
    }
    
    originalHandleResize();
};

/* ============================================
   SCROLLBAR FIX FOR DESKTOP
   Add this to your main.js file
   ============================================ */

// Prevent section scrolling - only container should scroll
function preventSectionScroll() {
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        // Remove any scroll event listeners
        section.style.overflow = 'hidden';
        section.style.overflowY = 'hidden';
        section.style.overflowX = 'hidden';
        
        // Prevent scroll events
        section.addEventListener('wheel', (e) => {
            // Allow scroll to pass through to container
            e.stopPropagation();
        }, { passive: true });
        
        section.addEventListener('touchmove', (e) => {
            // Allow touch scroll to pass through to container
            e.stopPropagation();
        }, { passive: true });
    });
}

// Fix text container scrollbar behavior
function fixTextContainerScroll() {
    const textContainers = document.querySelectorAll('.text-container');
    
    textContainers.forEach(container => {
        // Text container itself shouldn't scroll
        container.style.overflow = 'hidden';
        
        // Only lyrics/translated/p-note content should scroll
        const scrollableContent = container.querySelectorAll('.lyrics, .translated, .p-note, .p-message');
        
        scrollableContent.forEach(content => {
            content.style.overflowY = 'auto';
            content.style.overflowX = 'hidden';
            
            // Hide scrollbar but keep functionality
            content.style.scrollbarWidth = 'none';
            content.style.msOverflowStyle = 'none';
        });
    });
}

// Prevent content wrapper scroll
function fixContentWrapperScroll() {
    const contentWrappers = document.querySelectorAll('.content-wrapper');
    
    contentWrappers.forEach(wrapper => {
        wrapper.style.overflow = 'hidden';
    });
}

// Main fix function
function fixDesktopScrollbars() {
    // Only run on desktop (768px+)
    if (window.innerWidth >= 768) {
        preventSectionScroll();
        fixTextContainerScroll();
        fixContentWrapperScroll();
        
        // Ensure only container has scrollbar
        const container = document.querySelector('.container');
        if (container) {
            container.style.overflowY = 'scroll';
            container.style.overflowX = 'hidden';
        }
    }
}

// Run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixDesktopScrollbars);
} else {
    fixDesktopScrollbars();
}

// Run on resize (with debounce)
let scrollFixTimeout;
window.addEventListener('resize', () => {
    clearTimeout(scrollFixTimeout);
    scrollFixTimeout = setTimeout(fixDesktopScrollbars, 150);
});

// Run when content changes (for dynamic content)
const observer = new MutationObserver(() => {
    fixDesktopScrollbars();
});

// Observe body for changes
observer.observe(document.body, {
    childList: true,
    subtree: true
});

/* ============================================
   ADDITIONAL FIX: Remove height fluctuation
   ============================================ */

// Prevent section height fluctuation
function stabilizeSectionHeights() {
    const sections = document.querySelectorAll('section');
    const vh = window.innerHeight;
    
    sections.forEach(section => {
        // Set explicit height to prevent fluctuation
        section.style.height = `${vh}px`;
        section.style.minHeight = `${vh}px`;
        section.style.maxHeight = `${vh}px`;
    });
}

// Run stabilization
window.addEventListener('load', stabilizeSectionHeights);
window.addEventListener('resize', () => {
    clearTimeout(scrollFixTimeout);
    scrollFixTimeout = setTimeout(stabilizeSectionHeights, 150);
});

/* ============================================
   DEBUG: Check for multiple scrollbars
   ============================================ */

function debugScrollbars() {
    const elementsWithScroll = [];
    
    // Check all elements
    document.querySelectorAll('*').forEach(el => {
        const styles = window.getComputedStyle(el);
        const hasScrollY = styles.overflowY === 'scroll' || styles.overflowY === 'auto';
        const hasScrollX = styles.overflowX === 'scroll' || styles.overflowX === 'auto';
        
        if (hasScrollY || hasScrollX) {
            elementsWithScroll.push({
                element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
                overflowY: styles.overflowY,
                overflowX: styles.overflowX,
                scrollHeight: el.scrollHeight,
                clientHeight: el.clientHeight,
                hasVerticalScrollbar: el.scrollHeight > el.clientHeight
            });
        }
    });
    
    console.log('Elements with scroll enabled:', elementsWithScroll);
    return elementsWithScroll;
}

// Console'da çalıştırın: debugScrollbars()

/* ============================================
   EXPORT
   ============================================ */

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fixDesktopScrollbars,
        preventSectionScroll,
        fixTextContainerScroll,
        fixContentWrapperScroll,
        stabilizeSectionHeights,
        debugScrollbars
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const typewriterElement = document.getElementById('typewriter');
    const siteHeader = document.querySelector('.site-header');
    const heroSection = document.querySelector('.hero');

    // Tarayıcı tespiti ve CSS custom property ayarlama
    (function detectBrowserAndSetVh() {
        const ua = navigator.userAgent.toLowerCase();
        let browserClass = '';
        
        // Tarayıcı tespiti
        if (ua.includes('edg/') || ua.includes('edge')) {
            browserClass = 'browser-edge';
        } else if (ua.includes('brave')) {
            browserClass = 'browser-brave';
        } else if (ua.includes('opr/') || ua.includes('opera')) {
            browserClass = 'browser-opera';
        } else if (ua.includes('firefox')) {
            browserClass = 'browser-firefox';
        } else if (ua.includes('chrome')) {
            browserClass = 'browser-chrome';
        } else if (ua.includes('safari')) {
            browserClass = 'browser-safari';
        }
        
        if (browserClass) {
            document.documentElement.classList.add(browserClass);
        }
        
        // Gerçek viewport yüksekliğini hesapla ve CSS variable olarak ayarla
        function setRealVh() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--real-vh', `${vh}px`);
        }
        
        setRealVh();
        window.addEventListener('resize', setRealVh);
        window.addEventListener('orientationchange', () => {
            setTimeout(setRealVh, 100);
        });
    })();

    console.log('Typewriter element found:', typewriterElement);

    // Header'ı hemen göster
    if (siteHeader) {
        siteHeader.classList.add('show');
    }

    // Normal scroll'u etkinleştir
    body.style.overflow = 'auto';

    // Basit typewriter efekti
    if (typewriterElement) {
        const text = "for those i still long for";
        let i = 0;
        const speed = 130;

        // Yazma öncesi sıfırla ve imleci aktif et
        typewriterElement.textContent = '';
        typewriterElement.classList.remove('typing-done');
        typewriterElement.style.animation = 'blink-caret .75s step-end infinite';
        
        // Mobilde daha ince imleç
        const isMobile = window.innerWidth <= 768;
        typewriterElement.style.borderRight = isMobile ? '.12em solid orange' : '.18em solid orange';

        function typeWriter() {
            if (i < text.length) {
                typewriterElement.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            } else {
                // Metin bittiğinde imleci kaldır
                typewriterElement.classList.add('typing-done');
                typewriterElement.style.animation = 'none';
                typewriterElement.style.borderRight = 'none';
            }
        }

        typeWriter();
    }

    // 1024px ve altinda hero disinda header'i gizle
    if (siteHeader && heroSection) {
        const hideHeaderObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    siteHeader.classList.remove('hide-on-mobile');
                    document.body.classList.add('on-hero');
                } else {
                    siteHeader.classList.add('hide-on-mobile');
                    document.body.classList.remove('on-hero');
                }
            });
        }, { threshold: 0.1 });

        hideHeaderObserver.observe(heroSection);
    }

    // Scroll-based animasyonları başlat
    initScrollAnimations();

    // Plyr.io oynatıcılarını başlat
    const players = new Map();
    let isScrolling = false;
    let scrollTimeout;
    
    document.querySelectorAll('.player').forEach((playerDiv) => {
        const container = playerDiv.closest('.video-container') || playerDiv.parentElement;
        const poster = playerDiv.getAttribute('poster');
        if (!container) return;
        const ph = document.createElement('button');
        ph.type = 'button'; ph.className = 'yt-placeholder';
        Object.assign(ph.style, { position: 'absolute', inset: '0', border: '0', padding: '0', margin: '0', backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: getComputedStyle(container).borderRadius || '8px' });
        if (poster) ph.style.backgroundImage = `url(${poster})`;
        const icon = document.createElement('span'); Object.assign(icon.style, { width: '64px', height: '64px', borderRadius: '999px', background: 'rgba(255,255,255,0.92)', boxShadow: '0 6px 16px rgba(0,0,0,0.35)', position: 'relative' });
        const tri = document.createElement('span'); Object.assign(tri.style, { position: 'absolute', left: '26px', top: '20px', width: '0', height: '0', borderStyle: 'solid', borderWidth: '12px 0 12px 20px', borderColor: 'transparent transparent transparent #000' });
        icon.appendChild(tri); ph.appendChild(icon);
        container.style.position = container.style.position || 'relative';
        container.appendChild(ph);
        ph.addEventListener('click', () => { 
            const plyr = new Plyr(playerDiv); 
            players.set(playerDiv, plyr); 
            ph.remove(); 
            try { plyr.play(); } catch (e) { } 
        }, { once: true });
    });

    // Scroll ile video duraklatma fonksiyonu
    function pauseAllVideosOnScroll() {
        const container = document.querySelector('.container');
        if (!container) return;

        container.addEventListener('scroll', () => {
            // Scroll başladığında tüm videoları duraklat
            if (!isScrolling) {
                isScrolling = true;
                players.forEach((plyr) => {
                    if (plyr.playing) {
                        plyr.pause();
                        // Video'ya scroll-paused işareti ekle
                        plyr.elements.container.setAttribute('data-scroll-paused', 'true');
                    }
                });
            }

            // Scroll timeout'u resetle
            clearTimeout(scrollTimeout);
            
            // Scroll durduğunda 1 saniye bekle, sonra videoları tekrar oynatmaya hazır hale getir
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
                // İsteğe bağlı: Scroll durduktan sonra videoları otomatik oynat
                // players.forEach((plyr) => {
                //     if (plyr.elements.container.getAttribute('data-scroll-paused') === 'true') {
                //         plyr.play();
                //         plyr.elements.container.removeAttribute('data-scroll-paused');
                //     }
                // });
            }, 1000);
        }, { passive: true });
    }

    // Scroll video duraklatmayı başlat
    pauseAllVideosOnScroll();

    // Line by line animation functions
    function wrapTextLines(element) {
        if (!element) return;
        
        const paragraphs = element.querySelectorAll('p');
        paragraphs.forEach(p => {
            const html = p.innerHTML;
            // Split by <br> tags and wrap each line in a span
            // Allow multiple breaks by preserving empty lines as <br>
            const lines = html.split(/<br\s*\/?>/i);
            const wrappedLines = lines.map(line => {
                if (line.trim() === '') {
                    return '<br>';
                }
                return `<span class="text-line">${line.trim()}</span>`;
            }).join('');
            p.innerHTML = wrappedLines;
        });
    }
    
    function animateTextLines(element, delay = 0) {
        if (!element) return;
        
        // Clear any existing timeout
        if (element.dataset.animationTimeout) {
            clearTimeout(parseInt(element.dataset.animationTimeout));
        }

        const timeoutId = setTimeout(() => {
            const lines = element.querySelectorAll('.text-line, .song-divider');
            lines.forEach((line, index) => {
                // Calculate delay based on index to ensure continuous flow across paragraphs/dividers
                // Base delay is 0.1s per line
                line.style.transitionDelay = `${(index + 1) * 0.1}s`;
                line.classList.add('animate-in');
            });
            element.removeAttribute('data-animation-timeout');
        }, delay);
        
        element.dataset.animationTimeout = timeoutId;
    }
    
    function resetTextAnimation(element) {
        if (!element) return;
        
        // Clear pending animation
        if (element.dataset.animationTimeout) {
            clearTimeout(parseInt(element.dataset.animationTimeout));
            element.removeAttribute('data-animation-timeout');
        }
        
        const lines = element.querySelectorAll('.text-line, .song-divider');
        lines.forEach(line => {
            line.style.transitionDelay = ''; // Clear inline delay
            line.classList.remove('animate-in');
        });
    }
    
    function showTextWithAnimation(hideElement, showElement, animationDelay = 300) {
        // Reset and hide current element
        if (hideElement) {
            resetTextAnimation(hideElement);
            hideElement.classList.add('hidden');
        }
        
        // Show and animate new element
        if (showElement) {
            showElement.classList.remove('hidden');
            animateTextLines(showElement, 100);
        }
    }
    
    function showHiddenTextWithAnimation(hiddenElement) {
        if (!hiddenElement) return;
        
        hiddenElement.classList.add('show');
        animateTextLines(hiddenElement, 200);
    }
    
    // Initialize text wrapping on page load
    function initializeTextAnimations() {
        const allTextContainers = document.querySelectorAll('.lyrics, .translated, .p-note, .p-message');
        allTextContainers.forEach(container => {
            wrapTextLines(container);
        });
        
        // Animate initial visible texts when they come into view
        const contentWrappers = document.querySelectorAll('.content-wrapper, #end');
        const textObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const textContainer = entry.target.querySelector('.text-container, .tc-15, .end-container');
                    if (textContainer) {
                        const visibleText = textContainer.querySelector('.lyrics:not(.hidden), .translated:not(.hidden), .p-message:not(.hidden)');
                        if (visibleText) {
                            // Wait for container animation to finish (approx 1000ms)
                            animateTextLines(visibleText, 300);
                        }
                    }
                } else {
                    // Reset animations when leaving view
                    const textContainer = entry.target.querySelector('.text-container, .tc-15, .end-container');
                    if (textContainer) {
                        const allTexts = textContainer.querySelectorAll('.lyrics, .translated, .p-note, .p-message');
                        allTexts.forEach(text => resetTextAnimation(text));
                    }
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -20% 0px'
        });
        
        contentWrappers.forEach(wrapper => {
            textObserver.observe(wrapper);
        });
    }

    // Initialize text animations after DOM is loaded
    initializeTextAnimations();
    
    // Setup new text navigation (replaces old buttons)
    setupTextNavigation();

    function setupTextNavigation() {
        const textContainers = document.querySelectorAll('.text-container, .tc-15, .tc-16, .end-container');
        textContainers.forEach(container => {
            // 1. Remove old buttons
            const oldButtons = container.querySelectorAll('.translate-btn, .button2');
            oldButtons.forEach(btn => btn.remove());

            // 2. Identify text sections
            // For .end-container, use .p-message only
            let sections = [];
            if (container.classList.contains('end-container')) {
                sections = Array.from(container.querySelectorAll('.p-message'));
            } else {
                const original = container.querySelector('.lyrics');
                const translated = container.querySelector('.translated');
                const hiddenTexts = container.querySelectorAll('.p-note');
                if (original) sections.push(original);
                if (translated) sections.push(translated);
                hiddenTexts.forEach(h => sections.push(h));
            }
            if (sections.length === 0) return;

            // 3. Create Navigation UI
            const nav = document.createElement('div');
            nav.className = 'text-navigation';

            // Left Arrow
            const leftArrow = document.createElement('button');
            leftArrow.className = 'nav-arrow prev';
            leftArrow.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';

            // Dots Container
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'nav-dots';

            // Create dots
            sections.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.className = 'nav-dot';
                if (index === 0) dot.classList.add('active');
                dotsContainer.appendChild(dot);
            });

            // Right Arrow
            const rightArrow = document.createElement('button');
            rightArrow.className = 'nav-arrow next';
            rightArrow.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';

            nav.appendChild(leftArrow);
            nav.appendChild(dotsContainer);
            nav.appendChild(rightArrow);

            container.appendChild(nav);

            // 4. Logic
            let currentIndex = 0;

            // Helper to update button visibility
            const updateButtons = (index) => {
                leftArrow.style.visibility = index === 0 ? 'hidden' : 'visible';
                rightArrow.style.visibility = index === sections.length - 1 ? 'hidden' : 'visible';
            };

            // Initialize visibility: Ensure only first is visible
            sections.forEach((sec, idx) => {
                if (idx === 0) {
                    sec.classList.remove('hidden');
                    if (sec.classList.contains('p-note') || sec.classList.contains('p-message')) sec.classList.add('show');
                    animateTextLines(sec, 100);
                } else {
                    sec.classList.add('hidden');
                    sec.classList.remove('show');
                    resetTextAnimation(sec);
                }
            });
            
            // Initialize buttons
            updateButtons(currentIndex);

            const updateState = (newIndex) => {
                // Prevent out of bounds
                if (newIndex < 0 || newIndex >= sections.length) return;

                const currentSection = sections[currentIndex];
                const nextSection = sections[newIndex];

                // Hide current
                resetTextAnimation(currentSection);
                currentSection.classList.add('hidden');
                currentSection.classList.remove('show');

                // Show next
                nextSection.classList.remove('hidden');
                if (nextSection.classList.contains('p-note') || nextSection.classList.contains('p-message')) {
                    nextSection.classList.add('show');
                }
                animateTextLines(nextSection, 100);

                // Update dots
                const dots = dotsContainer.querySelectorAll('.nav-dot');
                dots.forEach((d, i) => {
                    if (i === newIndex) d.classList.add('active');
                    else d.classList.remove('active');
                });

                currentIndex = newIndex;
                updateButtons(currentIndex);

                // Fit text if needed (for tc-15, tc-16)
                if (container.classList.contains('tc-15') || container.classList.contains('tc-16')) {
                    setTimeout(() => fitTextToContainer(container), 30);
                }
            };

            // Expose reset function for end-container
            if (container.classList.contains('end-container')) {
                container.resetNavigation = () => {
                    // Hide all sections first to prevent stacking
                    sections.forEach(sec => {
                        sec.classList.add('hidden');
                        sec.classList.remove('show');
                        resetTextAnimation(sec);
                    });
                    
                    // Show first section
                    currentIndex = 0;
                    const first = sections[0];
                    first.classList.remove('hidden');
                    first.classList.add('show');
                    animateTextLines(first, 100);
                    
                    // Reset dots
                    const dots = dotsContainer.querySelectorAll('.nav-dot');
                    dots.forEach((d, i) => {
                        if (i === 0) d.classList.add('active');
                        else d.classList.remove('active');
                    });
                    
                    // Reset buttons
                    updateButtons(0);
                };
            }

            leftArrow.addEventListener('click', () => {
                updateState(currentIndex - 1);
            });
            rightArrow.addEventListener('click', () => {
                updateState(currentIndex + 1);
            });

            // Mobile swipe support (left/right) for text navigation
            // Keeps vertical scrolling intact by only capturing the gesture when horizontal intent is clear.
            let touchStartX = 0;
            let touchStartY = 0;
            let touchLockedDirection = null; // 'x' | 'y' | null

            const onTouchStart = (e) => {
                if (!e.touches || e.touches.length !== 1) return;
                const t = e.touches[0];
                touchStartX = t.clientX;
                touchStartY = t.clientY;
                touchLockedDirection = null;
            };

            const onTouchMove = (e) => {
                if (!e.touches || e.touches.length !== 1) return;
                const t = e.touches[0];
                const dx = t.clientX - touchStartX;
                const dy = t.clientY - touchStartY;

                // Decide gesture direction once
                if (!touchLockedDirection) {
                    const absDx = Math.abs(dx);
                    const absDy = Math.abs(dy);
                    if (absDx < 10 && absDy < 10) return;
                    touchLockedDirection = absDx > absDy * 1.3 ? 'x' : 'y';
                }

                // If it's a horizontal swipe, prevent vertical scroll jitter
                if (touchLockedDirection === 'x') {
                    e.preventDefault();
                }
            };

            const onTouchEnd = (e) => {
                // Only act if we locked to horizontal
                if (touchLockedDirection !== 'x') return;

                const endTouch = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : null;
                if (!endTouch) return;

                const dx = endTouch.clientX - touchStartX;
                const absDx = Math.abs(dx);
                const threshold = 45; // px
                if (absDx < threshold) return;

                // Swipe left => next, swipe right => prev
                if (dx < 0) updateState(currentIndex + 1);
                else updateState(currentIndex - 1);
            };

            // Attach to the container (works for .text-container/.tc-*/.end-container)
            container.addEventListener('touchstart', onTouchStart, { passive: true });
            container.addEventListener('touchmove', onTouchMove, { passive: false });
            container.addEventListener('touchend', onTouchEnd, { passive: true });
        });
    }

    function fitTextToContainer(container) {
        if (!container) return;
        const activeText = container.querySelector('.lyrics:not(.hidden), .translated:not(.hidden), .p-message:not(.hidden)');
        const p = activeText ? activeText.querySelector('p') : container.querySelector('p');
        if (!p) return;
        p.style.whiteSpace = 'normal';
        p.style.wordBreak = 'break-word';
        p.style.overflowWrap = 'anywhere';
        p.style.fontSize = '';
        p.style.lineHeight = '';
        let fontSize = parseFloat(getComputedStyle(p).fontSize) || 16;
        const min = 10;
        let safety = 60;
        while (p.scrollHeight > container.clientHeight && fontSize > min && safety-- > 0) {
            fontSize -= 0.5;
            p.style.fontSize = fontSize + 'px';
            p.style.lineHeight = '1.45';
        }
    }




    // Scroll-based animasyonlar için Intersection Observer
    function initScrollAnimations() {
        const contentWrappers = document.querySelectorAll('.content-wrapper, #end');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                } else {
                    entry.target.classList.remove('animate-in');
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -10% 0px'
        });

        contentWrappers.forEach(wrapper => {
            observer.observe(wrapper);
        });
    }

    const tc15 = document.querySelector('.tc-15');
    if (tc15) {
        const runFit = () => fitTextToContainer(tc15);
        window.addEventListener('resize', runFit);
        runFit();
    }

    // End Section Background Interaction
    const endSection = document.getElementById('end');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    // Son section'a gelindiğinde scroll-indicator'ı gizle
    if (endSection && scrollIndicator) {
        const scrollIndicatorObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    scrollIndicator.classList.add('hide-on-end');
                } else {
                    scrollIndicator.classList.remove('hide-on-end');
                }
            });
        }, { threshold: 0.3 });
        
        scrollIndicatorObserver.observe(endSection);
    }
    
    if (endSection) {
        const leftActives = endSection.querySelectorAll('.left-active');
        const rightActives = endSection.querySelectorAll('.right-active');
        const endContainer = endSection.querySelector('.end-container');

        const resetBg = () => {
            endSection.classList.remove('bg-left');
            endSection.classList.remove('bg-right');
        };

        leftActives.forEach(el => {
            el.addEventListener('mouseenter', () => {
                endSection.classList.add('bg-left');
                endSection.classList.remove('bg-right');
            });
            el.addEventListener('mouseleave', resetBg);
        });

        rightActives.forEach(el => {
            el.addEventListener('mouseenter', () => {
                endSection.classList.add('bg-right');
                endSection.classList.remove('bg-left');
            });
            el.addEventListener('mouseleave', resetBg);
        });

        // Auth form toggle
        initAuthOverlays();

        function initAuthOverlays() {
            const endSectionEl = document.getElementById('end');
            if (!endSectionEl) return;

            const endContainer = endSectionEl.querySelector('.end-container');
            const defaultBox = endSectionEl.querySelector('.end-container-default');
            const authLeft = document.getElementById('auth-form-left');
            const authRight = document.getElementById('auth-form-right');
            const nav = endContainer ? endContainer.querySelector('.text-navigation') : null;
            const messages = defaultBox ? Array.from(defaultBox.querySelectorAll('.p-message')) : [];

            const hideMessages = () => {
                messages.forEach(msg => {
                    resetTextAnimation(msg);
                    msg.classList.add('hidden');
                    msg.classList.remove('show');
                });
                if (nav) nav.style.display = 'none';
            };

            const restoreMessages = () => {
                if (nav) nav.style.display = '';
                if (endContainer && typeof endContainer.resetNavigation === 'function') {
                    endContainer.resetNavigation();
                } else if (messages.length) {
                    messages.forEach((msg, idx) => {
                        msg.classList.toggle('hidden', idx !== 0);
                        msg.classList.toggle('show', idx === 0);
                        if (idx === 0) {
                            animateTextLines(msg, 100);
                        } else {
                            resetTextAnimation(msg);
                        }
                    });
                }
            };

            const closeAuth = () => {
                [authLeft, authRight].forEach(form => {
                    if (form) {
                        form.style.display = 'none';
                        const formEl = form.querySelector('form');
                        if (formEl) formEl.reset();
                    }
                });
                restoreMessages();
            };

            const showAuth = (side) => {
                hideMessages();
                if (authLeft) authLeft.style.display = side === 'left' ? 'flex' : 'none';
                if (authRight) authRight.style.display = side === 'right' ? 'flex' : 'none';
            };

            endSectionEl.querySelectorAll('.left-active').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    showAuth('left');
                });
            });

            endSectionEl.querySelectorAll('.right-active').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    showAuth('right');
                });
            });

            // Dışarı tıklandığında auth formunu kapat
            // end-container 'ın üzerinde ama left-active/right-active dışında tıklandığında
            endSectionEl.addEventListener('click', (e) => {
                const isAuthActive = (authLeft && authLeft.style.display === 'flex') || 
                                     (authRight && authRight.style.display === 'flex');
                if (!isAuthActive) return;
                
                // Tıklanan elemanı kontrol et
                const target = e.target;
                const isLeftActive = target.closest('.left-active');
                const isRightActive = target.closest('.right-active');
                const isAuthBox = target.closest('.auth-box');
                
                // Eğer left-active, right-active veya auth-box içinde değilse kapat
                if (!isLeftActive && !isRightActive && !isAuthBox) {
                    closeAuth();
                }
            });

            // Expose for inline cancel button
            window.closeAuth = closeAuth;
        }
    }
});


	$(document).on("scroll", function(){
		if
      ($(document).scrollTop() > 100){
		  $(".site-header").addClass("shrink");
		}
		else
		{
			$(".site-header").removeClass("shrink");
		}
	});

    document.getElementById('security-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const answerInput = document.getElementById('sec-q1').value;
    const errorMsg = document.getElementById('error-message');
    const lockInterface = document.getElementById('lock-interface');
    const secretContent = document.getElementById('secret-content');
    
    // Cloudflare Worker Adresin
    const WORKER_URL = "https://SENIN-WORKER-ADRESIN.workers.dev"; 

    try {
        // Butonu "Yükleniyor..." yap
        const btn = document.querySelector('.unlock-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kontrol ediliyor...';
        
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answer: answerInput })
        });

        const data = await response.json();

        if (data.success) {
            // Animasyonla kilidi kaldır
            lockInterface.style.opacity = '0';
            setTimeout(() => {
                lockInterface.style.display = 'none';
                
                // Gizli içeriği bas
                secretContent.innerHTML = data.html;
                secretContent.style.opacity = '0';
                secretContent.style.display = 'block';
                
                // Yavaşça göster
                setTimeout(() => {
                   secretContent.style.opacity = '1'; 
                }, 100);
            }, 500);
            
        } else {
            errorMsg.style.display = 'block';
            btn.innerHTML = originalText;
            // Giriş kutusunu salla (Hata efekti)
            document.querySelector('.glass-input').classList.add('shake');
            setTimeout(() => document.querySelector('.glass-input').classList.remove('shake'), 500);
        }

    } catch (error) {
        console.error('Hata:', error);
        btn.innerHTML = originalText;
    }
});


    // Auth form toggle

