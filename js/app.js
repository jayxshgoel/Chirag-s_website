/* ══════════════════════════════════════════
   TRISHAKTI IMMERSIVE REALTY — app.js
   Three.js hero · GSAP ScrollTrigger
   Typed.js · Day/Night · Counters
══════════════════════════════════════════ */

let appInitialized = false;

function finishLoadingScreen() {
  if (appInitialized) return;
  appInitialized = true;
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('done');
    setTimeout(() => { 
      loader.style.display = 'none'; 
      // Initialize layout, GSAP, inputs only after 3D is ready
      initAllExceptThree();
    }, 600);
  }
}

function updateLoadingScreen(pct) {
  const bar = document.getElementById('loaderBar');
  const pctTxt = document.getElementById('loaderPct');
  if (bar) bar.style.width = Math.floor(pct) + '%';
  if (pctTxt) pctTxt.textContent = Math.floor(pct) + '%';
}

window.addEventListener('DOMContentLoaded', () => {
  // Start the 3D process immediately, it will call finishLoadingScreen()
  initScrollytellingThree();
});

function initAllExceptThree() {
  initThemeToggle();
  initTyped();
  initNavbar();
  initScrollAnimations();
  initCounters();
  initTimeSlider();
  initContactForm();
  initMobileMenu();
  initCardTilt();
  initHeroEntrance();
}

/* ── THEME TOGGLE ── */
function initThemeToggle() {
  const toggles = document.querySelectorAll('.theme-toggle');
  const savedTheme = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let currentTheme = savedTheme || (systemDark ? 'dark' : 'light');

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
  };

  applyTheme(currentTheme);

  toggles.forEach(t => {
    t.addEventListener('click', (e) => {
      e.stopPropagation();
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(currentTheme);
    });
  });
}

/* ── 3. SCROLLYTELLING THREE.JS ── */
function initScrollytellingThree() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 20);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  /* Lights */
  const ambLight = new THREE.AmbientLight(0x0A1540, 4);
  scene.add(ambLight);
  const dLight = new THREE.DirectionalLight(0x00C8FF, 8);
  dLight.position.set(10, 20, 10);
  scene.add(dLight);
  const fl = new THREE.PointLight(0x2B5CE6, 8, 40);
  fl.position.set(-10, -5, 5);
  scene.add(fl);

  /* Group for the building */
  const buildingGroup = new THREE.Group();
  scene.add(buildingGroup);

  /* Glass Material for Holographic Vibe */
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x1B3F9A, metalness: 0.9, roughness: 0.1,
    transmission: 0.6, transparent: true, opacity: 0.8
  });

  /* Build Procedural "Coded" Building */
  buildProceduralFallback(buildingGroup, glassMat);
  
  // We instantly finish the loader because procedural generation is instant
  finishLoadingScreen();

  /* Particles */
  const pGeo = new THREE.BufferGeometry();
  const pCount = 1500;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount * 3; i++) {
    pPos[i] = (Math.random() - 0.5) * 80;
    if(i % 3 === 1) pPos[i] = (Math.random() - 0.5) * 40;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x00C8FF, size: 0.08, transparent: true, opacity: 0.5 });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  /* GSAP ScrollTrigger Sequence */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1
      }
    });

    // Morph layout based on scroll depth
    tl.to(buildingGroup.rotation, { y: Math.PI * 1.5, ease: "none", duration: 10 }, 0)
      .to(buildingGroup.scale, { x: 1.5, y: 1.5, z: 1.5, ease: "power1.inOut", duration: 2 }, 0) // Zoom to front
      .to(camera.position, { y: 8, z: 6, ease: "power2.inOut", duration: 2 }, 2) // Dive into VR
      .to(buildingGroup.scale, { x: 3, y: 3, z: 3, ease: "power2.in", duration: 2 }, 4) // Extreme zoom VR
      .to(camera.position, { y: 40, z: 0, ease: "power3.inOut", duration: 3 }, 6); // Pull back to drone sky view
  }

  /* Mouse parallax */
  let mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* Theme update logic */
  const updateThreeTheme = (theme) => {
    if (theme === 'light') {
      ambLight.color.setHex(0xB0C4DE);
      dLight.color.setHex(0x0066CC);
      pMat.color.setHex(0x2B5CE6);
      pMat.opacity = 0.3;
    } else {
      ambLight.color.setHex(0x0A1540);
      dLight.color.setHex(0x00C8FF);
      pMat.color.setHex(0x00C8FF);
      pMat.opacity = 0.5;
    }
  };
  updateThreeTheme(document.documentElement.getAttribute('data-theme') || 'dark');
  window.addEventListener('themeChanged', (e) => updateThreeTheme(e.detail));

  /* Animation loop */
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;

    buildingGroup.position.y = Math.sin(t) * 0.4;
    points.rotation.y -= 0.0003;

    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
    camera.lookAt(0, buildingGroup.position.y, 0);

    renderer.render(scene, camera);
  }
  animate();
}

function buildProceduralFallback(group, mat) {
  // Center core
  const core = new THREE.Mesh(new THREE.BoxGeometry(4, 16, 4), mat);
  const edges = new THREE.EdgesGeometry(core.geometry);
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x00C8FF, transparent: true, opacity: 0.5 }));
  core.add(line);
  group.add(core);

  // Side blocks
  for(let i=0; i<4; i++) {
    const block = new THREE.Mesh(new THREE.BoxGeometry(2.5, 8 + Math.random()*4, 2.5), mat);
    const bx = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random()*2);
    const bz = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random()*2);
    block.position.set(bx, (block.geometry.parameters.height)/2 - 8, bz);
    
    const be = new THREE.EdgesGeometry(block.geometry);
    const bl = new THREE.LineSegments(be, new THREE.LineBasicMaterial({ color: 0x00C8FF, transparent: true, opacity: 0.4 }));
    block.add(bl);
    group.add(block);
  }
}

/* ── 4. TYPED.JS ── */
function initTyped() {
  if (!window.Typed || !document.getElementById('typedEl')) return;
  new Typed('#typedEl', {
    strings: [
      'Transforming how properties are presented.',
      'Step inside your future home — before it\'s built.',
      'AR · VR · 3D Visualisation for Real Estate.',
      'Experience. Explore. Decide with Confidence.',
    ],
    typeSpeed: 40,
    backSpeed: 22,
    backDelay: 2000,
    loop: true,
    smartBackspace: true,
  });
}

/* ── 5. NAVBAR ── */
function initNavbar() {
  const nav   = document.getElementById('navbar');
  const links = document.querySelectorAll('.nl');
  const secs  = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);

    /* Active link highlight */
    let current = '';
    secs.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  });

  /* Smooth scroll for all anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      /* Close mobile menu */
      const mobileNav = document.getElementById('mobileNav');
      const hamburger = document.getElementById('hamburger');
      if (mobileNav) mobileNav.classList.remove('open');
      if (hamburger) hamburger.classList.remove('open');
    });
  });
}

/* ── 6. MOBILE MENU ── */
function initMobileMenu() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileNav');
  if (btn && menu) {
    btn.addEventListener('click', () => {
      btn.classList.toggle('open');
      menu.classList.toggle('open');
    });
  }
}

/* ── 7. SCROLL ANIMATIONS (GSAP) ── */
function initScrollAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  /* Section reveals */
  document.querySelectorAll('.reveal').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      onEnter: () => el.classList.add('visible'),
    });
  });

  /* Card stagger reveals */
  document.querySelectorAll('.reveal-card').forEach(el => {
    const delay = (parseInt(el.dataset.delay) || 0);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        setTimeout(() => el.classList.add('visible'), delay);
      },
    });
  });

  /* Process line fill */
  const fillEl = document.getElementById('processLineFill');
  const processSec = document.getElementById('process');
  if (fillEl && processSec) {
    ScrollTrigger.create({
      trigger: processSec,
      start: 'top 60%',
      onEnter: () => { fillEl.style.width = '100%'; },
    });
  }

  /* VR section entrance */
  const vrSec = document.getElementById('vr');
  if(vrSec) {
    ScrollTrigger.create({
      trigger: vrSec,
      start: 'top 70%',
      onEnter: () => {
        gsap.fromTo('.vr-display',
          { scale: .92, opacity: 0 },
          { scale: 1, opacity: 1, duration: .8, ease: 'back.out(1.3)' }
        );
      },
    });
  }

  /* Drone section */
  const droneSec = document.getElementById('drone');
  if(droneSec) {
    ScrollTrigger.create({
      trigger: droneSec,
      start: 'top 70%',
      onEnter: () => {
        gsap.fromTo('.aerial-map',
          { scale: .85, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: .9, ease: 'power3.out' }
        );
      },
    });
  }

  /* Parallax hero text on scroll */
  const heroSec = document.querySelector('.hero');
  if(heroSec) {
    gsap.to('.hero-content', {
      scrollTrigger: { trigger: heroSec, start: 'top top', end: 'bottom top', scrub: true },
      y: 80, opacity: 0,
    });
  }
}

/* ── 8. COUNTERS ── */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  let ran = false;

  function runCounters() {
    if (ran) return;
    const sec = document.getElementById('legacy');
    if (!sec) return;
    const rect = sec.getBoundingClientRect();
    if (rect.top < window.innerHeight * .85) {
      ran = true;
      counters.forEach(el => {
        const target = parseInt(el.dataset.target);
        let current  = 0;
        const step   = Math.max(1, Math.ceil(target / 60));
        const iv = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = current;
          if (current >= target) clearInterval(iv);
        }, 30);
      });
    }
  }
  window.addEventListener('scroll', runCounters);
  runCounters();
}

/* ── 9. DAY / NIGHT SLIDER ── */
function initTimeSlider() {
  const slider   = document.getElementById('timeSlider');
  const timeDisp = document.getElementById('tsTime');
  const backwall = document.getElementById('vrBackwall');
  const light    = document.getElementById('vrLight');

  if (!slider) return;

  function update() {
    const v   = parseInt(slider.value); // 0 = night, 100 = day
    /* Time label */
    const hour = Math.round(6 + (v / 100) * 16); // 6am→10pm
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12  = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    timeDisp.textContent = `${h12}:00 ${ampm}`;

    /* Room colour */
    const dayR   = [15, 29, 74];   // #0f1d4a  (day = slightly lighter)
    const nightR = [5, 8, 25];     // dark night
    const lerp   = (a, b, t) => Math.round(a + (b - a) * t);
    const t      = v / 100;
    const r = lerp(nightR[0], dayR[0], t);
    const g = lerp(nightR[1], dayR[1], t);
    const b = lerp(nightR[2], dayR[2], t);
    if (backwall) backwall.style.background = `rgb(${r},${g},${b})`;

    /* Window light */
    if (light) {
      if (v < 20) {
        light.style.background = 'linear-gradient(180deg,rgba(80,100,200,.25) 0%,rgba(40,60,160,.1) 100%)'; // night sky
      } else {
        const warm = Math.round(v * 2);
        light.style.background = `linear-gradient(180deg,rgba(255,${180+warm},${60+warm},.4) 0%,rgba(255,${160+warm},${40},.15) 100%)`;
      }
    }
  }

  slider.addEventListener('input', update);
  update();
}

/* ── 10. CARD TILT ── */
function initCardTilt() {
  document.querySelectorAll('[data-tilt], .pillar-card, .sol-card, .stat-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translateY(-8px) perspective(600px) rotateY(${dx * 6}deg) rotateX(${-dy * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ── 11. CONTACT FORM ── */
function initContactForm() {
  const form    = document.getElementById('contactForm');
  const btn     = document.getElementById('submitBtn');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    /* Gather field values */
    const name    = (document.getElementById('fName')?.value    || '').trim();
    const company = (document.getElementById('fCompany')?.value || '').trim();
    const email   = (document.getElementById('fEmail')?.value   || '').trim();
    const phone   = (document.getElementById('fPhone')?.value   || '').trim();
    const sol     = (document.getElementById('fSol')?.value     || '').trim();
    const msg     = (document.getElementById('fMsg')?.value     || '').trim();

    /* Compose WhatsApp message */
    const lines = [
      '🏢 *New Demo Request — Trishakti Immersive Realty*',
      '',
      `👤 *Name:* ${name}`,
      company ? `🏗️ *Company/Project:* ${company}` : null,
      email   ? `✉️ *Email:* ${email}`   : null,
      phone   ? `📞 *Phone:* ${phone}`   : null,
      sol     ? `🎯 *Interested In:* ${sol}` : null,
      msg     ? `\n💬 *Message:*\n${msg}` : null,
    ].filter(Boolean).join('\n');

    const waUrl = `https://wa.me/918984205703?text=${encodeURIComponent(lines)}`;

    /* Visual feedback */
    btn.textContent = 'Opening WhatsApp…';
    btn.disabled    = true;

    setTimeout(() => {
      window.open(waUrl, '_blank');
      btn.textContent = '✓ Message Ready!';
      if (success) success.style.display = 'block';
      form.reset();
      setTimeout(() => {
        btn.textContent = 'Book a Demo →';
        btn.disabled    = false;
        if (success) success.style.display = 'none';
      }, 4000);
    }, 600);
  });
}

/* ── 12. SCAN-LINE on VR display (extra polish) ── */
/* Already handled via CSS animation */

/* ── 13. NOISE OVERLAY (subtle grain) ── */
(function addNoise() {
  const style = document.createElement('style');
  style.textContent = `
    body::after {
      content:'';position:fixed;inset:0;z-index:99998;
      pointer-events:none;
      background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
      background-size:180px 180px;
      opacity:.4;
    }
  `;
  document.head.appendChild(style);
})();

/* ── 14. HERO ENTRANCE ── */
function initHeroEntrance() {
  if (!window.gsap) return;
  const tl = gsap.timeline();
  tl.from('.hero-badge', { y: -20, opacity: 0, duration: 0.8, ease: 'power3.out' })
    .from('.hud-ring-wrap', { scale: 0.5, opacity: 0, duration: 1.5, ease: 'power3.out' }, "-=0.6")
    .from('.hero-h1', { y: 30, opacity: 0, duration: 1, ease: 'power3.out' }, "-=1.2")
    .from('.hero-typed', { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' }, "-=0.6")
    .from('.hero-btns a', { y: 20, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'back.out(1.5)' }, "-=0.4")
    .from('.hero-stats-row .hs, .hero-stats-row .hs-div', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, "-=0.2")
    .from('.scroll-hint', { y: -10, opacity: 0, duration: 0.6 }, "-=0.2");
}
