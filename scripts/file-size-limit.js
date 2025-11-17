(function(){
  const MAX_BYTES=3.5*1024*1024;
  function enforceMaxSize(input){
    if(!input?.files?.length) return true;
    for(const f of input.files){
      if(f.size>MAX_BYTES){
        alert(`"${f.name}" is ${(f.size/1024/1024).toFixed(2)} MB. Please upload images under 3.5 MB.`);
        input.value=''; return false;
      }
    } return true;
  }
  ['idFront','idBack'].forEach(id=>{
    const el = document.getElementById(id);
    if (el) el.addEventListener('change',e=>enforceMaxSize(e.target));
  });
  // export to window so dropzones.js can call it
  window.enforceMaxSize = enforceMaxSize;
})();
