import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ----------------------------------------------------
// 1. Smooth Scroll Setup (Lenis)
// ----------------------------------------------------
const lenis = new Lenis({
  duration: 1.6, // Increased scroll transition duration for silkier scroll feel
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1.5,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Link GSAP ScrollTrigger to Lenis scroll updates
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);


// ----------------------------------------------------
// 2. Interactive 3D Particles Background (Canvas)
// ----------------------------------------------------
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

// Particles variables
const particleCount = window.innerWidth < 768 ? 50 : 120;
const particles = [];
const focusLength = 300;
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;
let scrollVelocity = 0;
let lastScrollY = window.scrollY;

// Tracking Mouse Position
window.addEventListener('mousemove', (e) => {
  targetMouseX = (e.clientX - width / 2) * 0.15;
  targetMouseY = (e.clientY - height / 2) * 0.15;
});

// Particle Class
class Particle {
  constructor() {
    this.reset();
    // Randomize initial Z position to spread them out on launch
    this.z = Math.random() * 800;
  }

  reset() {
    this.x = (Math.random() - 0.5) * 1200;
    this.y = (Math.random() - 0.5) * 1200;
    this.z = 800;
    this.size = Math.random() * 1.5 + 0.5;
    this.color = Math.random() > 0.5 ? 'rgba(121, 40, 202, ' : 'rgba(255, 42, 133, ';
    this.alpha = Math.random() * 0.5 + 0.2;
  }

  update(speed) {
    // Scroll speed increases particle movement speed (space warp effect)
    this.z -= 1.8 + speed * 12;

    // Reset when particles get too close to the screen
    if (this.z <= 0) {
      this.reset();
    }
  }

  draw() {
    // Project 3D coordinates to 2D
    const px = (this.x - mouseX) * (focusLength / this.z) + width / 2;
    const py = (this.y - mouseY) * (focusLength / this.z) + height / 2;

    // Fade out particles that are far or extremely close
    const finalAlpha = this.alpha * Math.min(1, this.z / 150) * Math.min(1, (800 - this.z) / 200);

    if (px > 0 && px < width && py > 0 && py < height) {
      ctx.beginPath();
      ctx.arc(px, py, this.size * (focusLength / this.z) * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = this.color + finalAlpha + ')';
      ctx.fill();
    }
  }
}

// Initialize particles
for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

// Main Canvas Animation Loop
function animateParticles() {
  ctx.clearRect(0, 0, width, height);

  // Smooth mouse interpolation (inertia)
  mouseX += (targetMouseX - mouseX) * 0.08;
  mouseY += (targetMouseY - mouseY) * 0.08;

  // Calculate scroll speed to inject into warp velocity
  const currentScrollY = window.scrollY;
  const scrollDiff = Math.abs(currentScrollY - lastScrollY);
  scrollVelocity += (scrollDiff - scrollVelocity) * 0.1;
  lastScrollY = currentScrollY;

  // Decelerate warp speed slowly
  scrollVelocity *= 0.95;

  particles.forEach((particle) => {
    particle.update(scrollVelocity);
    particle.draw();
  });

  requestAnimationFrame(animateParticles);
}
animateParticles();


// 3D Card Hover Tilt Effect disabled to keep photo still
const tiltCards = [];


// ----------------------------------------------------
// 4. GSAP & ScrollTrigger Animations
// ----------------------------------------------------

// Navbar scroll logic
const header = document.querySelector('header');
ScrollTrigger.create({
  start: 'top -50px',
  onUpdate: (self) => {
    if (self.direction === 1) {
      header.classList.add('scrolled');
    } else if (self.scroll() < 50) {
      header.classList.remove('scrolled');
    }
  }
});

// Navigation Active States on scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a');

sections.forEach((section) => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top center',
    end: 'bottom center',
    onToggle: (self) => {
      if (self.isActive) {
        const id = section.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    }
  });
});

// Preloader completion trigger
window.addEventListener('load', () => {
  const progressBar = document.querySelector('.preloader-progress');

  // Speed up preloader animation on load
  gsap.to(progressBar, {
    width: '100%',
    duration: 0.5,
    ease: 'power1.inOut',
    onComplete: () => {
      gsap.to('#preloader', {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          document.getElementById('preloader').style.visibility = 'hidden';
          triggerHeroReveal();
          // Recalculate ScrollTrigger heights
          ScrollTrigger.refresh();
        }
      });
    }
  });
});

// Hero animations
function triggerHeroReveal() {
  const tl = gsap.timeline();

  tl.from('.hero-title span', {
    y: 60,
    opacity: 0,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power4.out'
  })
    .from('.hero-tagline-new', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.3')
    .from('.hero-description', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.4')
    .from('.hero-actions .btn', {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.6');
}

// Fade in revealing headings
document.querySelectorAll('.section-header, .services-intro').forEach((header) => {
  gsap.from(header, {
    scrollTrigger: {
      trigger: header,
      start: 'top 85%',
      toggleActions: 'play none none none'
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });
});

// Capabilities cards cascade
gsap.from('.capability-card', {
  scrollTrigger: {
    trigger: '.capabilities-grid',
    start: 'top 80%',
    toggleActions: 'play none none none'
  },
  y: 60,
  opacity: 0,
  stagger: 0.15,
  duration: 0.8,
  ease: 'power3.out'
});

// Why Choose Us cards cascade
gsap.from('.why-card', {
  scrollTrigger: {
    trigger: '.why-choose-grid',
    start: 'top 80%',
    toggleActions: 'play none none none'
  },
  y: 60,
  opacity: 0,
  stagger: 0.15,
  duration: 0.8,
  ease: 'power3.out'
});

// Pricing cards reveal removed

// Project cards cascade
document.querySelectorAll('.project-card-wrapper').forEach((card) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
      toggleActions: 'play none none none'
    },
    y: 80,
    opacity: 0,
    duration: 1.0,
    ease: 'power3.out'
  });
});

// Timeline steps cascade
gsap.from('.timeline-item', {
  scrollTrigger: {
    trigger: '.timeline',
    start: 'top 75%',
    toggleActions: 'play none none none'
  },
  x: -50,
  opacity: 0,
  stagger: 0.2,
  duration: 0.8,
  ease: 'power3.out'
});




// ----------------------------------------------------
// Hamburger Mobile Menu Drawer Toggle
// ----------------------------------------------------
const hamburgerToggle = document.getElementById('hamburger-toggle');
const navDrawer = document.querySelector('header nav');
const navLinksList = document.querySelectorAll('header nav a');

if (hamburgerToggle && navDrawer) {
  hamburgerToggle.addEventListener('click', () => {
    const isActive = hamburgerToggle.classList.toggle('active');
    navDrawer.classList.toggle('active');
    document.body.classList.toggle('menu-open');

    if (isActive) {
      if (typeof lenis !== 'undefined' && lenis.stop) lenis.stop();
    } else {
      if (typeof lenis !== 'undefined' && lenis.start) lenis.start();
    }
  });

  navLinksList.forEach((link) => {
    link.addEventListener('click', () => {
      hamburgerToggle.classList.remove('active');
      navDrawer.classList.remove('active');
      document.body.classList.remove('menu-open');
      if (typeof lenis !== 'undefined' && lenis.start) lenis.start();
    });
  });
}

// Review cards cascade entrance animation
gsap.from('.review-card', {
  scrollTrigger: {
    trigger: '.reviews-grid',
    start: 'top 85%',
    toggleActions: 'play none none none'
  },
  y: 50,
  opacity: 0,
  stagger: 0.15,
  duration: 0.8,
  ease: 'power3.out'
});


// ----------------------------------------------------
// 6. Interactive Contact Form Handler
// ----------------------------------------------------
const contactForm = document.getElementById('portfolio-contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn.innerHTML;

    // Sending animation feedback
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Sending Proposal <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>`;

    // Add simple inline spinner style
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .animate-spin {
        animation: spin 1s linear infinite;
        margin-left: 10px;
        display: inline-block;
      }
    `;
    document.head.appendChild(style);

    // Simulate server side request
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;

      // Success feedback
      formStatus.className = 'form-status success';
      formStatus.innerText = 'Thank you! Your message has been sent successfully. Vishnu will contact you shortly.';

      // Clear inputs
      contactForm.reset();

      // Auto fade message after 6 seconds
      setTimeout(() => {
        gsap.to(formStatus, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            formStatus.style.display = 'none';
            formStatus.style.opacity = 1;
          }
        });
      }, 6000);

    }, 1500);
  });
}
