(function(){
  function setupDropzone(zoneId, inputId){
    const zone  = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    if(!zone || !input) return;
    const fileOut = zone.querySelector('.dz-file');

    zone.tabIndex = 0; // keyboard focusable

    zone.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });

    ['dragenter','dragover'].forEach(evt=>{
      zone.addEventListener(evt, (e)=>{ e.preventDefault(); e.dataTransfer.dropEffect='copy'; zone.classList.add('hover'); });
    });
    ['dragleave','drop'].forEach(evt=>{
      zone.addEventListener(evt, (e)=>{ e.preventDefault(); zone.classList.remove('hover'); });
    });

    zone.addEventListener('drop', (e)=>{
      if (!e.dataTransfer?.files?.length) return;
      input.files = e.dataTransfer.files;
      if (typeof window.enforceMaxSize === 'function') window.enforceMaxSize(input);
      renderName();
    });

    input.addEventListener('change', ()=>{
      if (typeof window.enforceMaxSize === 'function') window.enforceMaxSize(input);
      renderName();
    });

    function renderName(){
      if (input.files && input.files.length){
        fileOut.textContent = (input.files.length === 1)
          ? input.files[0].name
          : `${input.files.length} files selected`;
      } else {
        fileOut.textContent = '';
      }
    }
  }

  setupDropzone('idFrontZone','idFront');
  setupDropzone('idBackZone','idBack');
  // you had a third call; leaving as-is but it had no matching elements:
  // setupDropzone('5hr-CertificateZone') // (noop if not present)
})();
