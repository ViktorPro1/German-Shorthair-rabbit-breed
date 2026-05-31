/* =============================================
   script.js — Німецький строкатий велетень
   ============================================= */

'use strict';

/* ---------- УТИЛІТИ ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ---------- НАВІГАЦІЯ ---------- */
const navbar = $('#navbar');
const burger = $('#burger');
const navLinks = $('#navLinks');

// Скрол — зміна вигляду навбару
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    updateScrollTop();
}, { passive: true });

// Бургер-меню
burger.addEventListener('click', () => {
    const isOpen = burger.classList.toggle('open');
    navLinks.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Закрити меню при кліку на посилання
$$('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        burger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
    });
});

// Активне посилання навбару при скролі
const sections = $$('section[id]');

function updateActiveNav() {
    const scrollMid = window.scrollY + window.innerHeight / 3;
    sections.forEach(section => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');
        const link = $(`.nav-links a[href="#${id}"]`);
        if (link) link.classList.toggle('active', scrollMid >= top && scrollMid < bottom);
    });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });

/* ---------- SCROLL REVEAL ---------- */
const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry, i) => {
            if (!entry.isIntersecting) return;
            const delay = parseInt(entry.target.dataset.delay || 0, 10);
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, delay);
            revealObserver.unobserve(entry.target);
        });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

$$('.reveal, .reveal-right, .reveal-left').forEach(el => revealObserver.observe(el));

/* ---------- АНІМАЦІЯ ПРОГРЕС-БАРІВ ---------- */
const barObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            $$('.trait-fill', entry.target).forEach(bar => {
                bar.classList.add('animated');
            });
            barObserver.unobserve(entry.target);
        });
    },
    { threshold: 0.3 }
);

const charTraits = $('.char-traits');
if (charTraits) barObserver.observe(charTraits);

/* ---------- ВКЛАДКИ ДОГЛЯДУ ---------- */
const tabBtns = $$('.tab-btn');
const tabContents = $$('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.tab;

        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const content = $(`#tab-${target}`);
        if (content) content.classList.add('active');
    });
});

/* ---------- FAQ АКОРДЕОН ---------- */
const faqItems = $$('.faq-item');

faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Закрити всі
        faqItems.forEach(fi => {
            fi.classList.remove('open');
            const a = fi.querySelector('.faq-question');
            if (a) a.setAttribute('aria-expanded', 'false');
        });

        // Відкрити натиснутий (якщо він не був відкритий)
        if (!isOpen) {
            item.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
        }
    });
});

/* ---------- КНОПКА "ВГОРУ" ---------- */
const scrollTopBtn = $('#scrollTop');

function updateScrollTop() {
    if (!scrollTopBtn) return;
    scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
}

if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ---------- ПЛАВНИЙ СКРОЛ ПО ЯКОРЯХ ---------- */
$$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        const target = $(href);
        if (!target) return;
        e.preventDefault();
        const navH = navbar ? navbar.offsetHeight : 70;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});

/* ---------- ГАЛЕРЕЯ — ЛАЙТБОКС ---------- */
const galleryItems = $$('.gallery-item');
let lightbox = null;

function createLightbox() {
    lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(26,18,9,0.92);
    display: flex; align-items: center; justify-content: center;
    cursor: zoom-out;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

    const img = document.createElement('img');
    img.style.cssText = `
    max-width: 90vw; max-height: 90vh;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    transform: scale(0.92);
    transition: transform 0.35s ease;
  `;
    lightbox.appendChild(img);

    // Кнопка закрити
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
    position: fixed; top: 24px; right: 28px;
    background: rgba(255,255,255,0.15);
    color: #fff; border: none; cursor: pointer;
    font-size: 1.3rem; width: 44px; height: 44px;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
  `;
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.background = 'rgba(255,255,255,0.3)');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.background = 'rgba(255,255,255,0.15)');
    lightbox.appendChild(closeBtn);

    document.body.appendChild(lightbox);

    function closeLightbox() {
        lightbox.style.opacity = '0';
        img.style.transform = 'scale(0.92)';
        setTimeout(() => { lightbox.style.display = 'none'; }, 300);
        document.body.style.overflow = '';
    }

    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    closeBtn.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.style.display === 'flex') closeLightbox();
    });

    return { lightbox, img };
}

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const src = item.querySelector('img')?.src;
        const alt = item.querySelector('img')?.alt || '';
        if (!src) return;

        if (!lightbox) {
            const lb = createLightbox();
            lightbox = lb.lightbox;
        }

        const img = lightbox.querySelector('img');
        img.src = src;
        img.alt = alt;

        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            lightbox.style.opacity = '1';
            img.style.transform = 'scale(1)';
        });
    });
});

/* ---------- LAZY LOADING FALLBACK ---------- */
// Якщо браузер не підтримує native lazy loading — поліфіл через IntersectionObserver
if (!('loading' in HTMLImageElement.prototype)) {
    const lazyImages = $$('img[loading="lazy"]');
    const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            imgObserver.unobserve(img);
        });
    });
    lazyImages.forEach(img => imgObserver.observe(img));
}

/* ---------- ЛІЧИЛЬНИК СТАТИСТИКИ В HERO ---------- */
function animateCount(el, target, duration = 1200) {
    const start = performance.now();
    const isFloat = String(target).includes('.');
    const from = 0;

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const value = from + (target - from) * ease;
        el.textContent = isFloat ? value.toFixed(1) : Math.round(value);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
    }

    requestAnimationFrame(step);
}

const statNums = $$('.stat-num');
const statsObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const text = el.textContent.trim();
            const num = parseFloat(text.replace(/[^\d.]/g, ''));
            if (!isNaN(num)) {
                const suffix = text.replace(/[\d.]/g, '');
                animateCount(el, num);
                setTimeout(() => {
                    el.textContent = `${num}${suffix}`;
                }, 1300);
            }
            statsObserver.unobserve(el);
        });
    },
    { threshold: 0.8 }
);

statNums.forEach(el => statsObserver.observe(el));

/* ---------- ЕФЕКТ ПАРАЛАКС НА HERO ---------- */
const heroBg = $('.hero-bg-pattern');
if (heroBg) {
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        heroBg.style.transform = `translateY(${y * 0.15}px)`;
    }, { passive: true });
}

/* ---------- ІНІЦІАЛІЗАЦІЯ ---------- */
document.addEventListener('DOMContentLoaded', () => {
    updateActiveNav();
    updateScrollTop();

    // Затримка відкриття першого FAQ для кращого UX
    const firstFaq = faqItems[0];
    if (firstFaq) {
        setTimeout(() => {
            firstFaq.classList.add('open');
            const btn = firstFaq.querySelector('.faq-question');
            if (btn) btn.setAttribute('aria-expanded', 'true');
        }, 800);
    }
});