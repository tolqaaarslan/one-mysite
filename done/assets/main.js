function initializePlayer(container) {
    const videoId = container.dataset.youtubeId;
    const startSeconds = container.dataset.startSeconds || 0;
    const glowColor = container.dataset.glowColor;
    const parentSection = container.closest('.content-section');
    if (!videoId || container.dataset.initialized) return;
    container.dataset.initialized = 'true';
    const playerElement = document.createElement('div');
    playerElement.setAttribute('data-plyr-provider', 'youtube');
    playerElement.setAttribute('data-plyr-embed-id', videoId);
    const config = {
        youtube: {
            start: startSeconds,
            rel: 0,
            showinfo: 0,
            modestbranding: 1,
            iv_load_policy: 3
        }
    };
    playerElement.setAttribute('data-plyr-config', JSON.stringify(config));
    container.appendChild(playerElement);
    const player = new Plyr(playerElement);
    container.plyr = player;
    if (glowColor && parentSection) {
        player.on('play', () => {
            parentSection.style.boxShadow = `inset 0 0 200px 70px ${glowColor}`
        });
        player.on('pause', () => {
            parentSection.style.boxShadow = 'none'
        })
    }
}
document.addEventListener('DOMContentLoaded', () => {
    window.onbeforeunload = function () {
        window.scrollTo(0, 0)
    };
    let lastScrollY = window.scrollY;
    let scrollDirection = 'down';
    window.addEventListener('scroll', () => {
        if (window.scrollY > lastScrollY) {
            scrollDirection = 'down'
        } else {
            scrollDirection = 'up'
        }
        lastScrollY = window.scrollY
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
    const textToType = "for my old two friends";
    startTypewriter(typewriterElement, textToType, 80, () => {
        setTimeout(() => {
            document.body.classList.remove('loading')
        }, 400)
    });
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
    })
})