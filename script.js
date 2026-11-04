// Force scroll to top on every full page reload
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
});

// 1. Countdown Timer Logic
const weddingDate = new Date("December 13, 2026 19:00:00").getTime();

// Track previous values to detect changes
const prevValues = { days: -1, hours: -1, minutes: -1, seconds: -1 };

function rollNumber(spanId, ghostId, cardId, newVal) {
    const span  = document.getElementById(spanId);
    const ghost = document.getElementById(ghostId);
    const card  = document.getElementById(cardId);
    if (!span) return;

    const formatted = newVal.toString().padStart(2, '0');

    // Roll animation only when value changes
    if (span.innerText !== formatted) {
        span.classList.remove('rolling');
        void span.offsetWidth; // reflow to restart animation
        span.classList.add('rolling');
        span.addEventListener('animationend', () => span.classList.remove('rolling'), { once: true });
    }

    span.innerText  = formatted;
    if (ghost) ghost.innerText = formatted;

    // Tick glow on every second
    if (cardId === 'seconds-card' && card) {
        card.classList.remove('tick');
        void card.offsetWidth;
        card.classList.add('tick');
        card.addEventListener('animationend', () => card.classList.remove('tick'), { once: true });
    }
}

function updateCountdown() {
    const now      = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
        clearInterval(countdownInterval);
        const timerEl = document.getElementById('timer');
        if (timerEl) timerEl.innerHTML = "<h3 style='color:var(--gold);font-family:Great Vibes,cursive;font-size:2.5rem;'>Happily Married! 💍</h3>";
        return;
    }

    const d = Math.floor(distance / 86400000);
    const h = Math.floor((distance % 86400000) / 3600000);
    const m = Math.floor((distance % 3600000)  / 60000);
    const s = Math.floor((distance % 60000)    / 1000);

    rollNumber('days',    'days-ghost',    null,           d);
    rollNumber('hours',   'hours-ghost',   null,           h);
    rollNumber('minutes', 'minutes-ghost', null,           m);
    rollNumber('seconds', 'seconds-ghost', 'seconds-card', s);
}

const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();

// 2. GSAP Premium Animations
gsap.registerPlugin(ScrollTrigger);

// Hero Sequence
const heroTl = gsap.timeline();
heroTl.from(".ganesha-icon", { opacity: 0, y: -30, duration: 1.2, ease: "power2.out" })
      .from(".groom-side", { opacity: 0, x: -50, duration: 1, ease: "power2.out" }, "-=0.5")
      .from(".bride-side", { opacity: 0, x: 50, duration: 1, ease: "power2.out" }, "-=1")
      .from(".weds-container", { scale: 0, opacity: 0, duration: 0.8, ease: "back.out(2)" }, "-=0.5")
      .from(".hero-text h1", { opacity: 0, y: 20, duration: 1 }, "-=0.3")
      .from(".hero-text .invite-msg, .hero-text h3", { opacity: 0, duration: 1, stagger: 0.2 }, "-=0.5");

// Scroll Reveal Configuration
const revealUp = { y: 40, opacity: 0, duration: 1, ease: "power2.out" };
const revealScale = { scale: 0.9, opacity: 0, duration: 1, ease: "power2.out" };

gsap.utils.toArray(".reveal-up").forEach(el => {
    gsap.from(el, { ...revealUp, scrollTrigger: { trigger: el, start: "top 90%" } });
});

gsap.utils.toArray(".reveal-scale").forEach(el => {
    gsap.from(el, { ...revealScale, scrollTrigger: { trigger: el, start: "top 90%" } });
});

gsap.utils.toArray(".reveal-left").forEach(el => {
    gsap.from(el, { x: -40, opacity: 0, duration: 1, scrollTrigger: { trigger: el, start: "top 90%" } });
});

gsap.utils.toArray(".reveal-right").forEach(el => {
    gsap.from(el, { x: 40, opacity: 0, duration: 1, scrollTrigger: { trigger: el, start: "top 90%" } });
});

// 3. Optimized Particle System (Flower Petals)
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const isMobile = window.innerWidth < 768;
const particleCount = isMobile ? 15 : 30;
const colors = ['#D4AF37', '#FF4D4D', '#FFD700', '#F9E29C'];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Petal {
    constructor(initial = false) {
        this.reset(initial);
    }
    reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : -20 - Math.random() * 100;
        this.size = Math.random() * 8 + 4;
        this.speedY = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.rotation = Math.random() * 360;
        this.rotSpeed = Math.random() * 2 - 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
        this.y += this.speedY;
        this.x += Math.sin(this.y / 30) * 0.5 + this.speedX;
        this.rotation += this.rotSpeed;
        if (this.y > canvas.height + 20) this.reset();
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size/2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function init() {
    particles = Array.from({ length: particleCount }, () => new Petal(true));
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
}
init();
animate();

// 4. Music & Theme Controls
const music = document.getElementById('wedding-music');
const musicBtn = document.getElementById('music-toggle');
const themeBtn = document.getElementById('theme-toggle');
const welcomeOverlay = document.getElementById('welcome-overlay');
const openInviteBtn = document.getElementById('open-invite-btn');
let isMusicPlaying = false;

function setMusicState(playing) {
    isMusicPlaying = playing;
    if (musicBtn) {
        musicBtn.innerHTML = playing ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-music"></i>';
        if (playing) {
            musicBtn.classList.add('playing');
        } else {
            musicBtn.classList.remove('playing');
        }
    }
}

function closeOverlay() {
    if (!welcomeOverlay) return;
    gsap.to(welcomeOverlay, {
        opacity: 0,
        scale: 1.05,
        duration: 0.7,
        ease: "power2.out",
        onComplete: () => {
            welcomeOverlay.style.display = 'none';
        }
    });
}

function handleOpenInvitation() {
    if (music) {
        music.volume = 0.85;
        music.play().then(() => {
            setMusicState(true);
        }).catch((err) => {
            console.log("Audio play error:", err);
        });
    }
    closeOverlay();
}

// Click anywhere on overlay or on button triggers playback & reveals page
if (welcomeOverlay) {
    welcomeOverlay.addEventListener('click', handleOpenInvitation);
}
if (openInviteBtn) {
    openInviteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleOpenInvitation();
    });
}

function tryInitialAutoplay() {
    if (!music) return;
    music.volume = 0.85;

    const playPromise = music.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            // Autoplay succeeded directly! Hide overlay without needing click
            setMusicState(true);
            if (welcomeOverlay) welcomeOverlay.style.display = 'none';
        }).catch(() => {
            // Autoplay blocked by browser policy -> show welcome overlay so first user tap opens with music
            setMusicState(false);
            if (welcomeOverlay) welcomeOverlay.style.display = 'flex';
        });
    }
}

// Ensure audio is loaded and test autoplay
if (music) {
    music.load();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInitialAutoplay);
    } else {
        tryInitialAutoplay();
    }
}
window.addEventListener('load', () => {
    if (!isMusicPlaying && !welcomeOverlay) tryInitialAutoplay();
});

if (musicBtn) {
    musicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isMusicPlaying) {
            music.pause();
            setMusicState(false);
        } else {
            music.play().then(() => setMusicState(true)).catch(() => {});
        }
    });
}

themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('night-mode');
    const isNight = document.body.classList.contains('night-mode');
    themeBtn.innerHTML = isNight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// 5. Calendar Integration (Direct redirect to Calendar)
function addToCalendar(title, startStr, location) {
    const istStr = startStr.includes('T') ? startStr : startStr.replace(' ', 'T') + ':00+05:30';
    const startDate = new Date(istStr);
    const endDate = new Date(startDate.getTime() + 120 * 60000); // +2 hours

    const formatGCal = (d) => d.toISOString().replace(/-|:|\.\d+/g, "");

    const url = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
        '&text=' + encodeURIComponent(`${title} - Vivek & Manisha Wedding`) +
        '&dates=' + formatGCal(startDate) + '/' + formatGCal(endDate) +
        '&details=' + encodeURIComponent("Join us to celebrate the wedding of Vivek & Manisha!") +
        '&location=' + encodeURIComponent(location);

    window.open(url, '_blank');
}