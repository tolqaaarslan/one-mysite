// Enhanced scroll performance optimization with IntersectionObserver
(function(){
  let __scrollTO;
  let isScrolling = false;
  
  // Optimized scroll handler with RAF and throttling
  function handleScroll() {
    if (!isScrolling) {
      requestAnimationFrame(() => {
        document.body.classList.add('is-scrolling');
        isScrolling = false;
      });
      isScrolling = true;
    }
    
    clearTimeout(__scrollTO);
    __scrollTO = setTimeout(function(){
      document.body.classList.remove('is-scrolling');
    }, 100); // Reduced from 150ms for better responsiveness
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true });
})();

// Enhanced freeze functionality with better performance
(function(){
  function freezeAround(btn){
    // Sadece geniş ekranlarda (mobil olmayan) çalıştır.
    // 1366px, main.css dosyasındaki mobil görünüme geçiş breakpoint'idir.
    if (window.innerWidth <= 1366) {
      return;
    }
    
    try{
      const y = window.scrollY;
      const wrapper = btn.closest('.content-wrapper');
      const section = btn.closest('.content-section');
      const text = btn.closest('.text-container');
      const video = wrapper ? wrapper.querySelector('.video-container') : null;
      
      // More efficient locking with RAF
      const lock = (el)=>{
        if(!el) return;
        requestAnimationFrame(() => {
          const h = el.offsetHeight;
          el.style.minHeight = h + 'px';
          el.style.height = h + 'px';
        });
      };
      
      // Batch DOM operations
      requestAnimationFrame(() => {
        lock(wrapper); 
        lock(section); 
        lock(text); 
        lock(video);
        document.body.classList.add('is-freeze');
      });
      
      // Release after optimized timing
      setTimeout(function(){
        requestAnimationFrame(() => {
          [wrapper,section,text,video].forEach(function(el){ 
            if(el){ 
              el.style.height=''; 
              el.style.minHeight=''; 
            }
          });
          document.body.classList.remove('is-freeze');
          window.scrollTo(0, y);
        });
      }, 250); // Reduced from 300ms for snappier feel
    }catch(e){ 
      console.warn('Freeze operation failed:', e);
    }
  }

  document.addEventListener('click', function(ev){
    const btn = ev.target && ev.target.closest && ev.target.closest('.translate-btn');
    if(!btn) return;
    freezeAround(btn);
  }, true); // capture to run before other handlers
})();

// Mobile/tablet optimized parallax with IntersectionObserver
(function(){
  const nodes = [];
  let observer;
  
  function collect(){
    nodes.length = 0;
    // Disconnect existing observer
    if (observer) observer.disconnect();
    
    document.querySelectorAll('.banner, .part-header, .content-section').forEach(el => {
      nodes.push(el);
    });
    
    // Create IntersectionObserver for performance
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-viewport');
        } else {
          entry.target.classList.remove('in-viewport');
        }
      });
    }, {
      rootMargin: '50px 0px', // Small buffer for smooth transitions
      threshold: 0.1
    });
    
    nodes.forEach(node => observer.observe(node));
  }
  
  collect();

  let ticking = false;
  function update(){
    const vw = window.innerWidth || document.documentElement.clientWidth;
    if (vw > 1024) {
      // Desktop: clear inline positions if any and use CSS parallax
      for (const el of nodes) {
        el.style.backgroundPosition = '';
        el.style.transform = '';
      }
      ticking = false; 
      return;
    }
    
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const center = vh/2;
    
    // Only process visible elements for performance
    for (const el of nodes){
      if (!el.classList.contains('in-viewport')) continue;
      
      const r = el.getBoundingClientRect();
      const offset = (r.top + r.height/2) - center;
      const speed = parseFloat(el.getAttribute('data-parallax-speed') || '0.15'); // Reduced for better performance
      const px = Math.round(-offset * speed);
      
      // Use transform instead of background-position for better performance
      el.style.transform = `translate3d(0, 0, 0)`;
      el.style.backgroundPosition = `center calc(50% + ${px}px)`;
    }
    ticking = false;
  }
  
  function onScroll(){
    if (!ticking){ 
      ticking = true; 
      requestAnimationFrame(update); 
    }
  }
  
  // Throttled scroll listener
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    onScroll();
    
    // Additional cleanup after scroll ends
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // Memory cleanup for off-screen elements
      nodes.forEach(el => {
        if (!el.classList.contains('in-viewport')) {
          el.style.willChange = 'auto';
        } else {
          el.style.willChange = 'transform';
        }
      });
    }, 150);
  }, { passive: true });
  
  window.addEventListener('resize', () => { 
    ticking = false; 
    update(); 
  });
  
  document.addEventListener('DOMContentLoaded', () => { 
    collect(); 
    update(); 
  });
  
  // Performance: Reduced timeout and added cleanup
  setTimeout(() => { 
    collect(); 
    update(); 
  }, 500); // Reduced from 800ms
})();
