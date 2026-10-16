(() => {
  // Light is the single appearance, including for visitors with an older stored setting.
  document.body.classList.remove("dusk");
  const options=document.getElementById("email-options");
  let trigger=null;
  document.querySelectorAll("[data-email]").forEach(link=>{
    link.addEventListener("click",event=>{
      // The ordinary href opens Gmail when Popover is unavailable or JS is off.
      if(typeof options?.showPopover!=="function")return;
      event.preventDefault();
      const wasOpen=options.matches(":popover-open"),sameTrigger=trigger===link;
      if(wasOpen){trigger?.setAttribute("aria-expanded","false");options.hidePopover();}
      if(wasOpen&&sameTrigger)return;
      trigger=link;options.showPopover();
      const anchor=link.getBoundingClientRect(),bounds=options.getBoundingClientRect();
      options.style.left=`${Math.max(16,Math.min(anchor.left,innerWidth-bounds.width-16))}px`;
      options.style.top=`${anchor.bottom+bounds.height+24<=innerHeight?anchor.bottom+8:Math.max(16,anchor.top-bounds.height-8)}px`;
      link.setAttribute("aria-expanded","true");
      options.querySelector("a").focus();
    });
  });
  options?.addEventListener("toggle",event=>{
    if(event.newState==="closed")trigger?.setAttribute("aria-expanded","false");
  });
  options?.addEventListener("keydown",event=>{
    if(event.key==="Escape"){event.preventDefault();options.hidePopover();trigger?.focus();}
  });
  options?.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>options.hidePopover()));
  window.addEventListener("resize",()=>{if(options?.matches(":popover-open"))options.hidePopover();});
})();
