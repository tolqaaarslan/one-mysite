document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('main > section');
    const sideNav = document.querySelector('.side-nav');
    const upArrow = document.getElementById('up-arrow');
    const downArrow = document.getElementById('down-arrow');
    const animationElements = document.querySelectorAll('.animate-on-scroll');

    // --- Sağ Navigasyon Noktalarını Oluşturma ---
    const dotsContainer = document.createDocumentFragment();
    sections.forEach((section, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.dataset.section = section.id;
        dot.addEventListener('click', () => {
            section.scrollIntoView({ behavior: 'smooth' });
        });
        dotsContainer.appendChild(dot);
    });
    // Okların arasına noktaları ekle
    sideNav.insertBefore(dotsContainer, downArrow);
    const dots = document.querySelectorAll('.dot');

    // --- Scroll Animasyon Gözlemcisi ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.1 // Elemanın %10'u göründüğünde tetikle
    });

    animationElements.forEach(el => {
        observer.observe(el);
    });

    // --- Aktif Bölümü ve Navigasyonu Güncelleme ---
    function updateActiveNav() {
        let currentSectionIndex = 0;
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            // Ekranın ortasına en yakın bölümü bul
            if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
                currentSectionIndex = index;
            }
        });

        // Noktaları güncelle
        dots.forEach((dot, index) => {
            if (index === currentSectionIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Okları güncelle
        upArrow.style.visibility = (currentSectionIndex > 0) ? 'visible' : 'hidden';
        downArrow.style.visibility = (currentSectionIndex < sections.length - 1) ? 'visible' : 'hidden';
    }

    // --- Ok Butonları Olayları ---
    upArrow.addEventListener('click', () => {
        const activeDot = document.querySelector('.dot.active');
        const activeIndex = Array.from(dots).indexOf(activeDot);
        if (activeIndex > 0) {
            sections[activeIndex - 1].scrollIntoView({ behavior: 'smooth' });
        }
    });

    downArrow.addEventListener('click', () => {
        const activeDot = document.querySelector('.dot.active');
        const activeIndex = Array.from(dots).indexOf(activeDot);
        if (activeIndex < sections.length - 1) {
            sections[activeIndex + 1].scrollIntoView({ behavior: 'smooth' });
        }
    });

    // --- Zaman Sayacı ---
    const timerElement = document.getElementById('timer');
    const startDate = new Date('2014-05-06T20:00:00');

    function updateTimer() {
        const now = new Date();
        const diff = now - startDate;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        timerElement.innerHTML = `
            ${days} gün ${String(hours).padStart(2, '0')} saat ${String(minutes).padStart(2, '0')} dakika ${String(seconds).padStart(2, '0')} saniye
        `;
    }

    if (timerElement) {
        setInterval(updateTimer, 1000);
        updateTimer(); // Sayfa yüklenir yüklenmez çalıştır
    }

    // --- Scroll Olayı ---
    window.addEventListener('scroll', () => {
        updateActiveNav();
    });

    // --- Başlangıç Durumu ---
    updateActiveNav();
});
