(function(){
  const c = document.getElementById('sig');
  if(!c) return;
  const ctx = c.getContext('2d');
  const sigHint = document.querySelector('.sig-hint');
  const sigInput = document.getElementById('signatureData');

  function size(){
    const r = window.devicePixelRatio||1;
    c.width = c.clientWidth*r; c.height = 180*r;
    ctx.setTransform(r,0,0,r,0,0); ctx.lineWidth=2; ctx.lineCap='round';
    const SIG_STROKE = getComputedStyle(document.documentElement).getPropertyValue('--sig-stroke').trim() || '#111827';
    ctx.strokeStyle = SIG_STROKE;
  }
  const hideHint = ()=> sigHint && sigHint.classList.add('hidden');
  const showHint = ()=> sigInput?.value ? null : (sigHint && sigHint.classList.remove('hidden'));

  window.addEventListener('resize', size); size();
  let drawing=false,x=0,y=0;
  const set=(a,b)=>{ drawing=true; x=a; y=b; hideHint(); };
  const draw=(a,b)=>{ if(!drawing) return; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(a,b); ctx.stroke(); x=a; y=b; };
  const end=()=>{ drawing=false; if(sigInput) sigInput.value = c.toDataURL('image/png'); };

  // Mouse
  c.addEventListener('mousedown', e=>set(e.offsetX,e.offsetY));
  c.addEventListener('mousemove', e=>draw(e.offsetX,e.offsetY));
  c.addEventListener('mouseup', end);
  c.addEventListener('mouseleave', end);

  // Touch
  c.addEventListener('touchstart', e=>{ const t=e.touches[0], r=c.getBoundingClientRect(); set(t.clientX-r.left,t.clientY-r.top); }, {passive:true});
  c.addEventListener('touchmove',  e=>{ const t=e.touches[0], r=c.getBoundingClientRect(); draw(t.clientX-r.left,t.clientY-r.top); }, {passive:true});
  c.addEventListener('touchend', end);

  // Clear button
  const clearBtn = document.getElementById('clearSig');
  if (clearBtn){
    clearBtn.addEventListener('click', ()=>{
      ctx.clearRect(0,0,c.width,c.height);
      if(sigInput) sigInput.value = '';
      showHint();
    });
  }

  showHint();
})();
