/**
 * Plyr.io video oynatıcılarını tembel yükleme (lazy load) ile başlatır.
 * Video, sadece kullanıcı poster resmine tıkladığında yüklenir ve oynatılır.
 * Bu, sayfanın başlangıç yükleme performansını önemli ölçüde artırır.
 */
function initPlyrPlayers() {
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
        if (poster) {
            ph.style.backgroundImage = `url(${poster})`;
        }
        const icon = document.createElement('span'); Object.assign(icon.style, { width: '64px', height: '64px', borderRadius: '999px', background: 'rgba(255,255,255,0.92)', boxShadow: '0 6px 16px rgba(0,0,0,0.35)', position: 'relative' });
        const tri = document.createElement('span'); Object.assign(tri.style, { position: 'absolute', left: '26px', top: '20px', width: '0', height: '0', borderStyle: 'solid', borderWidth: '12px 0 12px 20px', borderColor: 'transparent transparent transparent #000' });
        icon.appendChild(tri); ph.appendChild(icon);
        container.style.position = container.style.position || 'relative';
        container.appendChild(ph);

        ph.addEventListener('click', () => {
            const plyr = new Plyr(playerDiv);
            players.set(playerDiv, plyr);
            ph.remove();
            try {
                plyr.play();
            } catch (e) {
                console.error("Video oynatılamadı:", e);
            }
        }, { once: true });
    });

    // Scroll sırasında oynatılan videoları duraklat
    function pauseAllVideosOnScroll() {
        // Eski .container yerine window üzerinde dinliyoruz
        window.addEventListener('scroll', () => {
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

            // Scroll durduktan sonra videoları tekrar oynatmaya hazır hale getir
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 1000);
        }, { passive: true });
    }

    pauseAllVideosOnScroll();
}

/**
 * Metinleri satır satır animasyonlu göstermek için gerekli fonksiyonları içerir.
 * Metinleri `.text-line` span'lerine sarar ve Intersection Observer ile göründüklerinde animasyon uygular.
 */
function initTextAnimations() {
    function wrapTextLines(element) {
        if (!element) return;
        
        const paragraphs = element.querySelectorAll('p');
        paragraphs.forEach(p => {
            const html = p.innerHTML;
            // Metni <br> etiketlerinden böl ve her satırı bir span içine al
            const lines = html.split(/<br\s*\/?>/gi);
            const wrappedLines = lines.map(line => {
                if (line.trim() === '') {
                    // Boş satırları korumak için <br> olarak bırak
                    return ''; 
                }
                // Her satırı animasyon için bir span ile sarmala
                return `<span class="text-line">${line.trim()}</span>`;
            }).join('<br>'); // Satırları tekrar <br> ile birleştir
            p.innerHTML = wrappedLines;
        });
    }
    
    function animateTextLines(element) {
        if (!element) return;
        
        // Clear any existing timeout
        if (element.dataset.animationTimeout) {
            clearTimeout(parseInt(element.dataset.animationTimeout));
        }

        const timeoutId = setTimeout(() => { // Animasyonun başlaması için küçük bir gecikme
            const lines = element.querySelectorAll('.text-line, .song-divider');
            lines.forEach((line, index) => {
                line.style.transitionDelay = `${(index + 1) * 0.1}s`;
                line.classList.add('animate-in');
            });
            element.removeAttribute('data-animation-timeout');
        }, 100);
        
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
    const allTextContainers = document.querySelectorAll('.lyrics, .translated, .p-note, .p-message');
    allTextContainers.forEach(container => {
        wrapTextLines(container);
    });

    // Global scope'a fonksiyonları ekleyerek diğer modüllerin erişimini sağla
    window.animateTextLines = animateTextLines;
    window.resetTextAnimation = resetTextAnimation;
}

/**
 * Şarkı sözleri, çeviriler ve notlar arasında geçiş yapmak için navigasyon okları ve noktaları oluşturur.
 */
function initTextNavigation() {
    const textContainers = document.querySelectorAll('.bg-black\\/30, .end-container');
        textContainers.forEach(container => {
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
                // Sadece görünür p-note'ları al, diğerlerini alma
                const visibleNotes = Array.from(hiddenTexts).filter(note => !note.classList.contains('hidden'));
                sections.push(...visibleNotes);
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
                    if (window.animateTextLines) window.animateTextLines(sec);
                } else {
                    sec.classList.add('hidden');
                    sec.classList.remove('show');
                    if (window.resetTextAnimation) window.resetTextAnimation(sec);
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
                if (window.resetTextAnimation) window.resetTextAnimation(currentSection);
                currentSection.classList.add('hidden');
                currentSection.classList.remove('show');

                // Show next
                nextSection.classList.remove('hidden');
                if (nextSection.classList.contains('p-note') || nextSection.classList.contains('p-message')) { // p-note'lar için show class'ı
                    nextSection.classList.add('show');
                }
                if (window.animateTextLines) window.animateTextLines(nextSection);

                // Update dots
                const dots = dotsContainer.querySelectorAll('.nav-dot');
                dots.forEach((d, i) => {
                    if (i === newIndex) d.classList.add('active');
                    else d.classList.remove('active');
                });

                currentIndex = newIndex;
                updateButtons(currentIndex);
            };

            // Expose reset function for end-container
            if (container.classList.contains('end-container')) {
                container.resetNavigation = () => {
                    // Hide all sections first to prevent stacking
                    sections.forEach(sec => {
                        sec.classList.add('hidden');
                        sec.classList.remove('show');
                        if (window.resetTextAnimation) window.resetTextAnimation(sec);
                    });
                    
                    // Show first section
                    currentIndex = 0;
                    const first = sections[0];
                    first.classList.remove('hidden');
                    if (first.classList.contains('p-note') || first.classList.contains('p-message')) first.classList.add('show');
                    if (window.animateTextLines) window.animateTextLines(first);
                    
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
        });

    // Kredi animasyonunu başlat
    initCreditsObserver();
}

/**
 * Son bölümde, belirli bir süre sonra otomatik olarak akan bir "credits" (jenerik) animasyonu başlatır.
 */
function initCreditsObserver() {
    // Credits Animation Logic
    let creditsTimer = null;
    let creditsStarted = false;
    let creditsCancelled = false;

    function cancelCreditsAnimation() {
        if (creditsTimer) clearTimeout(creditsTimer);
        creditsCancelled = true;
        
        // If currently in credits mode, reset to manual mode immediately
        const container = document.querySelector('.end-container');
        if (container?.classList.contains('credits-mode')) {
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

    const endSection = document.getElementById('end');
    if (!endSection) return;

    const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!creditsStarted && !creditsCancelled) {
                        creditsTimer = setTimeout(startCreditsAnimation, 15000); // 15 saniye bekle
                    }
                } else {
                    // Leaving section
                    if (creditsTimer) clearTimeout(creditsTimer);

                    resetCreditsAnimation();
                    creditsCancelled = false; // Allow restart on next entry
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(endSection);

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
            // Animasyon bittiğinde, döngüyü yeniden başlatmak için sıfırla
            resetCreditsAnimation();
            creditsTimer = setTimeout(startCreditsAnimation, 15000);
        });
        
        container.appendChild(wrapper);
    }
}

/**
 * Son bölümdeki arka plan resmini, fare imlecinin konumuna göre değiştirir.
 */
function initEndSectionInteraction() {
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
            if (typeof window.cancelCreditsAnimation === 'function') {
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
}

/**
 * Sayfa kaydırıldığında header'ın görünümünü değiştirir.
 * Orijinal tasarımdaki `.shrink` sınıfının işlevini görür.
 */
function initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    let isTicking = false;

    const updateHeader = () => {
        if (window.scrollY > 50) {
            header.setAttribute('data-scrolled', 'true');
            // Tailwind ile bu daha dinamik yapılabilir, şimdilik stili doğrudan değiştiriyoruz.
            header.style.background = 'rgba(0, 0, 0, 0.4)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.setAttribute('data-scrolled', 'false');
            header.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)';
            header.style.backdropFilter = 'none';
        }
        isTicking = false;
    };

    window.addEventListener('scroll', () => {
        if (!isTicking) {
            window.requestAnimationFrame(updateHeader);
            isTicking = true;
        }
    }, { passive: true });
}

/**
 * Ana sayfadaki daktilo animasyonunu başlatır.
 */
function initTypewriter() {
    const typewriterElement = document.getElementById('typewriter');
    if (!typewriterElement) return;

    // Metni boşaltarak animasyonun her zaman çalışmasını sağla
    typewriterElement.textContent = '';

    const text = "for those i still long for";
    let i = 0;
    const speed = 90;

    function type() {
        if (i < text.length) {
            typewriterElement.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            // Animasyon bitince imleci kaldır
            setTimeout(() => {
                typewriterElement.style.borderRightColor = 'transparent';
                typewriterElement.style.animation = 'none';
            }, 1500);
        }
    }

    // Gözlemci ile sadece göründüğünde başlat
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            setTimeout(type, 500); // Sayfa yüklenir yüklenmez başlamasın
            observer.disconnect(); // Bir kez çalıştıktan sonra gözlemciyi durdur
        }
    }, { threshold: 0.5 });

    observer.observe(typewriterElement);
}

/**
 * Ana uygulama başlatıcı.
 * DOM yüklendikten sonra tüm alt fonksiyonları çağırır.
 */
function initApp() {
    initHeaderScroll();
    initTypewriter();
    initPlyrPlayers();
    initTextAnimations();
    initTextNavigation();
    initEndSectionInteraction();
    // Global scope'a kredi iptal fonksiyonunu ekle
    window.cancelCreditsAnimation = initCreditsObserver.cancelCreditsAnimation;
}

// DOM tamamen yüklendiğinde uygulamayı başlat
document.addEventListener('DOMContentLoaded', initApp);