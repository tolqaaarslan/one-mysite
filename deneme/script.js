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
    }, { threshold: 0.2 }); // Elemanın %20'si görününce animasyonu başlat

    contentWrappers.forEach(wrapper => animationObserver.observe(wrapper));

    // 5. YouTube Videolarını Hazırla
    function initializeYouTubeVideos() {
        const videoContainers = document.querySelectorAll('.video-container');

        videoContainers.forEach((container, index) => {
            const videoId = container.dataset.youtubeId;
            if (!videoId) return;

            // Thumbnail'i ayarla
            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            container.style.backgroundImage = `url('${thumbnailUrl}')`;

            // Play butonunu oluştur
            const playButton = document.createElement('div');
            playButton.className = 'play-button';
            container.appendChild(playButton);

            // Tıklama olayını ekle
            playButton.addEventListener('click', () => {
                const playerDiv = document.createElement('div');
                playerDiv.id = `player-${index}`;
                container.innerHTML = ''; // Butonu ve thumbnail'i temizle
                container.appendChild(playerDiv);

                new YT.Player(playerDiv.id, {
                    height: '100%',
                    width: '100%',
                    videoId: videoId,
                    playerVars: {
                        'autoplay': 1,
                        'controls': 1,
                        'showinfo': 0, // Videonun üstündeki başlığı gizler (bazı durumlarda çalışmayabilir)
                        'rel': 0, // Video bitince alakalı videoları göstermez
                        'modestbranding': 1, // YouTube logosunu küçültür
                        'start': container.dataset.startSeconds || 0
                    }
                });
            });
        });
    }

    // YouTube API'si hazır olduğunda videoları başlat
    window.onYouTubeIframeAPIReady = function() {
        initializeYouTubeVideos();
    };

    // 7. Sayfa yükleme animasyonunu bitir
    setTimeout(() => {
        document.body.classList.remove('loading');

        // 2. Rastgele arka plan resimlerini ata (Animasyon bittikten sonra)
        const allSections = document.querySelectorAll('.banner, .part-header, .content-section');
        allSections.forEach(section => {
            const randomId = Math.floor(Math.random() * 500);
            section.style.backgroundImage = `url('https://picsum.photos/1920/1080?random=${randomId}')`;
        });

    }, 1000); // 1000 milisaniye = 1 saniye
});