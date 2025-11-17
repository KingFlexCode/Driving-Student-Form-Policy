// Keep global for <gmpx-api-loader onload="wireAddressFill()">
function wireAddressFill(){
  const acEl=document.querySelector('gmpx-place-autocomplete');
  const addrEl=document.getElementById('address1');
  const cityEl=document.getElementById('city');
  const stateEl=document.getElementById('state');
  const zipEl=document.getElementById('zip');
  if(!acEl||!addrEl) return;

  acEl.addEventListener('input', ()=>{ addrEl.value = acEl.valueText || acEl.value || addrEl.value; });
  acEl.addEventListener('gmpx-placechange', ()=>{
    const place=acEl.valuePlace || acEl.value;
    const comps=place?.addressComponents || [];
    const byType={}; comps.forEach(c=>c.types?.forEach(t=>byType[t]=c));
    const city =(byType.locality || byType.sublocality || byType.postal_town)?.longText || '';
    const state=byType.administrative_area_level_1?.shortText || '';
    const zip  =byType.postal_code?.longText || '';
    if(place?.formattedAddress) addrEl.value=place.formattedAddress;
    if(city)  cityEl.value=city;
    if(state) stateEl.value=state;
    if(zip)   zipEl.value=zip;
  });
}
