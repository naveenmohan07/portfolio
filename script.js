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
    "scalable full-stack platforms.",
    "cloud-native systems on AWS.",
    "high-performance APIs.",
    "production GenAI applications.",
    "multi-agent AI workflows.",
    "end-to-end product experiences.",
  ];
  if (!reduceMotion) {
    let w = 0, c = words[0].length, deleting = true;
    typed.textContent = words[0];
    const step = () => {
      const word = words[w];
      c += deleting ? -1 : 1;
      typed.textContent = word.slice(0, c);
      let delay = deleting ? 28 : 62;
      if (!deleting && c === word.length) { deleting = true; delay = 2200; }
      else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
      setTimeout(step, delay);
    };
    setTimeout(step, 2200);
  } else {
    typed.textContent = words[0];
  }

  /* ---------- "Ask Naveen" chat ---------- */
  const chatBody = document.getElementById("chatBody");
  if (chatBody) {
    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("chatInput");
    const suggest = document.getElementById("chatSuggest");

    // Scripted answers matched by keyword. `html` (optional) replaces the plain text once streaming ends.
    const KB = [
  {
    keys: [
      "contact", "email", "hire", "reach", "phone", "call", "connect",
      "linkedin", "touch", "github", "git", "medium", "blog", "article", "social"
    ],
    text: "The best way to reach Naveen is by email at naveenmsj@gmail.com. You can also connect with him on LinkedIn, GitHub (naveenmohan07), and Medium. He is open to senior full stack engineering and Generative AI opportunities.",
    html: 'The best way to reach Naveen is by email at <a href="mailto:naveenmsj@gmail.com">naveenmsj@gmail.com</a>. You can also connect with him on <a href="https://www.linkedin.com/in/naveemohan" target="_blank" rel="noopener noreferrer">LinkedIn</a>, <a href="https://github.com/naveenmohan07" target="_blank" rel="noopener noreferrer">GitHub</a>, and <a href="https://medium.com/@naveenmohan07" target="_blank" rel="noopener noreferrer">Medium</a>. He is open to senior full stack engineering and Generative AI opportunities.'
  },
  {
    keys: [
      "award", "awards", "recognition", "recognition", "spot award", "a&b"
    ],
    text: "Naveen has received 8+ Spot Awards and 2 A&B Awards at Presidio in recognition of his contributions. His work also includes an open-source NPM package and published articles on AI and software engineering."
  },
  {
    keys: [
      "impact", "win", "achiev", "proud", "result", "metric",
      "biggest", "highlight", "performance", "improvement"
    ],
    text: "Naveen's key achievements include improving end-to-end processing time by 60% for an AI video generation platform, reducing manual review by 80% through AWS Step Functions media workflows, and publishing an open-source NPM package that makes Flutter project setup approximately 30% faster. He has also received 8+ Spot Awards and 2 A&B Awards at Presidio."
  },
  {
    keys: [
      "genai", "gen ai", "generative ai", "artificial intelligence",
      "llm", "rag", "agent", "langgraph", "langchain", "model", "mcp", "ml"
    ],
    text: "Generative AI is Naveen's core specialisation. He builds retrieval-augmented generation (RAG) pipelines, LangGraph-based multi-agent workflows with shared persistent memory and dynamic model selection, and LLM evaluation frameworks using DeepEval. He also integrates tools through the Model Context Protocol (MCP) and works with open-source models such as Whisper, Demucs, and Wan Image-to-Video on AWS GPU infrastructure."
  },
  {
    keys: [
      "stack", "tech", "skill", "language", "framework", "tool",
      "react", "node", "python", "typescript", "technology"
    ],
    text: "Naveen's technology stack spans frontend, backend, mobile, cloud, and AI engineering. Frontend: React and Angular. Mobile: React Native and Flutter. Backend: Node.js, FastAPI, Python, and TypeScript. Data: PostgreSQL, DynamoDB, Pinecone, and OpenSearch. Cloud and DevOps: AWS, CDK, Docker, and CI/CD. Generative AI: LangGraph, LangChain, RAG, multi-agent systems, MCP, and LLM evaluation."
  },
  {
    keys: [
      "aws", "cloud", "devops", "infra", "cdk", "ci/cd",
      "deploy", "docker", "serverless", "gpu", "infrastructure"
    ],
    text: "Naveen designs and delivers cloud infrastructure on AWS, using services including Lambda, ECS, AWS Batch with GPU workloads, Step Functions, Bedrock, SQS, Cognito, and CloudFront. He provisions infrastructure using AWS CDK and builds automated CI/CD pipelines to support reliable deployments, scalable workloads, and production operations."
  },
  {
    keys: [
      "mobile", "flutter", "app", "react native", "ios",
      "android", "mobile development"
    ],
    text: "Naveen has delivered mobile applications using Flutter and React Native. His experience includes owning a production Flutter app end to end, from architecture and offline draft storage for users with unreliable network connectivity to CI/CD and app store releases. He has also built a voice-enabled AI interface using React Native."
  },
  {
    keys: [
      "experience", "year", "presidio", "career", "work",
      "job", "role", "senior", "professional experience"
    ],
    text: "Naveen has over 5 years of professional experience at Presidio, progressing from Associate Engineer and Engineer to Senior Engineer in March 2024. His experience spans full stack development, REST APIs, mobile applications, AWS infrastructure, CI/CD automation, and Generative AI platforms. He also leads and mentors a team of four engineers."
  },
  {
    keys: [
      "education", "college", "degree", "study", "university", "btech"
    ],
    text: "Naveen holds a B.Tech in Information Technology from Kongu Engineering College, Perundurai, completed between 2017 and 2021."
  },
  {
    keys: [
      "lead", "team", "mentor", "manage", "leadership",
      "design review", "technical leadership"
    ],
    text: "Naveen leads and mentors a team of four engineers, facilitates technical design reviews, promotes engineering best practices, and guides technical delivery from architecture and implementation through release. He combines hands-on engineering with team leadership and technical decision-making."
  },
  {
    keys: [
      "build", "do", "who", "about", "yourself", "naveen",
      "full stack", "fullstack", "developer", "engineer", "introduction"
    ],
    text: "Naveen is a Senior Full Stack Engineer with 5+ years of experience building and scaling production applications across web, mobile, and cloud platforms. He works across React and Angular frontends, React Native and Flutter mobile apps, Node.js and FastAPI services, and AWS infrastructure. His core specialisation is Generative AI, including RAG pipelines, LangGraph-based multi-agent workflows, LLM evaluation, and production AI integrations."
  },
  {
    keys: [
      "backend", "api", "rest", "fastapi", "nodejs",
      "node.js", "microservice", "server"
    ],
    text: "Naveen builds high-performance backend services and REST APIs using Node.js, FastAPI, Python, and TypeScript. His backend experience includes integrating databases, connecting AI capabilities to applications, and deploying services on AWS with an emphasis on scalability, reliability, and maintainability."
  },
  {
    keys: [
      "frontend", "front end", "ui", "ux", "web", "react", "angular"
    ],
    text: "Naveen develops modern web interfaces using React and Angular, alongside mobile experiences with React Native and Flutter. He focuses on building maintainable user interfaces that integrate cleanly with backend APIs, cloud services, and AI-powered features."
  },
  {
    keys: [
      "rag", "retrieval", "vector", "embedding", "knowledge base"
    ],
    text: "Naveen designs RAG systems that connect language models to relevant external knowledge. His experience includes building ingestion pipelines and working with technologies such as Pinecone and OpenSearch, with a focus on retrieval quality, reliable data processing, and evaluating LLM-powered applications."
  },
  {
    keys: [
      "llm evaluation", "deepeval", "evaluation", "testing", "quality"
    ],
    text: "Naveen works on LLM evaluation frameworks using DeepEval to assess the quality of AI-powered applications. His approach treats evaluation as part of production engineering, helping teams measure response quality and improve the reliability of RAG pipelines and agent workflows."
  },
  {
    keys: [
      "medium", "writing", "blog", "article", "published", "technical writing"
    ],
    text: "Beyond engineering, Naveen publishes articles on AI and software engineering on Medium. He shares technical insights from his work in full stack development, cloud engineering, and Generative AI.",
    html: 'Naveen publishes articles on AI and software engineering on <a href="https://medium.com/@naveenmohan07" target="_blank" rel="noopener noreferrer">Medium</a>, sharing insights into full stack development, cloud engineering, and Generative AI.'
  },
  {
    keys: [
      "hello", "hi", "hey", "good morning", "good afternoon", "good evening"
    ],
    text: "Hi! I'm Naveen's portfolio assistant. Ask me about his full stack experience, technology stack, Generative AI projects, cloud engineering, achievements, or how to get in touch."
  }
];

    const FALLBACK = {
text: "I don't have a specific answer for that yet, but Naveen would be happy to discuss it. He's always open to meaningful conversations. Reach him at naveenmsj@gmail.com.",
html: 'I don\'t have a specific answer for that yet, but Naveen would be happy to discuss it. He\'s always open to meaningful conversations. Reach him at <a href="mailto:naveenmsj@gmail.com">naveenmsj@gmail.com</a>.'
    };
    const answerFor = (q) => {
      const t = " " + q.toLowerCase().replace(/[^a-z0-9/ ]/g, " ") + " ";
      return KB.find((e) => e.keys.some((k) => (k.length <= 3 ? t.includes(" " + k + " ") : t.includes(k)))) || FALLBACK;
    };

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const scrollDown = () => { chatBody.scrollTop = chatBody.scrollHeight; };
    const addMsg = (who) => {
      const m = document.createElement("div");
      m.className = "msg " + who;
      const b = document.createElement("div");
      b.className = "bubble";
      m.appendChild(b);
      chatBody.appendChild(m);
      scrollDown();
      return b;
    };

    let busy = false;
    let pending = null;
    let autoplay = !reduceMotion;

    const ask = async (question) => {
      if (busy || !question.trim()) return;
      busy = true;
      addMsg("user").textContent = question.trim();
      const a = answerFor(question);
      const b = addMsg("bot");
      if (!reduceMotion) {
        b.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
        scrollDown();
        await sleep(650 + Math.random() * 400);
        b.textContent = "";
        b.classList.add("streaming");
        const words = a.text.split(/(\s+)/);
        for (const w of words) {
          b.textContent += w;
          scrollDown();
          if (w.trim()) await sleep(28 + Math.random() * 38);
        }
        b.classList.remove("streaming");
      }
      if (a.html) b.innerHTML = a.html; else b.textContent = a.text;
      scrollDown();
      busy = false;
      if (pending) { const next = pending; pending = null; ask(next); }
    };

    const userAsk = (q) => {
      autoplay = false;
      if (busy) pending = q; else ask(q);
    };
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = chatInput.value;
      chatInput.value = "";
      userAsk(q);
    });
    chatInput.addEventListener("focus", () => { autoplay = false; });
    suggest.querySelectorAll("button").forEach((btn) =>
      btn.addEventListener("click", () => userAsk(btn.textContent))
    );

    // Autoplay a short demo conversation until the visitor interacts.
    if (autoplay) {
      (async () => {
        await sleep(2600);
        for (const q of ["What do you build?", "GenAI experience?", "Biggest impact?"]) {
          if (!autoplay) return;
          for (const ch of q) {
            if (!autoplay) { chatInput.value = ""; return; }
            chatInput.value += ch;
            await sleep(45 + Math.random() * 45);
          }
          await sleep(300);
          if (!autoplay) { chatInput.value = ""; return; }
          chatInput.value = "";
          await ask(q);
          await sleep(2600);
        }
      })();
    }
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
