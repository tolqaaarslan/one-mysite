// Enhanced scroll performance optimization
(function(){
  let __scrollTO;
  let isScrolling = false;
  
  // Optimized scroll handler with RAF
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
    }, 150);
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

// Mobile/tablet transform-based parallax for backgrounds (desktop uses background-attachment: fixed)
(function(){
  const nodes = [];
  function collect(){
    nodes.length = 0;
    document.querySelectorAll('.banner, .part-header, .content-section').forEach(el=>nodes.push(el));
  }
  collect();

  let ticking = false;
  function update(){
    const vw = window.innerWidth || document.documentElement.clientWidth;
    if (vw > 1024) {
      // Desktop: clear inline positions if any
      for (const el of nodes) el.style.backgroundPosition = '';
      ticking = false; return;
    }
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const center = vh/2;
    for (const el of nodes){
      const r = el.getBoundingClientRect();
      const offset = (r.top + r.height/2) - center;
      const speed = parseFloat(el.getAttribute('data-parallax-speed') || '0.2');
      const px = Math.round(-offset * speed);
      el.style.backgroundPosition = `center calc(50% + ${px}px)`;
    }
    ticking = false;
  }
  function onScroll(){
    if (!ticking){ ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', ()=>{ ticking=false; update(); });
  document.addEventListener('DOMContentLoaded', ()=>{ collect(); update(); });
  // In case dynamic content loads later
  setTimeout(()=>{ collect(); update(); }, 800);
})();
