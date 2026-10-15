/* =========================================================
   Cashe Collins — Portfolio
   Vanilla JS, no dependencies. Each feature is a small init
   function; everything degrades gracefully without JS and
   respects prefers-reduced-motion.
   ========================================================= */

(() => {
    'use strict';

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
    const lerp = (from, to, t) => from + (to - from) * t;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const fancyPointer = finePointer && !reducedMotion;

    /** Run `callback` once, the first time `element` scrolls into view. */
    function onceVisible(element, callback, options = { threshold: 0.3 }) {
        if (!('IntersectionObserver' in window)) {
            callback(element);
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    observer.unobserve(entry.target);
                    callback(entry.target);
                }
            });
        }, options);
        observer.observe(element);
    }

    // ===== Hero particle field =====

    function initHeroCanvas() {
        const canvas = $('.hero-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const hero = canvas.closest('.hero');
        const glow = $('.hero-glow');
        // Particle colors come from the active palette's --c1-rgb ... --c4-rgb tokens.
        const rootStyles = getComputedStyle(document.documentElement);
        const COLORS = ['--c1-rgb', '--c2-rgb', '--c3-rgb', '--c4-rgb']
            .map((token) => rootStyles.getPropertyValue(token).trim())
            .filter(Boolean);
        if (!COLORS.length) COLORS.push('255, 255, 255');
        const LINK_DISTANCE = 130;
        const MOUSE_RADIUS = 170;

        let width = 0;
        let height = 0;
        let particles = [];
        let running = false;
        let inView = true;
        const mouse = { x: -1e4, y: -1e4 };

        function seed() {
            const count = clamp(Math.round((width * height) / 15000), 28, 110);
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.32,
                vy: (Math.random() - 0.5) * 0.32,
                r: Math.random() * 1.5 + 0.6,
                color: COLORS[(Math.random() * COLORS.length) | 0],
            }));
        }

        function resize() {
            const previousWidth = width;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = hero.clientWidth;
            height = hero.clientHeight;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            // Mobile browsers resize vertically as the URL bar hides; only reseed on real width changes.
            if (Math.abs(width - previousWidth) > 40 || !particles.length) seed();
            if (reducedMotion) draw();
        }

        function step() {
            for (const p of particles) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.hypot(dx, dy);
                if (dist < MOUSE_RADIUS && dist > 0.1) {
                    const force = (1 - dist / MOUSE_RADIUS) * 1.4;
                    p.x += (dx / dist) * force;
                    p.y += (dy / dist) * force;
                }
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < -20) p.x = width + 20;
                else if (p.x > width + 20) p.x = -20;
                if (p.y < -20) p.y = height + 20;
                else if (p.y > height + 20) p.y = -20;
            }
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);
            ctx.lineWidth = 1;
            for (let i = 0; i < particles.length; i++) {
                const a = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    const b = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < LINK_DISTANCE * LINK_DISTANCE) {
                        const alpha = (1 - Math.sqrt(distSq) / LINK_DISTANCE) * 0.32;
                        ctx.strokeStyle = `rgba(${a.color}, ${alpha})`;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
                const mdx = a.x - mouse.x;
                const mdy = a.y - mouse.y;
                const mouseDist = Math.hypot(mdx, mdy);
                if (mouseDist < MOUSE_RADIUS + 60) {
                    ctx.strokeStyle = `rgba(${a.color}, ${(1 - mouseDist / (MOUSE_RADIUS + 60)) * 0.55})`;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
            for (const p of particles) {
                ctx.fillStyle = `rgba(${p.color}, 0.9)`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function loop() {
            if (!inView || document.hidden) {
                running = false;
                return;
            }
            step();
            draw();
            requestAnimationFrame(loop);
        }

        function start() {
            if (running || reducedMotion) return;
            running = true;
            requestAnimationFrame(loop);
        }

        hero.addEventListener('pointermove', (event) => {
            const rect = hero.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
            if (glow) {
                glow.style.setProperty('--glow-x', `${mouse.x}px`);
                glow.style.setProperty('--glow-y', `${mouse.y}px`);
            }
        }, { passive: true });

        hero.addEventListener('pointerleave', () => {
            mouse.x = -1e4;
            mouse.y = -1e4;
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 150);
        });

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(([entry]) => {
                inView = entry.isIntersecting;
                if (inView) start();
            }).observe(hero);
        }

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) start();
        });

        resize();
        start();
    }

    // ===== Scrambling role text =====

    function initScramble() {
        const el = $('[data-scramble]');
        if (!el) return;
        let words;
        try {
            words = JSON.parse(el.dataset.scramble);
        } catch {
            return;
        }
        const GLYPHS = '!_-\\/[]{}=+*^?#%$01';
        let index = Math.max(0, words.indexOf(el.textContent.trim()));

        function scrambleTo(next) {
            const previous = el.textContent;
            const length = Math.max(previous.length, next.length);
            const queue = [];
            for (let i = 0; i < length; i++) {
                const start = Math.floor(Math.random() * 16);
                const end = start + 10 + Math.floor(Math.random() * 20);
                queue.push({ from: previous[i] || '', to: next[i] || '', start, end, glyph: '' });
            }

            return new Promise((resolve) => {
                let frame = 0;
                const update = () => {
                    let output = '';
                    let complete = 0;
                    for (const item of queue) {
                        if (frame >= item.end) {
                            complete++;
                            output += item.to;
                        } else if (frame >= item.start) {
                            if (!item.glyph || Math.random() < 0.3) {
                                item.glyph = GLYPHS[(Math.random() * GLYPHS.length) | 0];
                            }
                            output += `<span class="dud">${item.glyph}</span>`;
                        } else {
                            output += item.from;
                        }
                    }
                    el.innerHTML = output;
                    if (complete === queue.length) {
                        resolve();
                    } else {
                        frame++;
                        requestAnimationFrame(update);
                    }
                };
                update();
            });
        }

        (async () => {
            await sleep(2200);
            while (true) {
                index = (index + 1) % words.length;
                if (reducedMotion) {
                    el.textContent = words[index];
                } else {
                    await scrambleTo(words[index]);
                }
                await sleep(2600);
            }
        })();
    }

    // ===== Scroll reveals, counters, skill bars =====

    function initReveal() {
        const items = $$('.reveal');
        if (reducedMotion || !('IntersectionObserver' in window)) {
            items.forEach((el) => el.classList.add('is-visible'));
            return;
        }
        items.forEach((el) => onceVisible(el, (target) => target.classList.add('is-visible'), {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px',
        }));
    }

    function countUp(el) {
        const target = parseFloat(el.dataset.count);
        if (Number.isNaN(target) || reducedMotion) return;
        const duration = 1800;
        const start = performance.now();
        el.textContent = '0';
        const tick = (now) => {
            const t = clamp((now - start) / duration, 0, 1);
            const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            el.textContent = String(Math.round(target * eased));
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    function initCounters() {
        $$('.stat [data-count]').forEach((el) => onceVisible(el, countUp, { threshold: 0.6 }));
        const skills = $('[data-skills]');
        if (skills) {
            onceVisible(skills, (list) => {
                list.classList.add('is-visible');
                $$('[data-count]', list).forEach(countUp);
            });
        }
    }

    // ===== Navigation: active section, hide on scroll, progress, mobile menu =====

    function initNav() {
        const nav = $('[data-nav]');
        if (!nav) return;
        const links = $$('.nav-links a');
        const indicator = $('.nav-indicator');
        const progress = $('.progress');
        const toggle = $('.nav-toggle');
        const menu = $('#mobile-menu');
        let menuOpen = false;

        function setActive(link) {
            links.forEach((l) => l.classList.toggle('is-active', l === link));
            if (!indicator) return;
            if (!link) {
                indicator.style.opacity = '0';
                return;
            }
            indicator.style.opacity = '1';
            indicator.style.width = `${link.offsetWidth}px`;
            indicator.style.transform = `translateX(${link.offsetLeft}px)`;
        }

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const match = links.find((l) => l.getAttribute('href') === `#${entry.target.id}`);
                    setActive(match || null);
                });
            }, { rootMargin: '-45% 0px -50% 0px' });
            $$('main > section[id]').forEach((section) => observer.observe(section));
        }

        let lastY = window.scrollY;
        let ticking = false;
        function onScroll() {
            const y = window.scrollY;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            if (progress) progress.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
            nav.classList.toggle('is-scrolled', y > 24);
            if (!menuOpen) nav.classList.toggle('is-hidden', y > lastY && y > 480);
            lastY = y;
            ticking = false;
        }
        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(onScroll);
            }
        }, { passive: true });
        onScroll();

        // Show the nav again when the pointer heads toward the top edge.
        window.addEventListener('pointermove', (event) => {
            if (event.clientY < 90) nav.classList.remove('is-hidden');
        }, { passive: true });

        function setMenu(open) {
            if (!toggle || !menu) return;
            menuOpen = open;
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            menu.hidden = !open;
            document.documentElement.classList.toggle('is-locked', open);
            if (open) nav.classList.remove('is-hidden');
        }

        if (toggle && menu) {
            toggle.addEventListener('click', () => setMenu(!menuOpen));
            $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && menuOpen) setMenu(false);
            });
            window.matchMedia('(min-width: 861px)').addEventListener('change', (event) => {
                if (event.matches) setMenu(false);
            });
        }

        window.addEventListener('resize', () => setActive(links.find((l) => l.classList.contains('is-active')) || null));
    }

    // ===== Scroll-linked text band =====

    function initBand() {
        const band = $('.band');
        if (!band || reducedMotion) return;
        const rows = $$('.band-row', band);
        let ticking = false;

        function update() {
            ticking = false;
            const rect = band.getBoundingClientRect();
            if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
            const offset = window.innerHeight - rect.top;
            rows.forEach((row) => {
                const speed = parseFloat(row.dataset.speed) || 0.3;
                const base = speed > 0 ? -row.scrollWidth * 0.3 : -row.scrollWidth * 0.05;
                row.style.transform = `translate3d(${base + offset * speed}px, 0, 0)`;
            });
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        }, { passive: true });
        window.addEventListener('resize', update);
        update();
    }

    // ===== Custom cursor =====

    function initCursor() {
        const cursor = $('.cursor');
        if (!cursor || !fancyPointer) return;
        document.documentElement.classList.add('has-cursor');
        const dot = $('.cursor-dot', cursor);
        const ring = $('.cursor-ring', cursor);
        const label = $('.cursor-label', cursor);
        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2;
        let ringX = x;
        let ringY = y;

        window.addEventListener('pointermove', (event) => {
            x = event.clientX;
            y = event.clientY;
            dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            cursor.classList.add('is-visible');
        }, { passive: true });

        document.documentElement.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
        window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
        window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));

        document.addEventListener('pointerover', (event) => {
            const target = event.target.closest('a, button, [data-cursor], .project');
            const text = target ? (target.dataset.cursor || $('[data-cursor]', target)?.dataset.cursor || '') : '';
            cursor.classList.toggle('is-hover', Boolean(target));
            cursor.classList.toggle('has-label', Boolean(text));
            label.textContent = text;
        });

        (function loop() {
            ringX = lerp(ringX, x, 0.2);
            ringY = lerp(ringY, y, 0.2);
            ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
            requestAnimationFrame(loop);
        })();
    }

    // ===== Magnetic buttons =====

    function initMagnetic() {
        if (!fancyPointer) return;
        $$('.magnetic').forEach((el) => {
            el.addEventListener('pointermove', (event) => {
                const rect = el.getBoundingClientRect();
                const dx = event.clientX - (rect.left + rect.width / 2);
                const dy = event.clientY - (rect.top + rect.height / 2);
                el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.32}px)`;
            });
            el.addEventListener('pointerleave', () => {
                el.style.transform = '';
            });
        });
    }

    // ===== Card spotlight + project tilt =====

    function initSpotlight() {
        if (!finePointer) return;
        const cards = $$('.card');
        let pending = false;
        let px = 0;
        let py = 0;

        window.addEventListener('pointermove', (event) => {
            px = event.clientX;
            py = event.clientY;
            if (pending) return;
            pending = true;
            requestAnimationFrame(() => {
                pending = false;
                for (const card of cards) {
                    const rect = card.getBoundingClientRect();
                    if (rect.bottom < -300 || rect.top > window.innerHeight + 300) continue;
                    card.style.setProperty('--mx', `${px - rect.left}px`);
                    card.style.setProperty('--my', `${py - rect.top}px`);
                }
            });
        }, { passive: true });
    }

    function initTilt() {
        if (!fancyPointer) return;
        $$('.project').forEach((card) => {
            card.addEventListener('pointermove', (event) => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;
                card.classList.add('is-tilting');
                card.style.setProperty('--rx', `${(0.5 - y) * 6}deg`);
                card.style.setProperty('--ry', `${(x - 0.5) * 8}deg`);
            });
            card.addEventListener('pointerleave', () => {
                card.classList.remove('is-tilting');
                card.style.setProperty('--rx', '0deg');
                card.style.setProperty('--ry', '0deg');
            });
        });
    }

    // ===== Experience: accordion + hover preview =====

    function initExperience() {
        $$('.xp-item').forEach((item) => {
            const button = $('.xp-row', item);
            button?.addEventListener('click', () => {
                const open = !item.classList.contains('is-open');
                item.classList.toggle('is-open', open);
                button.setAttribute('aria-expanded', String(open));
            });
        });
    }

    function initExperiencePreview() {
        const preview = $('.xp-preview');
        const rows = $$('.xp-row');
        if (!preview || !rows.length || !fancyPointer) return;
        const img = $('img', preview);
        const WIDTH = 300;
        const GAP = 36;
        let x = 0;
        let y = 0;
        let px = 0;
        let py = 0;
        let active = false;
        let frame = 0;

        // Warm the cache so previews pop in instantly.
        rows.forEach((row) => {
            const preload = new Image();
            preload.src = row.dataset.image;
        });

        // Sit to the right of the pointer, or flip left when there's no room.
        const targetX = () => (x + GAP + WIDTH > window.innerWidth - 16 ? x - GAP - WIDTH : x + GAP);

        function loop() {
            const tx = targetX();
            px = lerp(px, tx, 0.16);
            py = lerp(py, y, 0.16);
            const tilt = clamp((tx - px) * 0.05, -10, 10);
            preview.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${tilt}deg)`;
            if (active || Math.abs(tx - px) + Math.abs(y - py) > 0.5) {
                frame = requestAnimationFrame(loop);
            } else {
                frame = 0;
            }
        }

        rows.forEach((row) => {
            row.addEventListener('pointerenter', (event) => {
                img.src = row.dataset.image;
                preview.classList.toggle('is-contain', row.dataset.fit === 'contain');
                x = event.clientX;
                y = event.clientY;
                if (!active) {
                    px = targetX();
                    py = y;
                }
                active = true;
                preview.classList.add('is-active');
                if (!frame) frame = requestAnimationFrame(loop);
            });
            row.addEventListener('pointermove', (event) => {
                x = event.clientX;
                y = event.clientY;
            }, { passive: true });
            row.addEventListener('pointerleave', () => {
                active = false;
                preview.classList.remove('is-active');
            });
        });
    }

    // ===== Project modal =====

    function initModal() {
        const dialog = $('#project-modal');
        if (!dialog || typeof dialog.showModal !== 'function') return;
        const media = $('.modal-media', dialog);
        const kind = $('.modal-kind', dialog);
        const title = $('.modal-title', dialog);
        const details = $('.modal-details', dialog);
        const tags = $('.modal-tags', dialog);
        const actions = $('.modal-actions', dialog);
        let lastTrigger = null;

        function actionLink(href, text) {
            const a = document.createElement('a');
            a.className = 'btn btn-primary';
            a.href = href;
            a.target = '_blank';
            a.rel = 'noopener';
            a.innerHTML = `${text} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>`;
            return a;
        }

        function open(project, trigger) {
            lastTrigger = trigger;
            const img = $('.project-media img', project);
            const art = $('.project-art', project);
            media.replaceChildren();
            if (img) {
                const clone = img.cloneNode();
                clone.loading = 'eager';
                media.append(clone);
            } else if (art) {
                media.append(art.cloneNode(true));
            }
            kind.textContent = $('.project-kind', project)?.textContent || '';
            title.textContent = $('.project-title', project)?.textContent.trim() || '';
            const template = $('template.project-details', project);
            details.replaceChildren(template ? template.content.cloneNode(true) : '');
            tags.replaceChildren(...$$('.tags li', project).map((li) => li.cloneNode(true)));
            actions.replaceChildren();
            if (project.dataset.link) actions.append(actionLink(project.dataset.link, 'Visit site'));
            if (project.dataset.repo) actions.append(actionLink(project.dataset.repo, 'View on GitHub'));

            dialog.classList.remove('is-closing');
            dialog.showModal();
            document.documentElement.classList.add('is-locked');
            $('.modal-inner', dialog).scrollTop = 0;
        }

        function close() {
            if (!dialog.open || dialog.classList.contains('is-closing')) return;
            if (reducedMotion) {
                dialog.close();
                return;
            }
            dialog.classList.add('is-closing');
            dialog.addEventListener('animationend', () => {
                dialog.classList.remove('is-closing');
                dialog.close();
            }, { once: true });
        }

        $$('.project').forEach((project) => {
            const button = $('.project-open', project);
            button?.addEventListener('click', () => open(project, button));
        });

        $('[data-close]', dialog).addEventListener('click', close);
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) close();
        });
        dialog.addEventListener('cancel', (event) => {
            event.preventDefault();
            close();
        });
        dialog.addEventListener('close', () => {
            document.documentElement.classList.remove('is-locked');
            lastTrigger?.focus({ preventScroll: true });
        });
    }

    // ===== Small touches =====

    function initClock() {
        const clock = $('[data-clock]');
        if (!clock) return;
        const tz = $('[data-tz]');
        const timeZone = 'America/Denver';
        const timeFormat = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit', second: '2-digit' });
        const zoneFormat = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' });

        function tick() {
            const now = new Date();
            const parts = Object.fromEntries(timeFormat.formatToParts(now).map((p) => [p.type, p.value]));
            clock.innerHTML = `${parts.hour}<span class="clock-sep">:</span>${parts.minute}<span class="clock-sec">:${parts.second}</span><span class="clock-ampm">${parts.dayPeriod || ''}</span>`;
            if (tz) tz.textContent = zoneFormat.formatToParts(now).find((p) => p.type === 'timeZoneName')?.value || 'MT';
        }
        tick();
        setInterval(tick, 1000);
    }

    function initCopyEmail() {
        $$('[data-copy]').forEach((button) => {
            const label = $('[data-copy-label]', button);
            const original = label?.textContent;
            button.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(button.dataset.copy);
                    if (label) label.textContent = 'Copied!';
                } catch {
                    window.location.href = `mailto:${button.dataset.copy}`;
                    return;
                }
                setTimeout(() => {
                    if (label) label.textContent = original;
                }, 2000);
            });
        });
    }

    function initYear() {
        $$('[data-year]').forEach((el) => {
            el.textContent = String(new Date().getFullYear());
        });
    }

    initHeroCanvas();
    initScramble();
    initReveal();
    initCounters();
    initNav();
    initBand();
    initCursor();
    initMagnetic();
    initSpotlight();
    initTilt();
    initExperience();
    initExperiencePreview();
    initModal();
    initClock();
    initCopyEmail();
    initYear();
})();
