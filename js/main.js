(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* Loader */
  window.addEventListener('load', () => setTimeout(() => $('#loader').classList.add('done'), 700));

  /* Theme */
  const root = document.documentElement;
  try { const t = localStorage.getItem('theme'); if (t) root.dataset.theme = t; } catch (e) {}
  $('#themeToggle').addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  });

  /* Mobile menu */
  const burger = $('#burger'), links = $('#navLinks');
  burger.addEventListener('click', () => { burger.classList.toggle('open'); links.classList.toggle('open'); });
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('open'); links.classList.remove('open'); }));

  /* Scroll: nav state, progress, active link */
  const nav = $('#nav'), prog = $('#progress');
  const sections = $$('main section[id]');
  const onScroll = () => {
    const y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('scrolled', y > 30);
    prog.style.width = (y / h * 100) + '%';
    let cur = '';
    sections.forEach(s => { if (y >= s.offsetTop - 140) cur = s.id; });
    $$('#navLinks a:not(.nav-cta)').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Typing effect */
  const roles = ['Biotechnology Undergraduate', 'Aspiring Laboratory Scientist', 'Analytical Chemistry Enthusiast', 'Detail-Oriented Researcher'];
  const el = $('#typed'); let r = 0, c = 0, del = false;
  (function type() {
    const word = roles[r];
    el.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(type, 1700); }
    if (del && c === 0) { del = false; r = (r + 1) % roles.length; return setTimeout(type, 400); }
    c += del ? -1 : 1;
    setTimeout(type, del ? 35 : 75);
  })();

  /* Reveal on scroll (with stagger) */
  $$('.cards .reveal, .stats, .timeline .reveal, .hero .reveal').forEach((n, i) => n.style.setProperty('--d', (i % 4) * 0.12 + 's'));
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('.bar', e.target).forEach((b, i) => setTimeout(() => b.classList.add('in'), i * 150));
    $$('[data-count]', e.target).forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: .15 });
  $$('.reveal').forEach(n => io.observe(n));

  function countUp(n) {
    if (n.dataset.done) return; n.dataset.done = 1;
    const end = +n.dataset.count, suf = n.dataset.suffix || '', t0 = performance.now(), dur = 1500;
    const step = t => {
      const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      n.textContent = Math.round(end * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* Card tilt + spotlight */
  $$('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const b = card.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
      card.style.setProperty('--mx', x + 'px'); card.style.setProperty('--my', y + 'px');
      const rx = ((y / b.height) - .5) * -6, ry = ((x / b.width) - .5) * 6;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });

  /* Contact form -> opens email client */
  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const n = $('#cname').value, em = $('#cemail').value, m = $('#cmsg').value;
    const body = encodeURIComponent(`${m}\n\n— ${n} (${em})`);
    location.href = `mailto:upethmathasangi@gmail.com?subject=${encodeURIComponent('Portfolio enquiry from ' + n)}&body=${body}`;
  });

  $('#year').textContent = new Date().getFullYear();

  /* Background: floating DNA helix + particles */
  const cv = $('#bg-canvas'), ctx = cv.getContext('2d');
  let W, H, pts = [], mouse = { x: -999, y: -999 }, t = 0;
  const size = () => {
    const d = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * d; H = cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    W /= d; H /= d;
    pts = Array.from({ length: Math.round(W * H / 22000) }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3 }));
  };
  addEventListener('resize', size); size();
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  const col = () => getComputedStyle(root).getPropertyValue('--a1').trim() || '#2dd4bf';
  const col2 = () => getComputedStyle(root).getPropertyValue('--a2').trim() || '#38bdf8';

  function helix(x0, phase, a, b) {
    const n = 22, amp = 38;
    for (let i = 0; i < n; i++) {
      const y = (i / (n - 1)) * H;
      const ph = i * .5 + t + phase;
      const x1 = x0 + Math.sin(ph) * amp, x2 = x0 - Math.sin(ph) * amp;
      const z1 = (Math.cos(ph) + 1) / 2, z2 = 1 - z1;
      ctx.globalAlpha = .18 + z1 * .18; ctx.strokeStyle = a; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
      ctx.globalAlpha = .25 + z1 * .5; ctx.fillStyle = a; ctx.beginPath(); ctx.arc(x1, y, 2 + z1 * 3, 0, 7); ctx.fill();
      ctx.globalAlpha = .25 + z2 * .5; ctx.fillStyle = b; ctx.beginPath(); ctx.arc(x2, y, 2 + z2 * 3, 0, 7); ctx.fill();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H); t += .012;
    const a = col(), b = col2();
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 120) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
    });
    ctx.lineWidth = .6; ctx.strokeStyle = a;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 130) { ctx.globalAlpha = (1 - d / 130) * .25; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
      }
      ctx.globalAlpha = .5; ctx.fillStyle = a; ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, 1.5, 0, 7); ctx.fill();
    }
    if (W > 900) { helix(W * .94, 0, a, b); helix(W * .04, 2, b, a); }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) draw();
})();
