// Motion has no site toggle or persisted off switch. Hidden/offscreen work sleeps.
(() => {
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const apply=()=>{document.body.dataset.motion=preference.matches?'reduced':'on';};
  preference.addEventListener('change',apply);
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries)entry.target.dataset.inView=String(entry.isIntersecting);
  },{rootMargin:'60px',threshold:0});
  document.querySelectorAll('.content-art,.lead-art,.moblife-art,.promly-visual,.amethyst-visual,.case-gallery,.case-visual,.approach-line,.connect-pane').forEach(element=>{
    element.classList.add('motion-surface');element.dataset.inView='false';observer.observe(element);
  });
  document.addEventListener('visibilitychange',()=>document.body.classList.toggle('motion-document-hidden',document.hidden));
  apply();
})();
