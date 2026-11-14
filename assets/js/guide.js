// Claudelius. Scripted lines from content/tour.json. No model, no key.
// Tour mode: a step-by-step walkthrough. Space, the right arrow, or a tap goes forward. The left
// arrow goes back. The page scrolls itself to each stop and manual scrolling is paused.
// Quiet mode ("Just looking"): the visitor scrolls freely and the guide sits in the corner.
(() => {
  const EX = window.EX;
  const el = document.getElementById("guide");
  if (!EX || !el) return;
  const { $, reduced } = EX;
  const root = document.documentElement;
  const body = $(".g-body", el), img = $("img", body), bubble = $(".g-bubble", el), textEl = $(".g-text", el);
  const live = $("#guide-live"), emote = $(".g-emote", el), choice = $(".g-choice", el), nav = $(".g-nav", el);
  const justBtn = $(".g-quiet", el), nextBtn = $(".g-next", el), backBtn = $(".g-back", el), countEl = $(".g-count", el), hintEl = $(".g-hint", el);
  const toggle = $(".tour-toggle");
  const hasGsap = !!window.gsap;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const store = (k, v) => { try { return v === undefined ? sessionStorage.getItem(k) : sessionStorage.setItem(k, v); } catch { return null; } };

  // ----- Sprite
  const SEQ = { idle: ["idle-0"], wave: ["wave-0", "wave-1", "wave-2", "wave-1"], walk: ["walk-0", "walk-1", "walk-2", "walk-3"], point: ["point-0", "point-1", "point-2"], deadpan: ["idle-1"], sleep: ["idle-2"] };
  const FRAMES = ["idle-0", "idle-1", "idle-2", "wave-0", "wave-1", "wave-2", "wave-3", "walk-0", "walk-1", "walk-2", "walk-3", "point-0", "point-1", "point-2", "point-3"];
  // Every frame is its own stacked image and only one is visible. Swapping one image's src can
  // show a blank frame while the new file decodes; flipping visibility cannot.
  let pose = "idle", fi = 0, tick = 0, blink = [], shown = img;
  const frames = { "wave-0": img };
  img.classList.add("on");
  FRAMES.forEach(n => {
    if (frames[n]) return;
    const f = img.cloneNode();
    f.classList.remove("on"); f.decoding = "sync"; f.src = `./assets/guide/${n}.webp`;
    body.insertBefore(f, img.nextSibling);
    frames[n] = f;
  });
  const show = n => {
    const f = frames[n];
    if (f === shown || !f.complete || !f.naturalWidth) return; // not loaded yet: keep the current frame
    shown.classList.remove("on"); f.classList.add("on"); shown = f;
  };
  const still = p => p === "idle" || p === "deadpan";
  const setPose = p => { if (pose === p) return; pose = p; fi = 0; el.classList.toggle("idle", still(p)); show(SEQ[p][0]); };
  const stepSprite = () => {
    tick++;
    if (pose === "idle") {
      if (tick % 30 === 0) blink = ["idle-1", "idle-2", "idle-1"];
      show(blink.length ? blink.shift() : "idle-0");
    } else if (pose === "point") { fi = Math.min(fi + 1, 2); show(SEQ.point[fi]); }
    else if (pose === "wave" || pose === "walk") { fi = (fi + 1) % SEQ[pose].length; show(SEQ[pose][fi]); }
  };
  if (!reduced) setInterval(() => { if (!document.hidden) stepSprite(); }, 150);

  // ----- Emotes
  let emoteTimer;
  const showEmote = (t, ms = 1600, act = false) => { clearTimeout(emoteTimer); emote.textContent = t; emote.classList.toggle("act", act); emote.classList.add("on"); if (ms) emoteTimer = setTimeout(() => emote.classList.remove("on"), ms); };
  const hideEmote = () => { clearTimeout(emoteTimer); emote.classList.remove("on"); };
  // The half-lidded frame is the deadpan stare. It is a standing frame, so it only plays while he
  // is standing. Mid-point or mid-wave it would snap his arm down and back up.
  const stare = ms => {
    if (pose !== "idle") return;
    setPose("deadpan");
    setTimeout(() => { if (pose === "deadpan") setPose("idle"); }, ms);
  };
  // An action like *tsk tsk* is shown above the head, never typed into the bubble.
  const react = act => { showEmote(act, 2000, true); stare(1700); };
  const flash = (name, ms) => { el.classList.remove(name); void el.offsetWidth; el.classList.add(name); setTimeout(() => el.classList.remove(name), ms); };
  const hop = () => { if (!reduced) flash("hop", 520); };

  // ----- Position. A spot is where the sprite stands: x from the left edge, lift above the floor,
  // flip (bubble on the sprite's left instead of its right), drop (bubble hangs down from the
  // sprite's head instead of rising from its feet), and which way it faces.
  // A plain number is a floor spot, as a percent across the screen. Phones stay docked bottom left.
  const mobile = () => innerWidth <= 700;
  let gx = -160, gy = 0, walking = false, lastSpot = 5;
  // The usable width. innerWidth counts an always-visible scrollbar (most Windows machines), which
  // would let the bubble slide a few pixels under it.
  const pageW = () => root.clientWidth;
  const xFor = pct => (mobile() ? 6 : Math.round(8 + (pageW() - el.offsetWidth - 16) * pct / 100));
  const floorSpot = pct => ({ x: xFor(pct), lift: 0, flip: !mobile() && pct > 50, drop: false, face: !mobile() && pct > 50 ? -1 : 1 });
  const asSpot = t => (typeof t === "number" ? floorSpot(t) : t);
  const dress = s => {
    el.classList.toggle("right", !!s.flip); el.classList.toggle("drop", !!s.drop);
    el.style.setProperty("--face", s.face || (s.flip ? -1 : 1));
    if (s.bw) el.style.setProperty("--bw", `${s.bw}px`); else el.style.removeProperty("--bw");
  };
  const place = (x, lift = 0) => { gx = x; gy = lift; if (hasGsap) gsap.set(el, { x, y: -lift }); else el.style.transform = `translate(${x}px, ${-lift}px)`; };
  function moveTo(target, then) {
    lastSpot = target;
    // Whole pixels at rest, so the sprite is never drawn between two pixels and blurred.
    const s = { ...asSpot(target) }; s.x = Math.round(s.x); s.lift = Math.round(s.lift);
    const dx = s.x - gx, dy = s.lift - gy, dist = Math.hypot(dx, dy);
    stand();
    if (dist < 6 || reduced || !hasGsap) { place(s.x, s.lift); dress(s); then && then(false); return; }
    walking = true;
    bubble.classList.remove("on");
    // Walking frames only suit a sideways move. Up, down and diagonal moves glide in the standing pose.
    const stroll = Math.abs(dy) <= Math.abs(dx) * 0.35;
    el.style.setProperty("--face", stroll ? (dx >= 0 ? 1 : -1) : s.face || (s.flip ? -1 : 1));
    setPose(stroll ? "walk" : "idle");
    gsap.to(el, {
      x: s.x, y: -s.lift, duration: clamp(dist / 640, 0.35, 1.1), ease: stroll && !dy ? "none" : "power2.inOut", overwrite: true,
      onUpdate() { gx = gsap.getProperty(el, "x"); gy = -gsap.getProperty(el, "y"); },
      onComplete() { place(s.x, s.lift); walking = false; dress(s); setPose("idle"); then && then(true); }
    });
  }

  // ----- Speech
  let token = 0, timers = [], typing = null;
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  // {p} and {pp} are pauses. *words* are actions. Neither is typed into the bubble.
  function build(line) {
    textEl.textContent = "";
    const units = [];
    let hasText = false, lastSpace = false, aside = false;
    line.split(/(\*[^*]+\*|\{pp?\})/).forEach(part => {
      if (!part) return;
      if (part === "{p}" || part === "{pp}") return units.push({ pause: part === "{p}" ? 520 : 1050 });
      if (part[0] === "*" && part.length > 2) return units.push({ act: part.slice(1, -1) });
      [...part].forEach(ch => {
        if (ch === " " && (lastSpace || !hasText)) return; // no doubled or leading space where a token was removed
        lastSpace = ch === " "; hasText = true;
        if (ch === "(") aside = true; // text in parentheses is an aside: quieter, italic, said under the breath
        const span = document.createElement("span"); span.className = aside ? "c aside" : "c"; span.textContent = ch; textEl.append(span); units.push({ node: span, ch });
        if (ch === ")") aside = false;
      });
    });
    return units;
  }
  const plain = line => line.replace(/\*[^*]+\*|\{pp?\}/g, "").replace(/\s+/g, " ").trim();
  function typeLine(line, my, done, pace = 1) {
    const units = build(line);
    bubble.classList.remove("silent");
    bubble.classList.add("on");
    let i = 0;
    const finish = () => {
      units.forEach(u => u.node && u.node.classList.add("v"));
      typing = null;
      live.textContent = `Claudelius: ${plain(line)}`;
      done();
    };
    if (reduced) return finish();
    typing = { finish: () => { if (my === token) { clearTimers(); finish(); } } };
    const step = () => {
      if (my !== token) return;
      if (i >= units.length) return finish();
      const u = units[i++];
      if (u.pause) { if (u.pause > 800) stare(u.pause + 200); return later(step, u.pause * pace); } // the beat before a punchline
      if (u.act) { react(u.act); return later(step, 450); }
      u.node.classList.add("v");
      later(step, (/[.!?…]/.test(u.ch) ? 190 : /[,;:]/.test(u.ch) ? 70 : 17) * pace);
    };
    step();
  }
  // Says lines in order. keep: leave the bubble up afterwards (tour mode). after: runs once the bubble hides.
  function say(lines, opt = {}) {
    const my = ++token;
    clearTimers(); typing = null;
    bubble.classList.remove("ready");
    choice.hidden = true; nav.hidden = !opt.keep;
    stand(); hideEmote();
    let i = 0;
    const next = () => {
      if (my !== token) return;
      if (opt.pose && !walking) setPose(opt.pose);
      const line = lines[i++];
      typeLine(line, my, () => {
        if (my !== token) return;
        if (i < lines.length) return later(next, clamp(1400 + line.length * 24, 1800, 4200));
        later(() => setPose("idle"), 1400);
        // He is done talking: light up the button that moves on.
        later(() => { if (my === token) bubble.classList.add("ready"); }, 320);
        if (opt.choice) { choice.hidden = false; nav.hidden = true; return; }
        if (!opt.keep) later(() => { bubble.classList.remove("on"); opt.after && opt.after(); }, clamp(3200 + line.length * 30, 3600, 8000));
      }, opt.pace);
    };
    next();
  }
  const hush = () => { token++; clearTimers(); typing = null; choice.hidden = true; bubble.classList.remove("ready"); };

  // ----- Idle: sit after a while, then doze.
  let idleTimers = [], asleep = false;
  // Asleep: eyes shut and z's drift up from his head. Waking is a startled jolt, eyes wide open
  // for a beat, then a slow blink.
  const zzz = document.createElement("span");
  zzz.className = "g-zzz"; zzz.setAttribute("aria-hidden", "true"); zzz.innerHTML = "<i>z</i><i>z</i><i>Z</i>";
  el.append(zzz);
  const wakeUp = () => {
    asleep = false; el.classList.remove("asleep", "sit");
    if (pose === "sleep") setPose("idle");
    blink = ["idle-0", "idle-0", "idle-0", "idle-1", "idle-2", "idle-2", "idle-1", "idle-0"];
    showEmote("!", 900, true);
    if (!reduced) flash("startle", 750);
  };
  const stand = () => { el.classList.remove("sit"); if (asleep) wakeUp(); };
  function armIdle() {
    idleTimers.forEach(clearTimeout); idleTimers = [];
    if (reduced) return;
    idleTimers.push(setTimeout(() => { if (!typing && !walking) el.classList.add("sit"); }, 26000));
    idleTimers.push(setTimeout(() => { if (el.classList.contains("sit") && mode === "tour") { asleep = true; setPose("sleep"); el.classList.add("asleep"); } }, 56000));
  }

  // ----- Steps. One step per line, plus a few silent stops where the visual speaks.
  let tour = null, steps = [], cur = -1;
  let mode = store("guide-mode") === "quiet" ? "quiet" : "tour";
  let chosen = store("guide-chosen") === "1";
  let pendingAside = null, fastDone = false, wakeDone = false, presses = [];
  const maxScroll = () => Math.max(0, root.scrollHeight - innerHeight);
  function yFor(b) {
    let y;
    if (b.scroll != null) y = b.scroll;
    else if (b.sec && EX.ranges[b.sec]) { const [s, e] = EX.ranges[b.sec](); y = s + (e - s) * b.at; }
    else {
      const node = $(b.mel || b.el || "#" + b.sec);
      const off = b.top != null ? Math.min(b.top, innerHeight * 0.24) : Math.max(72, innerHeight * 0.13);
      y = node ? node.getBoundingClientRect().top + scrollY - off : 0;
    }
    return Math.round(clamp(y, 0, maxScroll()));
  }
  const measure = () => { steps.forEach(s => { s.y = yFor(s.b); }); };

  // ----- Roaming. With "roam": true in tour.json the guide stands near what it is talking about
  // instead of always on the floor. Set it to false to put it back on the floor everywhere.
  const SPRITE = 120, TOP = 78, EDGE = 12;
  // The key hint under the buttons only shows for the first few steps, so later bubbles are shorter.
  const HINT_STEPS = 3;
  const bubbleH = (line, bw, hint) => (hint ? 122 : 96) + Math.ceil(plain(line || "").length / Math.max(18, Math.floor((bw - 34) / 7.6))) * 23;
  // Hand-placed spots, used inside the three scenes where the layout is known.
  function fromStand(b, y, line, hint) {
    const st = b.stand, by = $(st.by);
    if (!by) return b.x;
    const stage = by.closest(".stage"), pinned = stage && EX.ranges[b.sec];
    if (stage && !pinned) return b.x; // the scene is not pinned at this window size, so stay on the floor
    let r;
    if (pinned) { // measured from layout, so it is right even while the scene is mid-animation
      let x = 0, t = 0, n = by;
      while (n && n !== stage) { x += n.offsetLeft; t += n.offsetTop; n = n.offsetParent; }
      r = { left: x, top: t, width: by.offsetWidth, height: by.offsetHeight };
    } else { const q = by.getBoundingClientRect(); r = { left: q.left, top: q.top + scrollY - y, width: q.width, height: q.height }; }
    const bw = st.bw || 400, bh = bubbleH(line, bw, hint), gap = st.gap ?? 20, flip = st.bubble === "left", drop = st.drop !== false;
    let sx, sy;
    if (st.fx != null) { sx = r.left + st.fx * r.width; sy = r.top + st.fy * r.height; }
    else {
      sx = st.align === "end" ? r.left + r.width - SPRITE : st.align === "center" ? r.left + (r.width - SPRITE) / 2 : r.left;
      sy = st.side === "above" ? r.top - gap - SPRITE : r.top + r.height + gap;
    }
    sx = clamp(sx, flip ? bw + 18 : EDGE, pageW() - EDGE - SPRITE - (flip ? 0 : bw + 6));
    const lowest = innerHeight - EDGE - (drop ? Math.max(SPRITE, bh + 8) : SPRITE);
    if (sy > lowest + 26) return b.x; // not enough room below on this screen: use the floor rather than cover the scene
    sy = clamp(sy, TOP + (drop ? 0 : Math.max(0, bh - 104)), lowest);
    return { x: Math.round(sx), lift: Math.round(innerHeight - 10 - SPRITE - sy), flip, drop, face: st.face || (flip ? -1 : 1), bw };
  }
  // Free-space search, used in the paper sections. It tries positions all over the screen, never
  // covers the lit item, prefers empty space over dimmed content, and stays as close as it can.
  const CONTENT = "main h1, main h2, main h3, main p, main dl, main figure, main .piece-art, main .print, main .small, main .button, main .play-badge, main .chips-list, .ticker";
  function solve(b, y, line, hint) {
    const fEl = $(b.focus);
    if (!fEl) return null;
    const vw = pageW(), vh = innerHeight, shift = scrollY - y, pad = 16;
    const view = r => ({ left: r.left, right: r.right, top: r.top + shift, bottom: r.bottom + shift });
    const F = view(fEl.getBoundingClientRect()), Fp = { left: F.left - pad, right: F.right + pad, top: F.top - pad, bottom: F.bottom + pad };
    const others = [...document.querySelectorAll(CONTENT)].filter(n => !fEl.contains(n) && !n.contains(fEl)).map(n => view(n.getBoundingClientRect())).filter(r => r.bottom > 0 && r.top < vh && r.right > r.left);
    const hit = (a, c) => Math.max(0, Math.min(a.right, c.right) - Math.max(a.left, c.left)) * Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top));
    const hintX = xFor(b.x);
    let best = null;
    // Two bubble shapes: the usual one, and a wider, shorter one for tight spaces.
    for (const bw of [400, 520]) for (const flip of [false, true]) for (const drop of [true, false]) {
      const bh = bubbleH(line, bw, hint);
      for (let sy = TOP; sy <= vh - EDGE - SPRITE; sy += 18) for (let sx = EDGE; sx <= vw - EDGE - SPRITE; sx += 18) {
        const bl = flip ? sx - 6 - bw : sx + SPRITE + 6, bt = drop ? sy + 8 : sy + 104 - bh;
        const bub = { left: bl, right: bl + bw, top: bt, bottom: bt + bh };
        if (bub.left < EDGE || bub.right > vw - EDGE || bub.top < TOP || bub.bottom > vh - EDGE) continue;
        const spr = { left: sx, right: sx + SPRITE, top: sy, bottom: sy + SPRITE };
        // Covering the lit item is the worst outcome. It is only chosen if nothing else fits, and then as little as possible.
        const covered = hit(spr, Fp) + hit(bub, Fp);
        let cost = covered ? 4000 + covered * 0.05 : 0;
        for (const r of others) cost += (hit(spr, r) + hit(bub, r)) * 0.004;
        const cx = sx + 60, cy = sy + 60;
        cost += Math.hypot(Math.max(F.left - cx, 0, cx - F.right), Math.max(F.top - cy, 0, cy - F.bottom)) + Math.abs(sx - hintX) * 0.03 + (bw > 400 ? 12 : 0);
        if (!best || cost < best.cost) best = { cost, x: sx, lift: vh - 10 - SPRITE - sy, flip, drop, face: (F.left + F.right) / 2 >= cx ? 1 : -1, bw };
      }
    }
    return best;
  }
  function spotFor(s) {
    const b = s.b;
    if (!tour.roam || mobile()) return b.x;
    const hint = steps.indexOf(s) < HINT_STEPS;
    if (b.stand) return fromStand(b, s.y, s.line, hint);
    if (b.focus) return solve(b, s.y, s.line, hint) || b.x;
    return b.x;
  }

  // Spotlight: the part being talked about stays lit and the rest of the page dims.
  const spot = document.createElement("div");
  spot.className = "spot"; spot.setAttribute("aria-hidden", "true");
  document.body.append(spot);
  let spotSel = null, spotTimer = 0;
  const placeSpot = () => {
    const t = spotSel && $(spotSel);
    if (!t) return;
    const r = t.getBoundingClientRect(), pad = mobile() ? 8 : 16;
    Object.assign(spot.style, { top: `${r.top + scrollY - pad}px`, left: `${r.left + scrollX - pad}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px` });
  };
  // travel is how long the page will be scrolling to reach this step, in ms. 0 means it stays put.
  function focusOn(sel, travel = 0) {
    clearTimeout(spotTimer);
    const lit = spot.classList.contains("on") && !!spotSel;
    spotSel = sel || null;
    if (!spotSel) {
      spot.classList.remove("on", "glide");
      // Once faded, park it at the top. Left where it was, the invisible box still stretches the
      // page, and after the tour the plain layout is far shorter than the tour layout.
      spotTimer = setTimeout(() => Object.assign(spot.style, { top: "0px", left: "0px", width: "0px", height: "0px" }), 500);
      return;
    }
    // Two things on the same screen: slide the light from one to the other.
    if (lit && !travel) { spot.classList.add("glide"); return placeSpot(); }
    // Otherwise never drag the shade across the page. Fade out, let the page arrive, then fade in on the new spot.
    spot.classList.remove("on", "glide");
    spotTimer = setTimeout(() => { placeSpot(); void spot.offsetWidth; spot.classList.add("on"); spotTimer = setTimeout(placeSpot, 900); }, travel ? travel + 220 : 80);
  }

  // The page scrolls itself. auto marks our own scrolling so the guard below leaves it alone.
  let auto = false, autoT = 0, scrollTween = null;
  const settle = () => {
    if (!window.ScrollTrigger) return;
    ScrollTrigger.update();
    ScrollTrigger.getAll().forEach(st => { const t = st.getTween && st.getTween(); if (t) t.progress(1); });
  };
  const travelTime = y => clamp(Math.abs(y - scrollY) / 1300, 0.5, 2.1); // seconds
  // slow: a step can ask for a longer, steadier ride (seconds) so the scene it passes through can be seen.
  function scrollToY(y, instant, slow) {
    auto = true; clearTimeout(autoT);
    if (scrollTween) { scrollTween.kill(); scrollTween = null; }
    const release = () => { autoT = setTimeout(() => { auto = false; }, 260); };
    if (instant || reduced || !hasGsap) { scrollTo({ top: y, behavior: "instant" }); settle(); return release(); }
    const o = { y: scrollY }, d = Math.abs(y - scrollY);
    if (d < 2) return release();
    scrollTween = gsap.to(o, { y, duration: slow || travelTime(y), ease: slow ? "power1.inOut" : "power2.inOut", onUpdate: () => scrollTo({ top: o.y, behavior: "instant" }), onComplete: () => { scrollTween = null; release(); } });
  }

  function updateNav() {
    countEl.textContent = `${cur + 1} / ${steps.length}`;
    backBtn.disabled = cur <= 0;
    nextBtn.textContent = cur === steps.length - 1 ? "Finish" : "Next";
  }
  function present(s, moved) {
    const lines = [];
    if (pendingAside) { lines.push(pendingAside); pendingAside = null; }
    if (s.line) lines.push(s.line);
    if (!lines.length) {
      // Silent stop: the bubble shows only the controls.
      textEl.textContent = ""; live.textContent = "";
      bubble.classList.add("silent", "on"); nav.hidden = false;
      setPose(s.b.pose || "idle");
      return;
    }
    if (!moved) hop(); // he just arrived from a move: that is enough motion already
    say(lines, { pose: s.b.pose, keep: true, choice: s.last && s.b.choice && !chosen, pace: s.b.pace });
  }
  function go(i, instant) {
    cur = clamp(i, 0, steps.length - 1);
    const s = steps[cur];
    hush(); updateNav(); armIdle();
    el.classList.toggle("nohint", cur >= HINT_STEPS);
    const far = Math.abs(s.y - scrollY) > 6;
    const slow = !instant && EX.ranges[s.b.sec] ? s.b.travel : 0; // only where the scene is scroll-driven
    focusOn(s.b.focus, !far ? 0 : instant || reduced || !hasGsap ? 250 : (slow || travelTime(s.y)) * 1000);
    scrollToY(s.y, instant, slow);
    moveTo(spotFor(s), moved => present(s, moved));
  }
  function next() {
    if (mode !== "tour" || cur < 0) return;
    if (typing) return typing.finish();
    if (!choice.hidden) return choose("tour");
    if (asleep) {
      if (!wakeDone) { wakeDone = true; pendingAside = tour.asides.wake; }
      wakeUp();
      return setTimeout(advance, 850); // let the startle land before he walks off
    }
    advance();
  }
  function advance() {
    if (mode !== "tour") return;
    const now = performance.now();
    presses = presses.filter(t => now - t < 2600); presses.push(now);
    if (presses.length >= 4 && !fastDone) { fastDone = true; pendingAside = tour.asides.fast; }
    if (cur >= steps.length - 1) return setMode("quiet", true);
    go(cur + 1);
  }
  function back() {
    if (mode !== "tour" || cur <= 0) return;
    go(cur - 1, true);
  }
  function choose(pick) {
    choice.hidden = true;
    chosen = true; store("guide-chosen", "1");
    if (pick === "quiet") return setMode("quiet");
    nav.hidden = false;
    go(cur + 1);
  }

  // ----- Modes
  // Swap between the full scenes and the plain page, keeping the visitor in the same section.
  function relayout(plain) {
    if (!EX.setPlain || EX.plain === plain) return;
    let anchor = null;
    for (const sec of document.querySelectorAll("main > section")) if (sec.getBoundingClientRect().top <= innerHeight * 0.4) anchor = sec;
    EX.setPlain(plain);
    if (anchor) scrollTo({ top: Math.max(0, anchor.getBoundingClientRect().top + scrollY - (anchor.id === "lobby" ? 0 : 70)), behavior: "instant" });
  }
  function setMode(m, silent) {
    mode = m; store("guide-mode", m);
    root.classList.toggle("tour-lock", m === "tour");
    if (toggle) { toggle.setAttribute("aria-pressed", String(m === "tour")); toggle.querySelector("span").textContent = m === "tour" ? "Tour on" : "Tour off"; }
    body.setAttribute("aria-label", m === "tour" ? "Claudelius, the tour guide. Press for a comment." : "Claudelius is quiet. Press to start the tour again.");
    try { history.scrollRestoration = m === "tour" ? "manual" : "auto"; } catch {}
    if (m === "quiet") {
      if (scrollTween) { scrollTween.kill(); scrollTween = null; }
      auto = false;
      focusOn(null);
      relayout(true); // "Just looking" gets the plain page: ordinary scrolling, light motion
      const corner = () => { bubble.classList.remove("on"); moveTo(96, () => { el.classList.add("sit"); setPose("idle"); }); };
      if (silent) { hush(); corner(); }
      else say([tour.quiet], { after: corner });
      return;
    }
    chosen = true; store("guide-chosen", "1");
    relayout(false); // the tour gets the full scenes back
    measure();
    let i = 0;
    steps.forEach((s, k) => { if (s.y <= scrollY + innerHeight * 0.3) i = k; });
    while (i > 0 && steps[i - 1].y === steps[i].y) i--;
    go(i);
  }

  // ----- Input
  nextBtn.addEventListener("click", next);
  backBtn.addEventListener("click", back);
  justBtn.addEventListener("click", () => setMode("quiet", true));
  choice.addEventListener("click", e => { const pick = e.target.closest("[data-choice]")?.dataset.choice; if (pick) choose(pick); });
  toggle?.addEventListener("click", () => setMode(mode === "tour" ? "quiet" : "tour", true));
  // Poking the guide runs through a fixed list in order. Each entry has a line and a reaction.
  let pokeIndex = 0;
  const hold = (p, ms) => { setPose(p); setTimeout(() => { if (pose === p) setPose("idle"); }, ms); };
  const REACT = {
    hop,
    blink: () => { blink = ["idle-1", "idle-2", "idle-2", "idle-1", "idle-0", "idle-1", "idle-2", "idle-1"]; },
    flip: () => { el.style.setProperty("--face", el.style.getPropertyValue("--face").trim() === "-1" ? 1 : -1); setTimeout(() => dress(asSpot(lastSpot)), 1800); },
    wave: () => hold("wave", 2400),
    point: () => hold("point", 2600),
    deadpan: () => hold("deadpan", 2600),
    sit: () => { el.classList.add("sit"); setTimeout(() => el.classList.remove("sit"), 3400); },
    spin: () => flash("spin", 900),
    duck: () => flash("duck", 1700)
  };
  body.addEventListener("click", () => {
    if (!tour) return;
    if (mode === "quiet") return setMode("tour");
    if (typing) return typing.finish();
    armIdle();
    const list = tour.asides.poke, item = list[pokeIndex++ % list.length];
    if (item.do === "walk") { hush(); return moveTo(gx > innerWidth / 2 ? 5 : 92, () => say([item.t], { keep: true })); }
    say([item.t], { keep: true });
    (REACT[item.do] || hop)();
  });
  // After a mouse or touch press on one of our controls, hand the keyboard back to the page.
  // Otherwise Space would press that same button again instead of moving the tour forward.
  document.addEventListener("click", e => {
    const b = e.detail > 0 && e.target.closest(".guide button, .chip, .tour-toggle");
    if (b) b.blur();
  });
  // A tap or click anywhere that is not a control moves the tour forward.
  document.addEventListener("click", e => {
    if (mode !== "tour" || !tour) return;
    if (e.target.closest("a, button, input, video, [popover], .g-choice")) return;
    if (String(getSelection?.() || "").length) return;
    next();
  });
  // Section links jump the tour to that section instead of scrolling past it.
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || mode !== "tour" || !tour) return;
    const target = document.getElementById(a.getAttribute("href").slice(1));
    if (!target) return;
    e.preventDefault();
    go(stepFor(target), true);
  });
  const stepFor = target => {
    const top = target.getBoundingClientRect().top + scrollY;
    const i = steps.findIndex(s => s.y >= top - innerHeight * 0.5);
    return i < 0 ? steps.length - 1 : i;
  };
  document.addEventListener("keydown", e => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || !tour) return;
    if (e.key === "Escape") { if (typing) typing.finish(); return; }
    if (mode !== "tour") return;
    const t = e.target;
    if (t.closest && t.closest("input, textarea, select, [contenteditable]")) return;
    if (e.key === " " || e.key === "Spacebar") {
      if (t.closest && t.closest("a, button")) return; // let a focused control handle its own Space
      e.preventDefault(); next();
    } else if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
    else if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(e.key)) { e.preventDefault(); nudge(); }
  });

  // ----- Scroll is paused during the tour. Trying to scroll points at the controls.
  const HINT = () => (mobile() ? "Tap anywhere for next." : "Space or → for next. ← to go back.");
  let nudgeT = 0, nudgeAt = 0;
  function nudge() {
    const now = performance.now();
    if (now - nudgeAt < 900) return;
    nudgeAt = now;
    hintEl.textContent = "Scrolling is paused during the tour. Use Next, or pick Just looking.";
    bubble.classList.add("on"); nav.hidden = !choice.hidden;
    bubble.classList.remove("nudge"); void bubble.offsetWidth; bubble.classList.add("nudge");
    showEmote("!", 1100);
    clearTimeout(nudgeT);
    nudgeT = setTimeout(() => { hintEl.textContent = HINT(); bubble.classList.remove("nudge"); }, 3600);
  }
  const block = e => {
    if (mode !== "tour" || !tour) return;
    if (e.target.closest && e.target.closest(".cm-cards, .email-options")) return; // sideways gallery still swipes
    e.preventDefault(); nudge();
  };
  addEventListener("wheel", block, { passive: false });
  addEventListener("touchmove", block, { passive: false });
  // Anything that still moves the page (scrollbar drag, find-in-page) gets put back.
  let guardT = 0;
  addEventListener("scroll", () => {
    if (mode !== "tour" || auto || cur < 0) return;
    clearTimeout(guardT);
    guardT = setTimeout(() => { if (mode === "tour" && !auto && Math.abs(scrollY - steps[cur].y) > 6) scrollToY(steps[cur].y, true); }, 140);
  }, { passive: true });

  const remeasure = () => {
    if (!tour) return;
    measure(); placeSpot();
    hintEl.textContent = HINT();
    if (!walking) {
      const t = mode === "quiet" ? 96 : cur >= 0 ? spotFor(steps[cur]) : lastSpot, s = asSpot(t);
      lastSpot = t; place(s.x, s.lift); dress(s);
    }
    if (mode === "tour" && cur >= 0 && !auto && Math.abs(scrollY - steps[cur].y) > 6) scrollToY(steps[cur].y, true);
  };
  addEventListener("resize", remeasure);
  document.addEventListener("ex:layout", remeasure);
  if (window.ScrollTrigger) ScrollTrigger.addEventListener("refresh", remeasure);

  // ----- Start
  fetch("./content/tour.json").then(r => { if (!r.ok) throw new Error("tour"); return r.json(); }).then(data => {
    tour = data;
    let seen = false;
    try { seen = !!localStorage.getItem("ex-seen"); localStorage.setItem("ex-seen", "1"); } catch {}
    const beats = data.beats.map((b, i) => (i === 0 && seen && !chosen ? { ...b, lines: [data.asides.returning] } : b));
    beats.forEach(b => {
      if (!b.lines || !b.lines.length) return steps.push({ b, line: null, last: true });
      b.lines.forEach((line, i) => steps.push({ b, line, last: i === b.lines.length - 1 }));
    });
    measure();
    hintEl.textContent = HINT();
    el.classList.add("ready");
    if (toggle) toggle.hidden = false;

    const chips = $("#chips");
    if (chips) {
      const list = $(".chips-list", chips);
      data.chips.forEach(c => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "chip"; b.textContent = c.q;
        b.addEventListener("click", () => {
          hush(); focusOn(null);
          const quiet = mode === "quiet";
          // In the tour he answers from where he already stands, which is clear of the buttons.
          moveTo(quiet || !tour.roam ? 92 : lastSpot, () => say([c.a], { pose: "point", keep: !quiet, after: quiet ? () => moveTo(96, () => el.classList.add("sit")) : null }));
        });
        list.append(b);
      });
      chips.hidden = false;
    }

    if (mode === "quiet") { place(xFor(96)); dress(floorSpot(96)); setMode("quiet", true); return; }
    root.classList.add("tour-lock");
    try { history.scrollRestoration = "manual"; } catch {}
    const target = location.hash && document.getElementById(location.hash.slice(1));
    if (target) { const i = stepFor(target); place(xFor(steps[i].b.x)); dress(floorSpot(steps[i].b.x)); go(i, true); }
    else { scrollTo({ top: 0, behavior: "instant" }); place(-160); setTimeout(() => go(0, true), reduced ? 0 : 900); }
  }).catch(() => { el.remove(); });
})();
