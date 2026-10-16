// Gentle pointer response is additive to the continuously moving lead panel.
(() => {
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const fine=matchMedia("(hover: hover) and (pointer: fine)");
  const surfaces=[...document.querySelectorAll(".lead-surface")];
  for(const surface of surfaces){
    let x=0,y=0,targetX=0,targetY=0,frame=null;
    const settle=()=>{
      frame=null;
      if(reduced.matches||document.hidden||!surface.isConnected)return;
      x+=(targetX-x)*.12;y+=(targetY-y)*.12;
      surface.style.setProperty("--tilt-x",`${x.toFixed(3)}deg`);
      surface.style.setProperty("--tilt-y",`${y.toFixed(3)}deg`);
      if(Math.abs(targetX-x)+Math.abs(targetY-y)>.015)frame=requestAnimationFrame(settle);
    };
    const start=()=>{if(frame===null)frame=requestAnimationFrame(settle);};
    const parent=surface.closest(".lead-art");
    parent?.addEventListener("pointermove",event=>{
      if(!fine.matches||reduced.matches)return;
      const r=parent.getBoundingClientRect();
      targetX=-(event.clientY-r.top-r.height/2)/r.height*2.5;
      targetY=(event.clientX-r.left-r.width/2)/r.width*3.5;
      start();
    });
    parent?.addEventListener("pointerleave",()=>{targetX=0;targetY=0;start();});
    reduced.addEventListener("change",()=>{targetX=0;targetY=0;surface.style.setProperty("--tilt-x","0deg");surface.style.setProperty("--tilt-y","0deg");});
  }

  // The app tour uses decoded stills so a suspended video decoder cannot blank it.
  document.querySelectorAll(".amethyst-screen").forEach(async screen=>{
    const frames=[...screen.querySelectorAll(".amethyst-pages img")];
    if(!frames.length)return;
    try{
      await Promise.all(frames.map(image=>image.decode()));
      if(frames.every(image=>image.naturalWidth>0))screen.dataset.tourReady="true";
    }catch{
      screen.dataset.tourReady="false"; // The real Home poster remains visible.
    }
  });

  // The official Promly recording plays only while its frame is on screen.
  const tours=[...document.querySelectorAll(".promly-tour")];
  const inView=new WeakMap();
  const sync=video=>{
    const shouldPlay=inView.get(video)&&!reduced.matches&&!document.hidden;
    if(shouldPlay)video.play().then(()=>{
      if(inView.get(video)&&!reduced.matches&&!document.hidden&&!video.paused)video.classList.add("is-playing");
    }).catch(()=>video.classList.remove("is-playing"));
    else{video.pause();video.classList.remove("is-playing");}
  };
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){inView.set(entry.target,entry.isIntersecting);sync(entry.target);}
  },{threshold:.08});
  tours.forEach(video=>{
    video.muted=true;
    video.addEventListener("error",()=>video.classList.remove("is-playing"));
    observer.observe(video);
  });
  document.addEventListener("visibilitychange",()=>tours.forEach(sync));
  reduced.addEventListener("change",()=>tours.forEach(sync));
})();
