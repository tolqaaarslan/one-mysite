document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const typewriterElement = document.getElementById('typewriter');
    const siteHeader = document.querySelector('.site-header');
    const heroSection = document.querySelector('.hero');

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
        typewriterElement.style.borderRight = '.18em solid orange';

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

    // 380px ve altinda hero disinda header'i gizle
    if (siteHeader && heroSection) {
        const hideHeaderObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    siteHeader.classList.remove('hide-on-mobile');
                } else {
                    siteHeader.classList.add('hide-on-mobile');
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
                if (container.classList.contains('end-container')) {
                    cancelCreditsAnimation();
                }
                updateState(currentIndex - 1);
            });
            rightArrow.addEventListener('click', () => {
                if (container.classList.contains('end-container')) {
                    cancelCreditsAnimation();
                }
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

                if (container.classList.contains('end-container')) {
                    cancelCreditsAnimation();
                }

                // Swipe left => next, swipe right => prev
                if (dx < 0) updateState(currentIndex + 1);
                else updateState(currentIndex - 1);
            };

            // Attach to the container (works for .text-container/.tc-*/.end-container)
            container.addEventListener('touchstart', onTouchStart, { passive: true });
            container.addEventListener('touchmove', onTouchMove, { passive: false });
            container.addEventListener('touchend', onTouchEnd, { passive: true });
        });

        // Initialize credits observer
        initCreditsObserver();
    }

    // Credits Animation Logic
    let creditsTimer = null;
    let creditsStarted = false;
    let creditsCancelled = false;

    function cancelCreditsAnimation() {
        if (creditsTimer) clearTimeout(creditsTimer);
        creditsCancelled = true;
        
        // If currently in credits mode, reset to manual mode immediately
        const container = document.querySelector('.end-container');
        if (container && container.classList.contains('credits-mode')) {
             resetCreditsAnimation();
        }
    }

    function resetCreditsAnimation() {
        const container = document.querySelector('.end-container');
        if (!container) return;

        // Remove wrapper and restore messages
        const wrapper = container.querySelector('.credits-wrapper');
        if (wrapper) {
            const messages = Array.from(wrapper.querySelectorAll('.p-message'));
            const nav = container.querySelector('.text-navigation');
            messages.forEach(m => {
                if (nav) {
                    container.insertBefore(m, nav);
                } else {
                    container.appendChild(m);
                }
            });
            wrapper.remove();
        }

        container.classList.remove('credits-mode');
        creditsStarted = false;
        
        // Reset navigation to start
        if (container.resetNavigation) {
            container.resetNavigation();
        }
    }

    function initCreditsObserver() {
        const endSection = document.getElementById('end');
        if (!endSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!creditsStarted && !creditsCancelled) {
                        creditsTimer = setTimeout(startCreditsAnimation, 5000);
                    }
                } else {
                    // Leaving section
                    if (creditsTimer) clearTimeout(creditsTimer);
                    
                    // Reset everything
                    resetCreditsAnimation();
                    creditsCancelled = false; // Allow restart on next entry
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(endSection);
    }

    function startCreditsAnimation() {
        if (creditsStarted || creditsCancelled) return;
        creditsStarted = true;
        
        const container = document.querySelector('.end-container');
        if (!container) return;
        
        container.classList.add('credits-mode');
        
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'credits-wrapper';
        
        // Move messages
        const messages = Array.from(container.querySelectorAll('.p-message'));
        messages.forEach(m => {
            m.classList.remove('hidden');
            m.classList.add('show');
            wrapper.appendChild(m);
        });
        
        // Loop logic
        wrapper.addEventListener('animationend', () => {
            resetCreditsAnimation();
            // Restart loop
            creditsTimer = setTimeout(startCreditsAnimation, 5000);
        });
        
        container.appendChild(wrapper);
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
    
    if (endSection) {
        const leftActives = endSection.querySelectorAll('.left-active');
        const rightActives = endSection.querySelectorAll('.right-active');
        const endContainer = endSection.querySelector('.end-container');

        const resetBg = () => {
            endSection.classList.remove('bg-left');
            endSection.classList.remove('bg-right');
        };

        // Stop credits on interaction
        const stopCredits = () => {
            if (typeof cancelCreditsAnimation === 'function') {
                cancelCreditsAnimation();
            }
        };

        if (endContainer) {
            endContainer.addEventListener('mouseenter', stopCredits);
        }

        leftActives.forEach(el => {
            el.addEventListener('mouseenter', () => {
                stopCredits();
                endSection.classList.add('bg-left');
                endSection.classList.remove('bg-right');
            });
            el.addEventListener('mouseleave', resetBg);
        });

        rightActives.forEach(el => {
            el.addEventListener('mouseenter', () => {
                stopCredits();
                endSection.classList.add('bg-right');
                endSection.classList.remove('bg-left');
            });
            el.addEventListener('mouseleave', resetBg);
        });
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
