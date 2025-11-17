(function(){
  const ALLOWED_DAYS=[2,4,6]; // Tue=2, Thu=4, Sat=6
  const dateInput=document.getElementById("fiveHourDate");
  const timeInput=document.getElementById("fiveHourTime");
  const slotHidden=document.getElementById("fiveHourSlot");
  if(!dateInput || !timeInput || !slotHidden) return;

  function classTimeForDay(day){ return day===6 ? "10:00 AM – 3:00 PM" : "5:00 PM – 10:00 PM"; }

  // flatpickr is loaded from CDN
  flatpickr(dateInput,{
    dateFormat:"Y-m-d",
    minDate:"today",
    disable:[(date)=>!ALLOWED_DAYS.includes(date.getDay())],
    onChange:(selected,dateStr)=>{
      if(!selected.length){ timeInput.value=""; slotHidden.value=""; return; }
      const day=selected[0].getDay();
      const windowLabel=classTimeForDay(day);
      timeInput.value=windowLabel;
      slotHidden.value=`${dateStr} | ${windowLabel}`;
    }
  });

  // Guard on submit (must have valid slot)
  const form = document.querySelector('form[name="Avian Registration"]');
  if(form){
    form.addEventListener('submit', e=>{
      if(!slotHidden.value){ e.preventDefault(); alert("Please select a valid 5-hour class date (Tue/Thu/Sat)."); dateInput.focus(); }
    });
  }
})();
