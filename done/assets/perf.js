(function(){
  let __scrollTO;
  window.addEventListener('scroll', function(){
    document.body.classList.add('is-scrolling');
    clearTimeout(__scrollTO);
    __scrollTO = setTimeout(function(){
      document.body.classList.remove('is-scrolling');
    }, 150);
  }, { passive: true });
})();

// Keep containers and background stable while toggling translation
(function(){
  function freezeAround(btn){
    try{
      const y = window.scrollY;
      const wrapper = btn.closest('.content-wrapper');
      const section = btn.closest('.content-section');
      const text = btn.closest('.text-container');
      const video = wrapper ? wrapper.querySelector('.video-container') : null;
      const lock = (el)=>{
        if(!el) return;
        const h = el.offsetHeight;
        el.style.minHeight = h + 'px';
        // For containers that normally stretch, also set explicit height
        el.style.height = h + 'px';
      };
      lock(wrapper); lock(section); lock(text); lock(video);
      document.body.classList.add('is-freeze');
      // Release after next frame(s)
      setTimeout(function(){
        [wrapper,section,text,video].forEach(function(el){ if(el){ el.style.height=''; el.style.minHeight=''; }});
        document.body.classList.remove('is-freeze');
        window.scrollTo(0, y);
      }, 300);
    }catch(e){ /* no-op */ }
  }

  document.addEventListener('click', function(ev){
    const btn = ev.target && ev.target.closest && ev.target.closest('.translate-btn');
    if(!btn) return;
    freezeAround(btn);
  }, true); // capture to run before other handlers
})();
