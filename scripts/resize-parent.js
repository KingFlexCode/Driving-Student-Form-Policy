(function(){
  function postHeight(){
    const h = document.documentElement.scrollHeight;
    parent.postMessage({ type:'resize', height:h }, '*');
  }
  window.addEventListener('load', postHeight);
  new ResizeObserver(postHeight).observe(document.body);
})();
