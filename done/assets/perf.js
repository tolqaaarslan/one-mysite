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
