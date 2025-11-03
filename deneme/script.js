// 5. YouTube Videolarını Hazırla (EN GÜVENİLİR YÖNTEM)
function initializeYouTubeVideos() {
    // Tüm video konteynerlerini dolaş
    document.querySelectorAll('.video-container').forEach((container) => {
        const videoId = container.dataset.youtubeId;
        const startSeconds = container.dataset.startSeconds || 0;
        if (!videoId) return;

        // 1. Plyr'ın oynatıcıyı yerleştireceği İÇ elementi oluşturuyoruz.
        const playerElement = document.createElement('div');
        
        // 2. Plyr'ın okuyacağı HTML data- özelliklerini bu iç elemente atıyoruz.
        playerElement.setAttribute('data-plyr-provider', 'youtube');
        playerElement.setAttribute('data-plyr-embed-id', videoId);

        // 3. Başlangıç saniyesi gibi ek ayarları 'data-plyr-config' olarak atıyoruz.
        const config = {
            youtube: {
                start: startSeconds,
                rel: 0, // Alakalı videoları kapat
                modestbranding: 1 // YouTube logosunu küçült
            }
        };
        playerElement.setAttribute('data-plyr-config', JSON.stringify(config));

        // 4. Oluşturduğumuz bu playerElement'i asıl .video-container'ın içine ekliyoruz.
        container.appendChild(playerElement);

        // 5. Plyr'ı bu yeni 'playerElement' üzerinde başlatıyoruz.
        new Plyr(playerElement);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('[data-nav-label]');
    const navDotsContainer = document.querySelector('.nav-dots');
    const navUp = document.getElementById('nav-up');
    const navDown = document.getElementById('nav-down');

    // 1. Yan navigasyon noktalarını oluştur
    sections.forEach(section => {
        const dot = document.createElement('button');
        dot.classList.add('nav-dot');
        dot.setAttribute('data-target', `#${section.id}`);
        dot.setAttribute('title', section.dataset.navLabel);
        dot.addEventListener('click', () => {
            section.scrollIntoView({ behavior: 'smooth' });
        });
        navDotsContainer.appendChild(dot);
    });

    const navDots = document.querySelectorAll('.nav-dot');

    // 3. Scroll olaylarını dinle ve aktif bölümü güncelle
    const observer = new IntersectionObserver((entries) => {
        let activeSectionId = null;

        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                activeSectionId = entry.target.id;
            }
        });

        // Eğer tam ortada bir bölüm yoksa, görünür olan ilk bölümü aktif say
        if (!activeSectionId) {
            const firstVisible = entries.find(e => e.isIntersecting);
            if (firstVisible) {
                activeSectionId = firstVisible.target.id;
            }
        }

        if (activeSectionId) {
            navDots.forEach(dot => {
                if (dot.dataset.target === `#${activeSectionId}`) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // Okların görünürlüğünü ayarla
        const scrollY = window.scrollY;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

        navUp.style.display = scrollY > 100 ? 'block' : 'none';
        navDown.style.display = scrollY < totalHeight - 100 ? 'block' : 'none';

    }, { threshold: [0.1, 0.5, 0.9] }); // Farklı görünürlük oranlarında tetikle

    sections.forEach(section => {
        observer.observe(section);
    });

    // 4. Navigasyon oklarına tıklama olayı ekle
    function findCurrentSectionIndex() {
        let currentIndex = -1;
        navDots.forEach((dot, index) => {
            if (dot.classList.contains('active')) {
                currentIndex = index;
            }
        });
        return currentIndex;
    }

    navDown.addEventListener('click', () => {
        const currentIndex = findCurrentSectionIndex();
        if (currentIndex < sections.length - 1) {
            sections[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
        }
    });

    navUp.addEventListener('click', () => {
        const currentIndex = findCurrentSectionIndex();
        if (currentIndex > 0) {
            sections[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
        }
    });

    // 6. İçerik alanları için animasyon tetikleyici
    const contentWrappers = document.querySelectorAll('.content-wrapper');
    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Animasyon bir kere tetiklendikten sonra tekrar izlemeye gerek yok
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 }); // Elemanın %20'si görününce animasyonu başlat

    contentWrappers.forEach(wrapper => animationObserver.observe(wrapper));

    // 7. Daktilo animasyonu ve sayfa yükleme sıralaması
    function startTypewriter(element, text, speed, callback) {
        let i = 0;
        element.innerHTML = ""; // Metni temizle
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                // Animasyon bittiğinde imleci statik yap (yanıp sönmeyi durdur)
                element.style.borderRight = "none";
                if (callback) callback();
            }
        }
        type();
    }

    // Sayfa yüklendiğinde animasyonu başlat
    const typewriterElement = document.getElementById('typewriter-text');
    const textToType = "for my old two friends";
    
    // Daktilo animasyonunu başlat, bittiğinde siteyi yükle
    // Hızı buradan ayarlayabilirsiniz. Düşük değer = hızlı, yüksek değer = yavaş.
    startTypewriter(typewriterElement, textToType, 100, () => {
        // Animasyon bittikten sonra 500ms bekle ve devam et
        setTimeout(() => {
            // Yükleme ekranını kaldır
        document.body.classList.remove('loading');

            // Arka plan resimlerini ata
            const banner = document.querySelector('.banner');
            if (banner) banner.style.backgroundImage = "url('bg.gif')";
            
            const otherSections = document.querySelectorAll('.part-header, .content-section');
            otherSections.forEach(section => {
                const randomId = Math.floor(Math.random() * 500);
                section.style.backgroundImage = `url('https://picsum.photos/1920/1080?random=${randomId}')`;
            });

            // Videoları başlat
            initializeYouTubeVideos();
        }, 500); // Yazı bittikten sonraki kısa bekleme süresi
    });
});
