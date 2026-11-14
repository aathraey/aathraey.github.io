// The three worlds. Wide screens with motion allowed get pinned, scrubbed scenes.
// Phones get short timelines that play on entry. Reduced motion gets a static layout.
(() => {
  const EX = window.EX;
  if (!EX) return;
  const { $, $$ } = EX;
  const root = document.documentElement;

  const setWorld = w => {
    if (document.body.dataset.world === w) return;
    document.body.dataset.world = w;
    document.dispatchEvent(new CustomEvent("ex:world", { detail: w }));
  };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;

  // ---------- Lead field: 1,325 dots, 838 stay lit, about 123 leave as paper planes.
  // keep: how much of each column's height the dots may use. The pinned scene leaves the
  // lower part empty so the guide can stand under the column it is talking about.
  function leadField(sec, keep = 1) {
    const canvas = $(".leads-canvas", sec), ctx = canvas.getContext("2d");
    const cols = $$(".leads-stats div", sec);
    const out = { found: $('[data-lead="found"]', sec), enriched: $('[data-lead="enriched"]', sec), sent: $('[data-lead="sent"]', sec) };
    const N = 1325, E = 838, S = 123;
    let seed = 7;
    const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const dots = Array.from({ length: N }, (_, i) => ({ d: rnd(), j: rnd(), k: rnd(), e: i < E, s: i < S }));
    let W = 0, H = 0, last = 1, live = true;

    const grid = (zone, count, idx) => {
      const w = zone.x1 - zone.x0, h = zone.y1 - zone.y0;
      const c = Math.max(1, Math.ceil(Math.sqrt(count * w / Math.max(1, h))));
      const r = Math.ceil(count / c);
      return { x: zone.x0 + (idx % c + 0.5) * (w / c), y: zone.y0 + (Math.floor(idx / c) + 0.5) * (h / r) };
    };
    function resize() {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const zones = cols.map(el => { const s = el.getBoundingClientRect(); return { x0: s.left - r.left + 2, x1: s.right - r.left - 2, y0: Math.max(0, s.bottom - r.top) + 20, y1: keep < 1 ? H * keep : H - 10 }; });
      dots.forEach((dot, i) => {
        dot.a = grid(zones[0], N, i);
        dot.a.x += (dot.j - 0.5) * 3; dot.a.y += (dot.k - 0.5) * 3;
        if (dot.e) dot.b = grid(zones[1], E, i);
        if (dot.s) dot.c = grid(zones[2], S, i);
        dot.o = { x: dot.a.x + (dot.j - 0.5) * 60, y: -20 - dot.k * H * 0.6 };
      });
      draw(last);
    }
    function draw(p) {
      last = p;
      if (!W) return;
      const f1 = clamp((p - 0.08) / 0.26), f2 = clamp((p - 0.40) / 0.24), f3 = clamp((p - 0.68) / 0.22);
      ctx.clearRect(0, 0, W, H);
      for (const dot of dots) {
        const t1 = ease(clamp(f1 * 1.7 - dot.d * 0.7));
        if (t1 <= 0) continue;
        let x = lerp(dot.o.x, dot.a.x, t1), y = lerp(dot.o.y, dot.a.y, t1);
        let t2 = 0, t3 = 0;
        if (dot.e) { t2 = ease(clamp(f2 * 1.6 - dot.d * 0.6)); x = lerp(x, dot.b.x, t2); y = lerp(y, dot.b.y, t2); }
        if (dot.s) { t3 = ease(clamp(f3 * 1.6 - dot.d * 0.6)); x = lerp(x, dot.c.x, t3); y = lerp(y, dot.c.y, t3) - Math.sin(t3 * Math.PI) * 26; }
        if (t3 > 0.02) {
          ctx.fillStyle = `rgba(255,208,138,${0.6 + 0.4 * t3})`;
          ctx.beginPath(); ctx.moveTo(x + 5, y); ctx.lineTo(x - 4, y - 3.6); ctx.lineTo(x - 2, y); ctx.lineTo(x - 4, y + 3.6); ctx.closePath(); ctx.fill();
        } else if (dot.e && t2 > 0) {
          ctx.fillStyle = `rgba(${Math.round(lerp(255, 127, t2))},${Math.round(lerp(255, 212, t2))},255,${lerp(0.6, 0.95, t2)})`;
          ctx.fillRect(x - 1.4, y - 1.4, 2.8, 2.8);
        } else {
          ctx.fillStyle = `rgba(255,255,255,${lerp(0.6, 0.18, dot.e ? 0 : ease(f2)) * t1})`;
          ctx.fillRect(x - 1.3, y - 1.3, 2.6, 2.6);
        }
      }
      if (live) {
        out.found.textContent = Math.round(N * ease(f1)).toLocaleString("en-US");
        out.enriched.textContent = Math.round(E * ease(f2)).toLocaleString("en-US");
        out.sent.textContent = "~" + Math.round(S * ease(f3));
      }
    }
    return { draw, resize, freeze() { live = false; out.found.textContent = "1,325"; out.enriched.textContent = "838"; out.sent.textContent = "~123"; } };
  }

  // ---------- MobLife pieces shared by both modes.
  function mobLife(sec) {
    const imgs = $$(".ml-frame img", sec), label = $(".ml-label", sec), pop = $(".ml-pop", sec), xp = $(".ml-xp i", sec);
    const egg = $(".ml-egg", sec), chest = $(".ml-chest", sec), boss = $(".ml-boss", sec);
    for (let i = 0; i < 5; i++) new Image().src = `./assets/img/egg-${i}.png`;
    new Image().src = "./assets/img/chest-open.png";
    let cur = 0, eggStage = 0, open = false;
    return {
      screen(i) {
        if (i === cur) return;
        const forward = i > cur; cur = i;
        imgs.forEach((im, k) => im.classList.toggle("on", k === i));
        label.textContent = imgs[i].dataset.label;
        if (forward && window.gsap) {
          gsap.fromTo(pop, { autoAlpha: 1, y: 0, scale: 0.7 }, { autoAlpha: 0, y: -52, scale: 1, duration: 1, ease: "power2.out", overwrite: true });
          if (i === 5) gsap.fromTo(boss, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -40, duration: 1.1, ease: "power2.out", overwrite: true });
        }
      },
      progress(p) {
        xp.style.setProperty("--xp", p.toFixed(3));
        const st = Math.min(4, Math.floor(p * 5));
        if (st !== eggStage) { eggStage = st; egg.src = `./assets/img/egg-${st}.png`; }
      },
      chest(o) { if (o !== open) { open = o; chest.src = `./assets/img/${o ? "chest-open" : "chest"}.png`; } }
    };
  }

  // Static layout for reduced motion or missing GSAP.
  function staticMode() {
    const sec = $("#leads");
    if (sec) { const f = leadField(sec); f.freeze(); const fit = () => { f.resize(); f.draw(0.66); }; fit(); addEventListener("resize", fit); }
    const ml = $("#moblife");
    if (ml) { const m = mobLife(ml); m.progress(1); m.chest(true); }
  }
  if (!window.gsap || EX.reduced) { staticMode(); return; }

  const iris = (tl, bg, inner, t) => tl
    .fromTo(bg, { "--r": "0%" }, { "--r": "150%", duration: 6, ease: "power1.in" }, t)
    .fromTo(inner, { autoAlpha: 0 }, { autoAlpha: 1, duration: 3 }, t + 2.5);
  const irisClose = (tl, bg, inner, t) => tl
    .to(inner, { autoAlpha: 0, duration: 2.5 }, t)
    .to(bg, { "--r": "0%", duration: 5, ease: "power1.out" }, t);
  const worldFor = (s, name) => {
    if (s.progress > 0.04 && s.progress < 0.955) setWorld(name);
    else if (document.body.dataset.world === name) setWorld("paper");
  };
  const parts = id => { const sec = $("#" + id); return { sec, stage: $(".stage", sec), bg: $(".world-bg", sec), inner: $(".stage-inner", sec), head: $(".scene-head", sec) }; };
  const pinned = (id, sec, stage, length) => {
    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: sec, start: "top top", end: "+=" + length, pin: stage, scrub: 0.5, invalidateOnRefresh: true, onUpdate: s => worldFor(s, id) } });
    EX.ranges[id] = () => [tl.scrollTrigger.start, tl.scrollTrigger.end];
    return tl;
  };

  function pinContent() {
    const { sec, stage, bg, inner, head } = parts("content");
    const stations = $(".cm-stations", sec), gal = $(".cm-gallery", sec), total = $(".cm-total", sec);
    const track = $(".cm-track", sec), card = $(".cm-card", sec), fill = $(".cm-fill", sec), crew = $$(".cm-crew li", sec);
    const cards = $$(".cm-cards figure", sec), k30 = $(".cm-total b", sec), main = $(".cm", sec);
    gsap.set([gal, total], { autoAlpha: 0 });
    gsap.set(cards, { xPercent: -50, yPercent: -50 });
    const tl = pinned("content", sec, stage, "300%");
    iris(tl, bg, inner, 0);
    // "13 posts a day" sits on the agents screen, so it is visible when the guide says it.
    tl.from(head.children, { y: 30, autoAlpha: 0, stagger: 1, duration: 3, ease: "power2.out" }, 4)
      // fromTo, not from: a rebuild could record a leftover y as the end point and leave Eve 44px low.
      .fromTo(crew, { y: 44, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.8, duration: 3, ease: "power2.out" }, 6)
      .from(track, { autoAlpha: 0, duration: 2 }, 8)
      .from(".cm-daily", { y: 24, autoAlpha: 0, duration: 3, ease: "power2.out" }, 10)
      .to(card, { x: () => track.offsetWidth - card.offsetWidth, duration: 28 }, 13)
      .to(fill, { scaleX: 1, duration: 28 }, 13)
      .to({}, { duration: 28, onUpdate() { const p = this.progress(), i = Math.min(4, Math.floor(p * 5)); crew.forEach((li, k) => li.classList.toggle("active", k === i && p > 0 && p < 1)); } }, 13)
      .to(stations, { autoAlpha: 0, scale: 0.9, y: -30, duration: 3, ease: "power2.in" }, 43)
      .to(gal, { autoAlpha: 1, duration: 1 }, 46)
      .fromTo(cards, { x: 0, y: 70, rotation: 0, scale: 0.4, autoAlpha: 0 }, {
        x: i => (i - 4.5) * (main.offsetWidth * 0.74 / 9),
        y: i => Math.pow(Math.abs(i - 4.5), 2) * 3.4 - 20,
        rotation: i => (i - 4.5) * 3.2, scale: 1, autoAlpha: 1, duration: 5, stagger: 2.7, ease: "power2.out"
      }, 46.5)
      // The fan owns a long stretch of the scroll (46 to 76) so the cards arrive one at a time.
      .to(gal, { autoAlpha: 0, scale: 0.86, duration: 3, ease: "power2.in" }, 81)
      .to(total, { autoAlpha: 1, duration: 3 }, 84)
      .from(total, { scale: 0.6, duration: 5, ease: "back.out(1.6)" }, 84)
      .call(() => EX.countK(k30), null, 85);
    irisClose(tl, bg, inner, 95);
  }

  function pinLeads() {
    const { sec, stage, bg, inner, head } = parts("leads");
    const field = leadField(sec, 0.6), state = { p: 0 };
    const tl = pinned("leads", sec, stage, "240%");
    iris(tl, bg, inner, 0);
    tl.from(head.children, { y: 30, autoAlpha: 0, stagger: 1, duration: 3, ease: "power2.out" }, 4)
      .from($$(".leads-stats div", sec), { y: 24, autoAlpha: 0, stagger: 1, duration: 3, ease: "power2.out" }, 5)
      .to(state, { p: 1, duration: 100, onUpdate: () => field.draw(state.p) }, 0);
    irisClose(tl, bg, inner, 95);
    field.resize();
    ScrollTrigger.addEventListener("refresh", field.resize);
    return () => ScrollTrigger.removeEventListener("refresh", field.resize);
  }

  function pinMobLife() {
    const { sec, stage, bg, inner, head } = parts("moblife");
    const m = mobLife(sec), state = { p: 0 };
    const tl = pinned("moblife", sec, stage, "300%");
    iris(tl, bg, inner, 0);
    tl.from(head.children, { y: 30, autoAlpha: 0, stagger: 1, duration: 3, ease: "power2.out" }, 4)
      .from(".ml-phone", { y: 90, autoAlpha: 0, duration: 5, ease: "back.out(1.3)" }, 5)
      .from([".ml-hud", ".ml-party"], { x: 50, autoAlpha: 0, stagger: 1.5, duration: 4, ease: "power2.out" }, 7)
      .to(state, { p: 1, duration: 68, onUpdate: () => { m.screen(Math.min(5, Math.floor(state.p * 6))); m.progress(state.p); } }, 12)
      .from(".ml-stats div", { y: 44, autoAlpha: 0, stagger: 1.6, duration: 4, ease: "back.out(1.7)" }, 82)
      .to({}, { duration: 100, onUpdate() { m.chest(this.progress() >= 0.82); } }, 0);
    irisClose(tl, bg, inner, 95);
  }

  // Phones and short windows: no pinning. Each scene plays a short sequence when it arrives.
  function flowMode() {
    const cleanup = [];
    const scenes = $$(".scene");
    const active = new Set();
    scenes.forEach(sec => ScrollTrigger.create({
      trigger: sec, start: "top 55%", end: "bottom 45%",
      onToggle: s => { s.isActive ? active.add(sec) : active.delete(sec); const top = scenes.filter(x => active.has(x)).pop(); setWorld(top ? top.dataset.world : "paper"); }
    }));
    gsap.set(".scene-head > *, .cm-layer, .leads-stats div, .ml-phone, .ml-side > *", { autoAlpha: 0, y: 34 });
    ScrollTrigger.batch(".scene-head > *, .cm-layer, .leads-stats div, .ml-phone, .ml-side > *", {
      start: "top 88%", once: true,
      onEnter: els => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.09, overwrite: true })
    });
    // Content: the crew lights up in order while the card rides the line.
    const crew = $$(".cm-crew li");
    let ci = 0;
    const crewTimer = setInterval(() => { if (!$("#content").classList.contains("in-view")) return; crew.forEach((li, k) => li.classList.toggle("active", k === ci)); ci = (ci + 1) % 5; }, 1260);
    cleanup.push(() => clearInterval(crewTimer));
    const k30 = $(".cm-total b");
    ScrollTrigger.create({ trigger: k30, start: "top 85%", once: true, onEnter: () => EX.countK(k30) });
    // Leads: play the field once.
    const leads = $("#leads"), field = leadField(leads), state = { p: 0 };
    field.resize();
    ScrollTrigger.addEventListener("refresh", field.resize);
    cleanup.push(() => ScrollTrigger.removeEventListener("refresh", field.resize));
    gsap.to(state, { p: 0.97, duration: 7, ease: "none", onUpdate: () => field.draw(state.p), scrollTrigger: { trigger: $(".leads-canvas"), start: "top 80%", once: true } });
    // MobLife: screens cycle while the scene is on screen.
    const ml = $("#moblife"), m = mobLife(ml);
    let si = 0;
    const mlTimer = setInterval(() => {
      if (!ml.classList.contains("in-view") || document.hidden) return;
      si = (si + 1) % 6; m.screen(si); m.progress((si + 1) / 6); m.chest(si === 5);
    }, 2600);
    cleanup.push(() => clearInterval(mlTimer));
    return () => cleanup.forEach(fn => fn());
  }

  // Two ways to show the scenes:
  //   pinned: the full-screen, scroll-driven version. Used by the tour on a wide screen.
  //   plain:  an ordinary page you scroll down, with light motion. Used for "Just looking", on phones, and on short windows.
  const wide = matchMedia("(min-width: 900px) and (min-height: 620px)");
  let ctx = null, undo = null;
  try { EX.plain = sessionStorage.getItem("guide-mode") === "quiet"; } catch { EX.plain = false; }
  function build() {
    if (ctx) { undo && undo(); undo = null; ctx.revert(); setWorld("paper"); }
    const pin = wide.matches && !EX.plain;
    root.classList.toggle("pin", pin);
    EX.ranges = {};
    ctx = gsap.context(() => {
      if (pin) { pinContent(); undo = pinLeads(); pinMobLife(); }
      else undo = flowMode();
    });
    ScrollTrigger.refresh();
    document.dispatchEvent(new CustomEvent("ex:layout"));
  }
  EX.setPlain = on => { if (EX.plain === !!on) return; EX.plain = !!on; build(); };
  wide.addEventListener("change", build);
  build();
})();
