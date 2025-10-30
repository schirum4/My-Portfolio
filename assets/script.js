// Theme with prefers-color-scheme + user override + a11y badge
(function(){
  const btn = document.getElementById('themeToggle');
  if(!btn) return;
  const setVars = (map)=>{ const r = document.documentElement; Object.keys(map).forEach(k=>r.style.setProperty(k, map[k])); };
  const LIGHT = {"--bg": "#f5f7fb", "--fg": "#0b0e14", "--muted": "#3b495c", "--heading": "#0a0c10", "--card": "#ffffff", "--border": "#d9e0ea", "--link": "#0e7490", "--chip-bg": "#eef4ff", "--chip-fg": "#0a1a2b", "--btn-bg": "#f2f6fb", "--btn-border": "#c9d4e2", "--input-bg": "#ffffff", "--table-border": "#e2e8f0", "--nav-bg": "rgba(255,255,255,.8)"};
  const DARK = {"--bg": "#0b0e14", "--fg": "#e6e6e6", "--muted": "#a7b0c0", "--heading": "#ffffff", "--card": "#141922", "--border": "#1f2733", "--link": "#7dd3fc", "--chip-bg": "#0e1622", "--chip-fg": "#c8d3e1", "--btn-bg": "#0f141d", "--btn-border": "#263142", "--input-bg": "#0f141d", "--table-border": "#203040", "--nav-bg": "rgba(11,14,20,.8)"};
  const apply = (mode)=>{ if(mode==='light') setVars(LIGHT); else setVars(DARK); document.documentElement.dataset.theme = mode; };

  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = stored || (prefersDark ? 'dark' : 'light');
  apply(initial);
  btn.textContent = initial==='dark'?'☀️ Light':'🌙 Dark';
  let userOverrode = !!stored;

  if(window.matchMedia){
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', (e)=>{ if(!userOverrode){ const next = e.matches ? 'dark' : 'light'; apply(next); btn.textContent = next==='dark'?'☀️ Light':'🌙 Dark'; setTimeout(updateA11yBadge, 0); } });
  }

  btn.addEventListener('click',()=>{ const cur = document.documentElement.dataset.theme||'dark'; const next = cur==='dark'?'light':'dark';
    localStorage.setItem('theme', next); userOverrode = true; apply(next); btn.textContent = next==='dark'?'☀️ Light':'🌙 Dark'; setTimeout(updateA11yBadge, 0);
  });

  // a11y badge (WCAG)
  const toRgb = (cssVar)=>{ const v = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim(); const hex = v.replace('#',''); const num = parseInt(hex,16); return { r:(num>>16)&255, g:(num>>8)&255, b:(num)&255 }; };
  const relL = (c)=>{ const s=[c.r,c.g,c.b].map(v=>{ v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }); return 0.2126*s[0]+0.7152*s[1]+0.0722*s[2]; };
  const contrast = (fg,bg)=>{ const L1=relL(fg), L2=relL(bg); const lighter=Math.max(L1,L2), darker=Math.min(L1,L2); return (lighter+0.05)/(darker+0.05); };
  const rating = (r)=> r>=7?'AAA':(r>=4.5?'AA':'⚠︎');

  function ensureBadge(){ if(document.getElementById('a11yBadge')) return;
    const b = document.createElement('button'); b.id='a11yBadge'; b.className='a11y-badge'; b.type='button'; b.setAttribute('aria-expanded','false'); b.title='Accessibility status';
    const dot=document.createElement('span'); dot.className='a11y-dot'; b.appendChild(dot);
    const lab=document.createElement('span'); lab.id='a11yLabel'; b.appendChild(lab);
    b.addEventListener('click',()=>{ b.setAttribute('aria-expanded', String(b.getAttribute('aria-expanded')!=='true')); });
    const d=document.createElement('div'); d.className='a11y-detail'; d.id='a11yDetail'; d.innerHTML='<div class="mono" id="a11yDetailText"></div>';
    document.body.appendChild(b); document.body.appendChild(d);
  }
  window.updateA11yBadge = function(){
    ensureBadge();
    const fg = toRgb('--fg'), bg = toRgb('--bg'), heading = toRgb('--heading');
    const bodyC = contrast(fg,bg), headC = contrast(heading,bg);
    const bodyR = rating(bodyC), headR = rating(headC);
    const worst = (bodyC<headC)?bodyC:headC, worstRating = rating(worst);
    const dot=document.querySelector('#a11yBadge .a11y-dot'); const lab=document.getElementById('a11yLabel'); const det=document.getElementById('a11yDetailText');
    lab.textContent = `Contrast: ${worstRating}`; dot.style.background = worstRating==='AAA'?'#16a34a':(worstRating==='AA'?'#f59e0b':'#dc2626');
    det.textContent = `Body: ${bodyC.toFixed(2)} (${bodyR})\nHeadings: ${headC.toFixed(2)} (${headR})\nTargets: AA ≥ 4.5, AAA ≥ 7.0`;
  };
  window.addEventListener('load', ()=> setTimeout(updateA11yBadge, 0));
})();

// Active menu
(function(){
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.menu a').forEach(a=>{ const url=a.getAttribute('href'); if(url===here) a.classList.add('active'); });
})();

// Blog filter
function blogFilter(term='', tag='all'){
  term = (term||'').toLowerCase();
  document.querySelectorAll('[data-post]').forEach(card=>{
    const title=(card.getAttribute('data-title')||'').toLowerCase();
    const body=(card.getAttribute('data-body')||'').toLowerCase();
    const tags=(card.getAttribute('data-tags')||'').split(',');
    const matchText=!term || title.includes(term) || body.includes(term);
    const matchTag=!tag || tag==='all' || tags.includes(tag);
    card.style.display = (matchText && matchTag) ? '' : 'none';
  });
}

// Global "Hire me" CTA + email chip
(function(){
  if(document.getElementById('globalCta')) return;
  const cta = document.createElement('section'); cta.id='globalCta'; cta.className='cta-banner';
  cta.innerHTML = '<div class="cta-inner container">    <div>      <div class="cta-title">Available for internships & contract work</div>      <div class="cta-sub">Full‑stack (Flask · React · MongoDB) · Security‑minded · Fast iterations</div>    </div>    <div class="cta-actions">      <a class="btn" href="NagasaiResume.pdf" target="_blank" rel="noopener">View Resume</a>      <a class="btn" href="https://github.com/schirum4" target="_blank" rel="noopener">GitHub</a>      <a class="btn" href="https://www.linkedin.com" target="_blank" rel="noopener">LinkedIn</a>      <button class="btn" id="ctaCopyEmailBtn" type="button">Copy Email</button>    </div>  </div>';
  const nav = document.querySelector('.nav'); if(nav && nav.parentNode) nav.parentNode.insertBefore(cta, nav.nextSibling); else document.body.prepend(cta);

  if(!document.getElementById('emailChip')){
    const chip=document.createElement('div'); chip.id='emailChip'; chip.className='email-chip'; chip.innerHTML='<span>📧</span><button type="button" id="chipCopyBtn">Copy email</button>';
    document.body.appendChild(chip);
    const toast=document.createElement('div'); toast.id='emailToast'; toast.className='email-toast mono'; toast.textContent='Copied: nagasaichirum4@gmail.com'; document.body.appendChild(toast);
  }
  function copyGlobalEmail(){
    const email='nagasaichirum4@gmail.com';
    navigator.clipboard.writeText(email).then(()=>{ const t=document.getElementById('emailToast'); if(!t) return; t.classList.add('show'); clearTimeout(window.__emailToastTimer); window.__emailToastTimer=setTimeout(()=>t.classList.remove('show'),1800); });
  }
  const chipBtn=document.getElementById('chipCopyBtn'); if(chipBtn) chipBtn.addEventListener('click', copyGlobalEmail);
  const ctaBtn=document.getElementById('ctaCopyEmailBtn'); if(ctaBtn) ctaBtn.addEventListener('click', copyGlobalEmail);
})();

// ---- Home page FX ----
(function(){
  const here = location.pathname.split('/').pop() || 'index.html';
  if(here !== 'index.html') return;

  // Particles
  const canvas = document.getElementById('particleCanvas');
  if(canvas){
    const ctx = canvas.getContext('2d');
    const DPR = Math.max(1, window.devicePixelRatio || 1);
    let W, H, particles = [];

    function resize(){
      const rect = canvas.getBoundingClientRect();
      W = Math.floor(rect.width * DPR);
      H = Math.floor(rect.height * DPR);
      canvas.width = W; canvas.height = H;
      particles = Array.from({length: Math.max(60, Math.floor(W*H/80000))}, ()=>({
        x: Math.random()*W, y: Math.random()*H, vx:(Math.random()-0.5)*0.2*DPR, vy:(Math.random()-0.5)*0.2*DPR, r: 1 + Math.random()*2*DPR, a: 0.15 + Math.random()*0.25
      }));
    }
    function step(){
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = '#6ee7ff';
      particles.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>W) p.vx*=-1;
        if(p.y<0||p.y>H) p.vy*=-1;
        ctx.globalAlpha = p.a;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(step);
    }
    resize(); step();
    window.addEventListener('resize', resize);
  }

  // Parallax blobs
  const layer = document.querySelector('.hero .fx-layer');
  if(layer){
    document.addEventListener('mousemove', (e)=>{
      const {innerWidth:w, innerHeight:h} = window;
      const dx = (e.clientX - w/2) / (w/2);
      const dy = (e.clientY - h/2) / (h/2);
      layer.style.transform = `translate(${dx*10}px, ${dy*10}px)`;
    });
  }

  // Scroll reveal
  const io = new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(en.isIntersecting){ en.target.classList.add('show'); io.unobserve(en.target); }
    });
  }, {threshold: 0.15});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // Card tilt
  document.querySelectorAll('.card').forEach(card=>{
    card.classList.add('tilt');
    const strength = 8;
    function onMove(e){
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      const dx = (e.clientX - cx) / (r.width/2);
      const dy = (e.clientY - cy) / (r.height/2);
      card.style.transform = `rotateX(${(-dy*strength).toFixed(2)}deg) rotateY(${(dx*strength).toFixed(2)}deg)`;
      card.classList.add('is-tilting');
    }
    function onLeave(){
      card.style.transform = 'rotateX(0) rotateY(0)';
      card.classList.remove('is-tilting');
    }
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    card.addEventListener('touchmove', (e)=>{ if(e.touches[0]) onMove(e.touches[0]); }, {passive:true});
    card.addEventListener('touchend', onLeave);
  });
})();

// Page-load fade-in
(function(){
  const apply = ()=> document.body.classList.add('page-loaded');
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(apply, 0);
  } else {
    window.addEventListener('DOMContentLoaded', apply, {once:true});
  }
})();
