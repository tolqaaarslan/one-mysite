// 5. YouTube Videolarını Hazırla (EN GÜVENİLİR YÖNTEM)
function initializeYouTubeVideos() {
    // Tüm video konteynerlerini dolaş
    document.querySelectorAll('.video-container').forEach(container => {
        const videoId = container.dataset.youtubeId;
        const startSeconds = container.dataset.startSeconds || 0;
        const glowColor = container.dataset.glowColor; // Aura rengini al
        const parentSection = container.closest('.content-section'); // Videonun içinde bulunduğu bölümü bul
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
                showinfo: 0, // Video başlığı, yükleyen gibi bilgileri gizle
                modestbranding: 1, // YouTube logosunu küçült
                iv_load_policy: 3 // Video notasyonlarını (annotation) gizle
            }
        };
        playerElement.setAttribute('data-plyr-config', JSON.stringify(config));

        // 4. Oluşturduğumuz bu playerElement'i asıl .video-container'ın içine ekliyoruz.
        container.appendChild(playerElement);

        // 5. Plyr'ı bu yeni 'playerElement' üzerinde başlatıyoruz.
        const player = new Plyr(playerElement);

        // 6. Oynatıcı olaylarını dinle ve aura efektini uygula
        if (glowColor && parentSection) {
            player.on('play', () => {
                // Video oynamaya başladığında, bölümün etrafına renkli bir gölge ekle
                parentSection.style.boxShadow = `inset 0 0 150px 50px ${glowColor}`;
            });

            player.on('pause', () => {
                // Video duraklatıldığında veya bittiğinde gölgeyi kaldır
                parentSection.style.boxShadow = 'none';
            });

            // 'ended' olayı da 'pause'u tetikler, bu yüzden ayrıca handle etmeye gerek yok.
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // --- YENİ İSTEK 1: Sayfa yenilendiğinde en başa dön ---
    window.onbeforeunload = function () {
        window.scrollTo(0, 0);
    };

    // --- YENİ İSTEK: Scroll yönünü takip et ---
    let lastScrollY = window.scrollY;
    let scrollDirection = 'down'; // Varsayılan yön

    window.addEventListener('scroll', () => {
        if (window.scrollY > lastScrollY) {
            scrollDirection = 'down';
        } else {
            scrollDirection = 'up';
        }
        lastScrollY = window.scrollY;
    });

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
            const wrapper = entry.target;

            // Önceki yön sınıflarını temizle
            wrapper.classList.remove('from-top', 'from-bottom');

            if (entry.isIntersecting) {
                // Element ekrana giriyor: Scroll yönüne göre başlangıç pozisyonunu ayarla
                if (scrollDirection === 'down') {
                    wrapper.classList.add('from-top'); // Yukarıdan gelsin
                } else {
                    wrapper.classList.add('from-bottom'); // Aşağıdan gelsin
                }
                // Kısa bir gecikmeyle 'visible' sınıfını ekleyerek animasyonu başlat
                setTimeout(() => wrapper.classList.add('visible'), 50);
            } else {
                // Element ekrandan çıkıyor: 'visible' sınıfını kaldırarak ters animasyonu başlat
                wrapper.classList.remove('visible');
            }
        });
    }, { threshold: 0.60 }); // Elemanın %25'i görününce animasyonu tetikle

    contentWrappers.forEach(wrapper => animationObserver.observe(wrapper));

    // --- YENİ İSTEK 2: Videoları otomatik durdurmak için yeni observer ---
    const videoContainers = document.querySelectorAll('.video-container');
    const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Eğer video container ekrandan çıkıyorsa VE içinde bir player varsa
            if (!entry.isIntersecting && entry.target.plyr) {
                entry.target.plyr.pause(); // Videoyu durdur
            }
        });
    }, { threshold: 0.1 }); // Videonun %90'ı ekrandan çıktığında tetiklenir

    videoContainers.forEach(container => videoObserver.observe(container));

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
    startTypewriter(typewriterElement, textToType, 80, () => {
        // Animasyon bittikten sonra 500ms bekle ve devam et
        setTimeout(() => {
            // Yükleme ekranını kaldır
        document.body.classList.remove('loading');

            // Videoları başlat
            initializeYouTubeVideos();
        }, 400); // Yazı bittikten sonraki kısa bekleme süresi
    });

    // --- YENİ İSTEK: Çeviri Butonları ---
    const translateButtons = document.querySelectorAll('.translate-btn');

    translateButtons.forEach(button => {
        button.addEventListener('click', () => {
            const textContainer = button.closest('.text-container');
            const originalText = textContainer.querySelector('.original-text');
            const translatedText = textContainer.querySelector('.translated-text');

            // Görünürlüğü değiştir
            originalText.classList.toggle('hidden');
            translatedText.classList.toggle('hidden');
        });
    });
});
