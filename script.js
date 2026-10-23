(() => {
  document.documentElement.classList.remove("no-js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Nav: scrolled state + mobile menu + active link ---------- */
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("menuToggle");
  const links = document.getElementById("navLinks");

  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    links.classList.toggle("open", open);
    nav.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setMenu(!links.classList.contains("open")));
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  const navAnchors = [...links.querySelectorAll('a[href^="#"]')];
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navAnchors.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  document.querySelectorAll("section[id]").forEach((s) => sectionObserver.observe(s));

  /* ---------- Reveal on scroll (staggered per batch) ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      let i = 0;
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = `${Math.min(i++ * 80, 400)}ms`;
        e.target.classList.add("in");
        e.target.addEventListener("transitionend", () => {
          e.target.style.transitionDelay = "";
          e.target.classList.add("settled");
        }, { once: true });
        revealObserver.unobserve(e.target);
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- Count-up stats ---------- */
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = Number(el.dataset.count);
        countObserver.unobserve(el);
        if (reduceMotion) { el.textContent = target; return; }
        const start = performance.now();
        const dur = 1600;
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

  /* ---------- Typing rotator ---------- */
  const typed = document.getElementById("typed");
  const words = [
    "full-stack products.",
    "React & Node.js apps.",
    "scalable APIs.",
    "cloud-native platforms.",
    "GenAI-powered features.",
  ];
  if (!reduceMotion) {
    let w = 0, c = words[0].length, deleting = true;
    typed.textContent = words[0];
    const step = () => {
      const word = words[w];
      c += deleting ? -1 : 1;
      typed.textContent = word.slice(0, c);
      let delay = deleting ? 40 : 75;
      if (!deleting && c === word.length) { deleting = true; delay = 2000; }
      else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
      setTimeout(step, delay);
    };
    setTimeout(step, 2200);
  } else {
    typed.textContent = words[0];
  }

  /* ---------- Cursor glow + card spotlight + tilt ---------- */
  if (finePointer && !reduceMotion) {
    const glow = document.querySelector(".cursor-glow");
    let gx = 0, gy = 0, tx = 0, ty = 0;
    window.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    const loop = () => {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.transform = `translate(${gx - 300}px, ${gy - 300}px)`;
      requestAnimationFrame(loop);
    };
    loop();

    document.querySelectorAll("[data-tilt]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", `${x * 100}%`);
        el.style.setProperty("--my", `${y * 100}%`);
        const max = el.classList.contains("hero-card") ? 8 : 4;
        el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) translateY(-2px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Copy email ---------- */
  const copyBtn = document.getElementById("copyEmail");
  const toast = document.getElementById("toast");
  copyBtn.addEventListener("click", async () => {
    const email = copyBtn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2200);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });

  /* ---------- Hero network canvas ---------- */
  const canvas = document.getElementById("network");
  const ctx = canvas.getContext("2d");
  let W, H, dpr, nodes = [], mouse = { x: -9999, y: -9999 }, running = true;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, (W * H) / 16000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6,
      hue: Math.random() < 0.5 ? "167,139,250" : "34,211,238",
    }));
  };

  const LINK = 140;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (const n of nodes) {
      if (!reduceMotion) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        const dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 120 && d > 0) { n.x += (dx / d) * 0.8; n.y += (dy / d) * 0.8; }
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(${a.hue},${(1 - d / LINK) * 0.22})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (md < 180) {
        ctx.strokeStyle = `rgba(103,232,249,${(1 - md / 180) * 0.35})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      ctx.fillStyle = `rgba(${a.hue},0.85)`;
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }
    if (running && !reduceMotion) requestAnimationFrame(draw);
  };

  resize();
  draw();
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (reduceMotion) draw(); }, 150); });
  const hero = document.querySelector(".hero");
  hero.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  hero.addEventListener("mouseleave", () => { mouse.x = mouse.y = -9999; });

  // Pause the canvas when the hero is off-screen
  new IntersectionObserver(([e]) => {
    const was = running;
    running = e.isIntersecting;
    if (running && !was && !reduceMotion) requestAnimationFrame(draw);
  }).observe(hero);
})();
