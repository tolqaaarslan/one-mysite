document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const typewriterElement = document.getElementById('typewriter');
    const siteHeader = document.querySelector('.site-header');

    console.log('Typewriter element found:', typewriterElement);

    // Header'ı hemen göster
    if (siteHeader) {
        siteHeader.classList.add('show');
    }

    // Normal scroll'u etkinleştir
    body.style.overflow = 'auto';

    // Basit typewriter efekti (sadece text boşsa)
    if (typewriterElement && typewriterElement.textContent.trim() === '') {
        const text = "for my old friends";
        let i = 0;
        const speed = 90;

        function typeWriter() {
            if (i < text.length) {
                typewriterElement.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            } else {
                // Cursor'u kaldır
                setTimeout(() => {
                    typewriterElement.style.animation = 'none';
                    typewriterElement.style.borderRight = 'none';
                }, 1000);
            }
        }

        typeWriter();
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
            const lines = html.split('<br>').filter(line => line.trim() !== '');
            const wrappedLines = lines.map(line => `<span class="text-line">${line.trim()}</span>`).join('');
            p.innerHTML = wrappedLines;
        });
    }
    
    function animateTextLines(element, delay = 0) {
        if (!element) return;
        
        setTimeout(() => {
            const lines = element.querySelectorAll('.text-line');
            lines.forEach(line => {
                line.classList.add('animate-in');
            });
        }, delay);
    }
    
    function resetTextAnimation(element) {
        if (!element) return;
        
        const lines = element.querySelectorAll('.text-line');
        lines.forEach(line => {
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
        setTimeout(() => {
            if (showElement) {
                showElement.classList.remove('hidden');
                animateTextLines(showElement, 100);
            }
        }, animationDelay);
    }
    
    function showHiddenTextWithAnimation(hiddenElement) {
        if (!hiddenElement) return;
        
        hiddenElement.classList.add('show');
        animateTextLines(hiddenElement, 200);
    }
    
    // Initialize text wrapping on page load
    function initializeTextAnimations() {
        const allTextContainers = document.querySelectorAll('.original-text, .translated-text, .hidden-text');
        allTextContainers.forEach(container => {
            wrapTextLines(container);
        });
        
        // Animate initial visible texts when they come into view
        const contentWrappers = document.querySelectorAll('.content-wrapper, #end');
        const textObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const textContainer = entry.target.querySelector('.text-container, .tc-15');
                    if (textContainer) {
                        const visibleText = textContainer.querySelector('.original-text:not(.hidden), .translated-text:not(.hidden)');
                        if (visibleText) {
                            animateTextLines(visibleText, 500);
                        }
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

    // Çeviri butonları için işlevsellik
    const translateButtons = document.querySelectorAll('.translate-btn');
    translateButtons.forEach(button => {
        button.addEventListener('click', () => {
            const textContainer = button.closest('.text-container, .tc-15');
            const originalText = textContainer.querySelector('.original-text');
            const translatedText = textContainer.querySelector('.translated-text');
            const hiddenText = textContainer.querySelector('.hidden-text');
            const button2 = textContainer.querySelector('.button2');
            
            // Eğer hidden-text gösteriliyorsa, önce onu gizle ve button2'yi pasif yap
            if (hiddenText && hiddenText.classList.contains('show')) {
                resetTextAnimation(hiddenText);
                hiddenText.classList.remove('show');
                if (button2) {
                    button2.style.opacity = '0.6';
                }
                // Hidden-text kapatıldığında, çeviri metnini animasyonla göster
                showTextWithAnimation(hiddenText, translatedText, 200);
                if (originalText) originalText.classList.add('hidden');
                return; // Bu tıklama sadece hidden-text'i kapatmak için
            }
            
            // Normal çeviri geçişi
            const isOriginalHidden = originalText.classList.contains('hidden');
            
            if (isOriginalHidden) {
                // Şu an çeviri gösteriliyor -> orijinale geç
                showTextWithAnimation(translatedText, originalText, 200);
                // Button2'yi gizle
                if (button2) {
                    button2.classList.remove('show');
                }
            } else {
                // Şu an orijinal gösteriliyor -> çeviriye geç
                showTextWithAnimation(originalText, translatedText, 200);
                // Eğer hidden-text varsa button2'yi göster
                if (hiddenText && button2) {
                    setTimeout(() => {
                        button2.classList.add('show');
                    }, 300);
                }
            }
            
            const tc15 = button.closest('.tc-15');
            if (tc15) { setTimeout(() => fitTextToContainer(tc15), 30); }
        });
    });

    // Button2 işlevselliği
    const button2Elements = document.querySelectorAll('.button2');
    button2Elements.forEach(button => {
        button.addEventListener('click', () => {
            const textContainer = button.closest('.text-container, .tc-15');
            const hiddenText = textContainer.querySelector('.hidden-text');
            const originalText = textContainer.querySelector('.original-text');
            const translatedText = textContainer.querySelector('.translated-text');
            
            if (hiddenText) {
                const isShowing = hiddenText.classList.contains('show');
                
                if (!isShowing) {
                    // Hidden text'i animasyonla göster, diğerlerini gizle
                    if (originalText) {
                        resetTextAnimation(originalText);
                        originalText.classList.add('hidden');
                    }
                    if (translatedText) {
                        resetTextAnimation(translatedText);
                        translatedText.classList.add('hidden');
                    }
                    showHiddenTextWithAnimation(hiddenText);
                } else {
                    // Hidden text'i gizle, çeviri metnini animasyonla geri göster
                    resetTextAnimation(hiddenText);
                    hiddenText.classList.remove('show');
                    showTextWithAnimation(hiddenText, translatedText, 200);
                    if (originalText) originalText.classList.add('hidden');
                }
                
                // Button2'nin görünümünü güncelle
                button.style.opacity = !isShowing ? '1' : '0.6';
            }
        });
    });
    
    // Initialize text animations after DOM is loaded
    initializeTextAnimations();

    

    function fitTextToContainer(container) {
        if (!container) return;
        const activeText = container.querySelector('.original-text:not(.hidden), .translated-text:not(.hidden)');
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
});