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
        ph.addEventListener('click', () => { const plyr = new Plyr(playerDiv); players.set(playerDiv, plyr); ph.remove(); try { plyr.play(); } catch (e) { } }, { once: true });
    });

    // Çeviri butonları için işlevsellik
    const translateButtons = document.querySelectorAll('.translate-btn');
    translateButtons.forEach(button => {
        button.addEventListener('click', () => {
            const textContainer = button.closest('.text-container');
            const originalText = textContainer.querySelector('.original-text');
            const translatedText = textContainer.querySelector('.translated-text');
            originalText.classList.toggle('hidden');
            translatedText.classList.toggle('hidden');
            const tc15 = button.closest('.tc-15');
            if (tc15) { setTimeout(() => fitTextToContainer(tc15), 30); }
        });
    });

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
        const contentWrappers = document.querySelectorAll('.content-wrapper');

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