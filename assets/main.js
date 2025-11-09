// Lightweight loader for Plyr – loads on demand only
function loadPlyr(callback){
    if (window.Plyr){ if (callback) callback(); return; }
    if (window.__plyrLoading){
        window.__plyrQueue = window.__plyrQueue || [];
        window.__plyrQueue.push(callback);
        return;
    }
    window.__plyrLoading = true;
    window.__plyrQueue = [callback];
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/plyr@3/dist/plyr.polyfilled.js';
    s.async = true;
    s.onload = function(){
        const q = window.__plyrQueue || [];
        for (const fn of q){ try{ fn && fn(); } catch(e){ console.warn(e); } }
        window.__plyrQueue = [];
        window.__plyrLoading = false;
    };
    s.onerror = function(){
        console.warn('Plyr failed to load');
        window.__plyrLoading = false;
        window.__plyrQueue = [];
    };
    document.head.appendChild(s);
}

// Enhanced performance-optimized video player initialization
function initializePlayer(container) {
    const videoId = container.dataset.youtubeId;
    const startSeconds = container.dataset.startSeconds || 0;
    const glowColor = container.dataset.glowColor;
    const parentSection = container.closest('.content-section');

    if (!videoId || container.dataset.initialized) return;
    if (!window.Plyr){
        // Load Plyr only when needed, then retry init
        return loadPlyr(() => initializePlayer(container));
    }
    container.dataset.initialized = 'true';

    // Performance optimization: Use RAF for smooth DOM manipulation
    requestAnimationFrame(() => {
        const playerElement = document.createElement('div');
        playerElement.setAttribute('data-plyr-provider', 'youtube');
        playerElement.setAttribute('data-plyr-embed-id', videoId);

        const config = {
            youtube: {
                start: startSeconds,
                rel: 0,
                showinfo: 0,
                modestbranding: 1,
                iv_load_policy: 3,
                // Performance optimizations
                autoplay: 0,
                controls: 1,
                mute: 0,
                playsinline: 1
            },
            controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
            quality: {
                default: 'auto',
                options: ['auto', '1080p', '720p', '480p', '360p']
            }
        };

        playerElement.setAttribute('data-plyr-config', JSON.stringify(config));
        container.appendChild(playerElement);

        // Initialize player with error handling
        try {
            const player = new Plyr(playerElement);
            container.plyr = player;

            if (glowColor && parentSection) {
                // Use efficient event handlers
                player.on('play', () => {
                    parentSection.style.boxShadow = `inset 0 0 200px 70px ${glowColor}`;
                    parentSection.style.willChange = 'box-shadow';
                    try { container.style.backgroundImage = 'none'; } catch(e){}
                });
                player.on('pause', () => {
                    parentSection.style.boxShadow = 'none';
                    parentSection.style.willChange = 'auto';
                });
            }
        } catch (e) {
            console.warn('Player initialization failed for:', videoId, e);
        }
    });
}
// Enhanced DOMContentLoaded with performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    // Performance: Force scroll reset before any animations
    window.onbeforeunload = function () {
        window.scrollTo(0, 0)
    };

    // Optimized scroll tracking with debouncing
    let lastScrollY = window.scrollY;
    let scrollDirection = 'down';
    let ticking = false;

    function updateScrollDirection() {
        if (window.scrollY > lastScrollY) {
            scrollDirection = 'down';
        } else {
            scrollDirection = 'up';
        }
        lastScrollY = window.scrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateScrollDirection);
            ticking = true;
        }
    }, {
        passive: true
    });
    const sections = document.querySelectorAll('[data-nav-label]');
    const navDotsContainer = document.querySelector('.nav-dots');
    const navUp = document.getElementById('nav-up');
    const navDown = document.getElementById('nav-down');
    const navTargets = [{
        target: '#banner',
        label: 'Giriş'
    }, {
        target: '#section1-1',
        label: '1.1'
    }, {
        target: '#section1-2',
        label: '1.2'
    }, {
        target: '#section1-3',
        label: '1.3'
    }, {
        target: '#section2-1',
        label: '2.1'
    }, {
        target: '#section2-2',
        label: '2.2'
    }, {
        target: '#section2-3',
        label: '2.3'
    }, {
        target: '#section3-1',
        label: '3.1'
    }, {
        target: '#section3-2',
        label: '3.2'
    }, {
        target: '#section3-3',
        label: '3.3'
    }, {
        target: '#section4-1',
        label: '4.1'
    }, {
        target: '#section4-2',
        label: '4.2'
    }, {
        target: '#section5-1',
        label: 'Bitiş'
    }];
    navTargets.forEach(item => {
        const section = document.querySelector(item.target);
        if (!section) return;
        const dot = document.createElement('button');
        dot.classList.add('nav-dot');
        dot.setAttribute('data-target', item.target);
        dot.setAttribute('title', item.label);
        dot.addEventListener('click', () => {
            section.scrollIntoView({
                behavior: 'smooth'
            })
        });
        navDotsContainer.appendChild(dot)
    });
    const navDots = document.querySelectorAll('.nav-dot');
    const observer = new IntersectionObserver((entries) => {
        let activeSectionId = null;
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                activeSectionId = entry.target.id
            }
        });
        if (!activeSectionId) {
            const firstVisible = entries.find(e => e.isIntersecting);
            if (firstVisible) {
                activeSectionId = firstVisible.target.id
            }
        }
        if (activeSectionId) {
            navDots.forEach(dot => {
                if (dot.dataset.target === `#${activeSectionId}`) {
                    dot.classList.add('active')
                } else {
                    dot.classList.remove('active')
                }
            })
        }
        const scrollY = window.scrollY;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        navUp.style.display = scrollY > 100 ? 'block' : 'none';
        navDown.style.display = scrollY < totalHeight - 100 ? 'block' : 'none'
    }, {
        threshold: [0.1, 0.5, 0.9]
    });
    sections.forEach(section => {
        observer.observe(section)
    });

    function findCurrentSectionIndex() {
        let currentIndex = -1;
        navDots.forEach((dot, index) => {
            if (dot.classList.contains('active')) {
                currentIndex = index
            }
        });
        return currentIndex
    }
    navDown.addEventListener('click', () => {
        const currentIndex = findCurrentSectionIndex();
        if (currentIndex < sections.length - 1) {
            sections[currentIndex + 1].scrollIntoView({
                behavior: 'smooth'
            })
        }
    });
    navUp.addEventListener('click', () => {
        const currentIndex = findCurrentSectionIndex();
        if (currentIndex > 0) {
            sections[currentIndex - 1].scrollIntoView({
                behavior: 'smooth'
            })
        }
    });
    const contentWrappers = document.querySelectorAll('.content-wrapper');
    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            const wrapper = entry.target;
            wrapper.classList.remove('from-top', 'from-bottom');
            if (entry.isIntersecting) {
                if (scrollDirection === 'down') {
                    wrapper.classList.add('from-top')
                } else {
                    wrapper.classList.add('from-bottom')
                }
                wrapper.addEventListener('transitionend', function handleTransitionEnd(event) {
                    if (event.propertyName === 'transform') {
                        wrapper.removeEventListener('transitionend', handleTransitionEnd)
                    }
                });
                wrapper.classList.add('visible')
            } else {
                wrapper.classList.remove('visible')
            }
        })
    }, {
        threshold: 0.60
    });
    contentWrappers.forEach(wrapper => animationObserver.observe(wrapper));

    function startTypewriter(element, text, speed, callback) {
        let i = 0;
        element.innerHTML = "";

        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed)
            } else {
                element.style.borderRight = "none";
                if (callback) callback();
            }
        }
        type()
    }
    const typewriterElement = document.getElementById('typewriter-text');
    if (typewriterElement && typewriterElement.textContent && typewriterElement.textContent.trim().length){
        // Text already present for fast LCP; skip typing animation
        setTimeout(() => { document.body.classList.remove('loading') }, 400);
    } else {
        const textToType = "for my old two friends";
        startTypewriter(typewriterElement, textToType, 80, () => {
            setTimeout(() => { document.body.classList.remove('loading') }, 400)
        });
    }
    const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initializePlayer(entry.target);
                observer.unobserve(entry.target)
            }
        })
    }, {
        rootMargin: "200px"
    });
    document.querySelectorAll('.video-container[data-youtube-id]').forEach(container => {
        videoObserver.observe(container)
    });
    const translateButtons = document.querySelectorAll('.translate-btn');
    translateButtons.forEach(button => {
        button.addEventListener('click', () => {
            const textContainer = button.closest('.text-container');
            const originalText = textContainer.querySelector('.original-text');
            const translatedText = textContainer.querySelector('.translated-text');
            originalText.classList.toggle('hidden');
            translatedText.classList.toggle('hidden')
        })
    });

    // Arrow scroll indicator functionality for mobile/tablet screens
    function initScrollArrow() {
        const scrollArrow = document.querySelector('.arrow');
        const sections = document.querySelectorAll('.content-section');
        
        if (!scrollArrow || sections.length === 0) return;

        // Only show arrow indicator on screens smaller than 1366px
        function checkScreenSize() {
            if (window.innerWidth >= 1366) {
                scrollArrow.style.display = 'none';
                return false;
            } else {
                scrollArrow.style.display = 'block';
                return true;
            }
        }

        // Initial check
        if (!checkScreenSize()) return;

        // Handle resize
        window.addEventListener('resize', checkScreenSize);

        // Find next section to scroll to
        function getNextSection() {
            const scrollTop = window.pageYOffset;
            const windowHeight = window.innerHeight;
            const currentPosition = scrollTop + windowHeight / 2;

            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;

                // If we're in this section, return the next one
                if (currentPosition >= sectionTop && currentPosition < sectionBottom) {
                    return sections[i + 1] || null;
                }
            }
            
            // If we're before the first section, return the first section
            return sections[0];
        }

        // Intersection Observer for section visibility
        const sectionObserver = new IntersectionObserver((entries) => {
            let shouldShowArrow = false;

            entries.forEach(entry => {
                // Check if 70% of the section is visible and there's a next section
                if (entry.intersectionRatio >= 0.7) {
                    const nextSection = getNextSection();
                    if (nextSection) {
                        shouldShowArrow = true;
                    }
                }
            });

            // Show/hide arrow indicator with smooth transition
            if (shouldShowArrow) {
                scrollArrow.classList.add('show');
            } else {
                scrollArrow.classList.remove('show');
            }
        }, {
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
            rootMargin: '0px'
        });

        // Observe all sections
        sections.forEach(section => {
            sectionObserver.observe(section);
        });

        // Add click handler for arrow - scroll to next section
        scrollArrow.addEventListener('click', () => {
            const nextSection = getNextSection();
            if (nextSection) {
                nextSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // Initialize scroll arrow
    initScrollArrow();
})
