// Page basics: helpers, email popover, text splitting, count-ups, reveals, hero intro.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = root.classList.contains("reduced");
  const EX = (window.EX = { $, $$, reduced, ranges: {} });
  const hasGsap = !!window.gsap;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  // ----- Email popover. The plain href opens Gmail when Popover is missing or JS is off.
  const options = $("#email-options");
  let trigger = null;
  $$("[data-email]").forEach(link => {
    link.addEventListener("click", event => {
      if (typeof options?.showPopover !== "function") return;
      event.preventDefault();
      const wasOpen = options.matches(":popover-open"), same = trigger === link;
      if (wasOpen) { trigger?.setAttribute("aria-expanded", "false"); options.hidePopover(); }
      if (wasOpen && same) return;
      trigger = link; options.showPopover();
      const a = link.getBoundingClientRect(), b = options.getBoundingClientRect();
      options.style.left = `${Math.max(16, Math.min(a.left, innerWidth - b.width - 16))}px`;
      options.style.top = `${a.bottom + b.height + 24 <= innerHeight ? a.bottom + 8 : Math.max(16, a.top - b.height - 8)}px`;
      link.setAttribute("aria-expanded", "true");
      options.querySelector("a").focus();
    });
  });
  options?.addEventListener("toggle", e => { if (e.newState === "closed") trigger?.setAttribute("aria-expanded", "false"); });
  options?.addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); options.hidePopover(); trigger?.focus(); } });
  options?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => options.hidePopover()));
  addEventListener("resize", () => { if (options?.matches(":popover-open")) options.hidePopover(); });

  // ----- Split a heading into words and characters. Screen readers get the original text.
  EX.split = el => {
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    const lines = el.innerHTML.split(/<br\s*\/?>/i).map(l => l.replace(/<[^>]+>/g, "").trim());
    el.textContent = "";
    const chars = [];
    lines.forEach((line, li) => {
      if (li) el.append(document.createElement("br"));
      line.split(" ").forEach((word, i, all) => {
        const w = document.createElement("span");
        w.className = "split-word"; w.setAttribute("aria-hidden", "true");
        [...word].forEach(ch => { const c = document.createElement("span"); c.className = "split-char"; c.textContent = ch; w.append(c); chars.push(c); });
        el.append(w);
        if (i < all.length - 1) el.append(" ");
      });
    });
    return chars;
  };

  // ----- Count-ups. The final text is already in the HTML, so no-JS and reduced motion read correctly.
  const fmt = n => Math.round(n).toLocaleString("en-US");
  EX.countUp = el => {
    if (reduced || el.dataset.done) return;
    el.dataset.done = "1";
    const target = +el.dataset.count, pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
    const t0 = performance.now(), dur = 1100;
    const step = now => {
      const t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 3);
      el.textContent = pre + fmt(target * e) + suf;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  // 30K counts straight up and lands. Nobody should wait for a number.
  EX.countK = el => {
    if (reduced || el.dataset.done) return;
    el.dataset.done = "1";
    const target = +el.dataset.countK, t0 = performance.now(), dur = 1500;
    const step = now => {
      const t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 3);
      el.textContent = `${Math.round(target * e)}K`;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counters = $$("[data-count]:not([data-manual])");
  if (counters.length && !reduced && "IntersectionObserver" in window) {
    counters.forEach(el => { el.textContent = (el.dataset.prefix || "") + "0" + (el.dataset.suffix || ""); });
    const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { EX.countUp(en.target); io.unobserve(en.target); } }), { threshold: 0.6 });
    counters.forEach(el => io.observe(el));
  }

  // ----- Mark scenes that are on screen, so looping sprites sleep when out of view.
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => en.target.classList.toggle("in-view", en.isIntersecting)), { rootMargin: "80px" });
    $$(".scene").forEach(s => io.observe(s));
    // The recorded Promly tour plays only while visible.
    const vids = $$(".tour-video");
    const vio = new IntersectionObserver(entries => entries.forEach(en => {
      const v = en.target;
      if (en.isIntersecting && !reduced) v.play().then(() => v.classList.add("is-playing")).catch(() => v.classList.remove("is-playing"));
      else { v.pause(); v.classList.remove("is-playing"); }
    }), { threshold: 0.2 });
    vids.forEach(v => { v.muted = true; vio.observe(v); });
  }

  if (!hasGsap || reduced) return;

  // ----- Hero intro.
  const h1 = $("#lobby-title");
  const chars = EX.split(h1);
  const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
  intro.from(chars, { yPercent: 118, duration: 0.95, stagger: 0.024 }, 0.1)
    .from(".lobby .eyebrow", { autoAlpha: 0, y: 14, duration: 0.6 }, 0.1)
    .from("[data-rise]", { autoAlpha: 0, y: 26, duration: 0.8, stagger: 0.09 }, 0.55)
    .from(".frame", { autoAlpha: 0, y: 70, rotation: -7, duration: 1.1, ease: "back.out(1.5)" }, 0.35)
    .from(".ticker", { autoAlpha: 0, duration: 0.8 }, 0.9);

  // The hung portrait leans a little toward the pointer.
  const frame = $(".frame");
  if (frame && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const rx = gsap.quickTo(frame, "rotation", { duration: 0.8, ease: "power3.out" });
    const tx = gsap.quickTo(frame, "x", { duration: 0.8, ease: "power3.out" });
    $("#lobby").addEventListener("pointermove", e => { const k = e.clientX / innerWidth - 0.5; rx(1.6 + k * 3.2); tx(k * 14); });
    $("#lobby").addEventListener("pointerleave", () => { rx(1.6); tx(0); });
  }

  // ----- Scroll reveals for the paper sections.
  gsap.set("[data-reveal]", { autoAlpha: 0, y: 38 });
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%", once: true,
    onEnter: els => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: 0.1, overwrite: true })
  });
  $$(".timeline-bar i").forEach(el => {
    gsap.fromTo(el, { "--p": 0 }, { "--p": 1, duration: 1.4, ease: "power2.inOut", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
  });
  const exitTitle = $("#contact-title");
  if (exitTitle) {
    gsap.from(EX.split(exitTitle), { yPercent: 118, duration: 0.9, stagger: 0.035, ease: "power4.out", scrollTrigger: { trigger: exitTitle, start: "top 85%", once: true } });
  }
})();
