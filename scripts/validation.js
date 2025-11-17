(function(){
  // Phone formatting (safe if element absent)
  const phoneEl=document.getElementById('phone');
  if(phoneEl){
    phoneEl.addEventListener('blur',()=>{
      const digits=phoneEl.value.replace(/\D/g,'').slice(0,10);
      if(digits.length===10){ phoneEl.value=`(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`; phoneEl.classList.remove('invalid'); }
    });
  }

  const form = document.querySelector('form[name="Avian Registration"]');
  if(!form) return;

  function composeHidden(prefix, hiddenId){
    const M=document.getElementById(prefix+'Month').value;
    const D=document.getElementById(prefix+'Day').value;
    const Y=document.getElementById(prefix+'Year').value;
    const hidden=document.getElementById(hiddenId);
    hidden.value = (M && D && Y) ? `${Y}-${M}-${D}` : '';
  }

  form.addEventListener('submit',(e)=>{
    // sync hidden MDY fields
    composeHidden('dob','dob');
    composeHidden('issue','issueDate');
    composeHidden('exp','expDate');

    const msgs = [];

    // Signature required
    if(!document.getElementById('signatureData').value){
      msgs.push('Please sign in the box.');
    }

    // 5-Hour class slot required
    const slotHidden = document.getElementById("fiveHourSlot");
    if(slotHidden && !slotHidden.value){
      msgs.push('Please select a valid 5-hour class date (Tue/Thu/Sat).');
    }

    // Find first invalid built-in field
    const firstInvalid = [...form.elements].find(el => el.willValidate && !el.checkValidity());

    if (msgs.length || firstInvalid){
      e.preventDefault();
      form.querySelectorAll('.invalid').forEach(el=>el.classList.remove('invalid'));
      if (firstInvalid){
        firstInvalid.classList.add('invalid');
        firstInvalid.scrollIntoView({behavior:'smooth', block:'center'});
        try { firstInvalid.focus({preventScroll:true}); } catch {}
      }
      if (msgs.length) alert(msgs.join('\n'));
    }
  });

  // (Removed the stray duplicated block that referenced undefined `e`/`form` in your inline script)
})();
