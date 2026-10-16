(() => {
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  if(reduced.matches||!("IntersectionObserver" in window))return;
  const main=document.querySelector("main");
  if(!main)return;
  const counters=[];
  const excluded="script,style,svg,code,pre,a,button,input,textarea,select,time,[aria-hidden='true'],.count-up";
  const pattern=/\d[\d,]*(?:\.\d+)?[kKmM%]?/g;
  const months=/\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:,?\s+\d{4})?/gi;
  const walker=document.createTreeWalker(main,NodeFilter.SHOW_TEXT,{
    acceptNode:node=>node.parentElement.closest(excluded)||!/\d/.test(node.nodeValue)
      ?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT
  });
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);

  for(const node of nodes){
    const text=node.nodeValue,fragment=document.createDocumentFragment();
    const dates=[...text.matchAll(months)];
    let cursor=0,changed=false;
    for(const match of text.matchAll(pattern)){
      const original=match[0],index=match.index;
      const before=text[index-1]||"",after=text[index+original.length]||"";
      const suffix=original.match(/[kKmM%]$/)?.[0]||"";
      const digits=suffix?original.slice(0,-1):original;
      const multiplier=/k/i.test(suffix)?1000:/m/i.test(suffix)?1000000:1;
      const target=Number(digits.replaceAll(",",""))*multiplier;
      // Dates, release versions, and identifiers are labels rather than quantities.
      if(/[a-zA-Z\d_.]/.test(before)||/\d/.test(after)||after==="."&&/\d/.test(text[index+original.length+1]||"")||
         multiplier===1&&target>=1900&&target<=2100&&Number.isInteger(target)||
         dates.some(date=>index>=date.index&&index<date.index+date[0].length)||target===0)continue;
      const context=node.parentElement.closest(".project-outcomes>div,.case-metrics>div,.output-summary,.hero-outcome,p,li")||node.parentElement;
      const slow=target===30000&&/\bviews\b/i.test(context.textContent);
      const precision=digits.includes(".")?digits.split(".")[1].length:0;
      const container=document.createElement("span");
      container.className="count-up";
      container.dataset.countTarget=String(target);
      container.dataset.countState="pending";
      container.dataset.countRuns="0";
      if(slow)container.dataset.countMode="views-30k";
      const final=document.createElement("span");
      final.className="count-up-final";
      final.textContent=original;
      const display=document.createElement("span");
      display.className="count-up-display";
      display.setAttribute("aria-hidden","true");
      const measure=document.createElement("span");
      measure.className="count-up-measure";
      measure.setAttribute("aria-hidden","true");
      measure.textContent=slow&&multiplier===1000?"30.0"+suffix:original;
      container.append(final,measure,display);
      const counter={container,display,original,target,suffix,multiplier,precision,slow,frame:null,timer:null,start:0};
      counter.format=value=>{
        if(slow&&multiplier===1000)return(value/1000).toFixed(1)+suffix;
        const amount=value/multiplier;
        const rounded=precision?Number(amount.toFixed(precision)):Math.floor(amount);
        return rounded.toLocaleString("en-US",{
          minimumFractionDigits:precision,maximumFractionDigits:precision,useGrouping:digits.includes(",")
        })+suffix;
      };
      display.textContent=counter.format(0);
      container.dataset.countValue="0";
      fragment.append(text.slice(cursor,index),container);
      cursor=index+original.length;
      changed=true;
      counters.push(counter);
    }
    if(changed){fragment.append(text.slice(cursor));node.replaceWith(fragment);}
  }

  const finish=counter=>{
    if(counter.frame!==null)cancelAnimationFrame(counter.frame);
    if(counter.timer!==null)clearTimeout(counter.timer);
    counter.frame=null;counter.timer=null;
    counter.display.textContent=counter.original;
    counter.container.dataset.countValue=String(counter.target);
    counter.container.dataset.countState="complete";
  };
  const paint=(counter,value)=>{
    counter.display.textContent=counter.format(value);
    counter.container.dataset.countValue=String(value);
  };
  const start=counter=>{
    if(counter.container.dataset.countState!=="pending")return;
    counter.container.dataset.countState="running";
    counter.container.dataset.countRuns="1";
    counter.start=performance.now();
    const rapidDuration=counter.slow?1100:900;
    const rapidTarget=counter.slow?27000:counter.target;
    const slowTick=()=>{
      const elapsed=performance.now()-counter.start-rapidDuration;
      const step=Math.min(30,Math.floor(Math.max(0,elapsed)/4000));
      paint(counter,27000+step*100);
      if(step===30){finish(counter);return;}
      counter.timer=setTimeout(slowTick,Math.max(16,(step+1)*4000-elapsed));
    };
    const tick=now=>{
      counter.frame=null;
      if(reduced.matches){finish(counter);return;}
      const progress=Math.min(1,(now-counter.start)/rapidDuration);
      paint(counter,rapidTarget*(1-Math.pow(1-progress,3)));
      if(progress<1)counter.frame=requestAnimationFrame(tick);
      else if(counter.slow)slowTick();
      else finish(counter);
    };
    counter.frame=requestAnimationFrame(tick);
  };
  const lookup=new WeakMap(counters.map(counter=>[counter.container,counter]));
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      observer.unobserve(entry.target);
      start(lookup.get(entry.target));
    }
  },{threshold:.35});
  counters.forEach(counter=>observer.observe(counter.container));
  reduced.addEventListener("change",()=>{
    if(!reduced.matches)return;
    observer.disconnect();
    counters.forEach(finish);
  });
  window.addEventListener("pagehide",()=>{
    observer.disconnect();
    counters.forEach(finish);
  },{once:true});
})();
