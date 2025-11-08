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

