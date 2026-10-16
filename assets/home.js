// The production workflow runs continuously while visible; there are no playback controls.
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const nodes=[...document.querySelectorAll('.workflow-step')];
  const fill=document.querySelector('.workflow-fill'),packet=document.querySelector('.workflow-packet');
  const base=document.querySelector('.workflow-base'),track=document.querySelector('.workflow-track');
  const duration=(window.PORTFOLIO_MOTION?.[0]?.duration||10)*1000;
  let visible=true,time=0,last=null,frame=null,pathLength=0,centers=[],occluders=[];
  const measure=()=>{
    if(!track||!base||!fill||!track.clientWidth)return;
    const origin=track.getBoundingClientRect();
    const bounds=nodes.map(node=>node.querySelector('.workflow-node').getBoundingClientRect());
    const baseline=Math.max(...bounds.map(r=>r.top-origin.top+r.height/2));
    centers=bounds.map(r=>r.left-origin.left+r.width/2);
    occluders=bounds.map(r=>({left:r.left-origin.left,right:r.right-origin.left,top:r.top-origin.top,bottom:r.bottom-origin.top}));
    const d=`M0 ${baseline} H${origin.width}`;
    base.setAttribute('d',d);fill.setAttribute('d',d);
    // Subtract each glass square from the entire travelling layer. Frost must
    // never let the packet or its glow bleed through the foreground squares.
    const clip=`M0 0 H${origin.width} V${origin.height} H0 Z`+
      occluders.map(r=>` M${r.left} ${r.top} H${r.right} V${r.bottom} H${r.left} Z`).join('');
    packet.parentElement.style.clipPath=`path(evenodd, "${clip}")`;
    pathLength=base.getTotalLength();
    fill.style.strokeDasharray=String(pathLength);
    paint();
  };
  const paint=()=>{
    if(!packet||!fill||!pathLength)return;
    const phase=time/duration;
    const progress=window.PORTFOLIO_WORKFLOW_PROGRESS?.(phase)??Math.min(1,phase/.9);
    const point=base.getPointAtLength(progress*pathLength);
    packet.style.transform=`translate3d(${point.x}px,${point.y}px,0)`;
    const smooth=value=>value*value*(3-2*value);
    const opacity=phase<.9?smooth(Math.min(1,phase/.06)):1-smooth(Math.min(1,(phase-.9)/.06));
    packet.style.opacity=String(reduced.matches?1:opacity);
    const hidden=occluders.some(r=>point.x>=r.left&&point.x<=r.right&&point.y>=r.top&&point.y<=r.bottom);
    packet.style.visibility=hidden?'hidden':'visible';
    packet.dataset.occluded=String(hidden);
    fill.style.strokeDashoffset=String(pathLength*(1-progress));
    // A stage starts only once the packet has actually crossed its center.
    const active=reduced.matches||opacity===0?-1:centers.reduce((reached,x,i)=>point.x>=x?i:reached,-1);
    nodes.forEach((node,i)=>node.classList.toggle('active',i===active));
  };
  const tick=now=>{
    frame=null;
    if(reduced.matches||!visible||document.hidden){last=null;return;}
    if(last!==null)time=(time+Math.min(64,now-last))%duration;
    last=now;paint();frame=requestAnimationFrame(tick);
  };
  const start=()=>{if(frame===null){last=null;frame=requestAnimationFrame(tick);}};
  const showcase=document.getElementById('showcase');
  if(showcase)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();},{threshold:.12}).observe(showcase);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)start();});
  reduced.addEventListener('change',()=>{if(reduced.matches){time=0;paint();}else start();});
  const workflow=document.getElementById('hero-workflow');
  if(workflow)new ResizeObserver(measure).observe(workflow);
  document.fonts.ready.then(measure);
  measure();start();
})();
