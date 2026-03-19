import './style.css';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createIcons, User, Compass, Link, Wrench, Hammer, ExternalLink, Github, Linkedin, Mail, FileText } from 'lucide';

// Initialize Icons
createIcons({
  icons: {
    User, Compass, Link, Wrench, Hammer, ExternalLink, Github, Linkedin, Mail, FileText
  }
});

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * 1. Custom Cursor & Magnetic Buttons
 */
const cursor = document.querySelector('.custom-cursor');
const follower = document.querySelector('.custom-cursor-follower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  // Custom cursor instantly follows
  gsap.to(cursor, {
    x: mouseX,
    y: mouseY,
    duration: 0.1,
    ease: "power2.out"
  });
});

// Follower with lag
gsap.ticker.add(() => {
  followerX += (mouseX - followerX) * 0.15;
  followerY += (mouseY - followerY) * 0.15;
  gsap.set(follower, { x: followerX, y: followerY });
});

// Magnetic Buttons Hover
const magneticBtns = document.querySelectorAll('.magnetic-btn, .hamburger');
magneticBtns.forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    cursor.classList.add('hover');
    follower.classList.add('hover');
  });
  
  btn.addEventListener('mouseleave', () => {
    cursor.classList.remove('hover');
    follower.classList.remove('hover');
    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  });
  
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    gsap.to(btn, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.5,
      ease: "power2.out"
    });
  });
});

/**
 * 2. Three.js Responsive Aurora Particle Background
 */
const canvas = document.querySelector('#bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// Particles geometry
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);
const colorsArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i+=3) {
  // Give a sphere-like or scattered fluid layout
  posArray[i] = (Math.random() - 0.5) * 15;
  posArray[i+1] = (Math.random() - 0.5) * 15;
  posArray[i+2] = (Math.random() - 0.5) * 15;
  
  // Base blue-ish / purple-ish colors
  colorsArray[i] = 0.2 + Math.random() * 0.3; // R
  colorsArray[i+1] = 0.2 + Math.random() * 0.4; // G
  colorsArray[i+2] = 0.8 + Math.random() * 0.2; // B
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

// Custom Shader Material for glowing aurora dots
const particleMaterial = new THREE.PointsMaterial({
  size: 0.05,
  vertexColors: true,
  blending: THREE.AdditiveBlending,
  transparent: true,
  opacity: 0.8,
});

const particlesMesh = new THREE.Points(particlesGeometry, particleMaterial);
scene.add(particlesMesh);

camera.position.z = 5;

// Variables for interaction
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
  targetX = (event.clientX - windowHalfX) * 0.001;
  targetY = (event.clientY - windowHalfY) * 0.001;
});

const clock = new THREE.Clock();

function animateParticles() {
  requestAnimationFrame(animateParticles);
  const elapsedTime = clock.getElapsedTime();
  
  // Slow constant rotation
  particlesMesh.rotation.y += 0.001;
  particlesMesh.rotation.x += 0.0005;
  
  // Wave motion based on time
  const positions = particlesGeometry.attributes.position.array;
  for(let i = 1; i < particlesCount * 3; i+=3) {
    positions[i] += Math.sin(elapsedTime * 0.5 + positions[i-1]) * 0.005;
  }
  particlesGeometry.attributes.position.needsUpdate = true;
  
  // Mouse interaction rotation
  particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
  particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);
  
  renderer.render(scene, camera);
}
animateParticles();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * 3. GSAP Animations & ScrollTriggers
 */

// Navbar Scroll Effect & ScrollSpy
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

const sections = document.querySelectorAll('section');
const navLinksDesktop = document.querySelectorAll('.nav-links a');

sections.forEach((section, i) => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top 50%',
    end: 'bottom 50%',
    onEnter: () => updateNav(i),
    onEnterBack: () => updateNav(i),
  });

  if (navLinksDesktop[i]) {
    const underline = navLinksDesktop[i].querySelector('.underline');
    const isLastSection = i === sections.length - 1;
    if (underline) {
      gsap.fromTo(underline, 
        { width: '0%' }, 
        { 
          width: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 50%',
            end: isLastSection ? 'bottom bottom' : 'bottom 50%',
            scrub: true
          }
        }
      );
    }
  }
});

function updateNav(activeIndex) {
  navLinksDesktop.forEach((link, i) => {
    link.classList.remove('active-link', 'past-link');
    if (i === activeIndex) {
      link.classList.add('active-link');
    } else if (i < activeIndex) {
      link.classList.add('past-link');
    }
  });
}

// Hero text cycle
const cycleTexts = document.querySelectorAll('.cycle-text');
let currentCycle = 0;
setInterval(() => {
  cycleTexts[currentCycle].classList.remove('active');
  currentCycle = (currentCycle + 1) % cycleTexts.length;
  cycleTexts[currentCycle].classList.add('active');
}, 3000);

// Initial Build-in Animation
gsap.from('.nav-logo', { y: -50, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.2 });
gsap.from('.nav-links a', { y: -50, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.3 });
gsap.from('.reveal-text', { y: 100, opacity: 0, duration: 1.2, ease: 'power4.out', stagger: 0.2, delay: 0.5 });
gsap.from('.hero-photo', { scale: 0.8, opacity: 0, duration: 1.5, ease: 'power3.out', delay: 0.8 });

// Global Sections ScrollTrigger
gsap.utils.toArray('section').forEach((section, i) => {
  if(i === 0) return; // skip hero
  
  gsap.from(section, {
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    y: 50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  });
});

// Tilt Cards effect
const tiltCards = document.querySelectorAll('.tilt-card');
tiltCards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Reverse logic slightly to give natural tilt feeling
    gsap.to(card.querySelector('.card-front'), {
      rotationY: x * 0.05,
      rotationX: -y * 0.05,
      duration: 0.5,
      ease: 'power2.out'
    });

    // Update CSS variables for border glow effect
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  });
  
  card.addEventListener('mouseleave', () => {
    gsap.to(card.querySelector('.card-front'), {
      rotationY: 0,
      rotationX: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
  });
});

// Skill Cards Hover Glow tracking
const skillCards = document.querySelectorAll('.skill-card');
skillCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  });
});

/**
 * 4. About Section Tab Switcher
 */
const switches = document.querySelectorAll('.switch');
const contents = document.querySelectorAll('.content-para');

switches.forEach(sw => {
  sw.addEventListener('click', () => {
    // remove active class from all
    switches.forEach(s => s.classList.remove('active'));
    contents.forEach(c => {
      c.classList.remove('active');
      gsap.set(c, { display: 'none', opacity: 0, y: 10 });
    });
    
    // add to clicked
    sw.classList.add('active');
    const targetId = sw.getAttribute('data-target');
    const targetContent = document.getElementById(targetId);
    
    targetContent.classList.add('active');
    gsap.to(targetContent, { display: 'block', opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
  });
});

/**
 * 5. Mobile Menu Toggle
 */
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.stagger-link');
let menuOpen = false;

hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  
  if (menuOpen) {
    hamburger.classList.add('active');
    // Animate lines to X
    gsap.to('.hamburger .top', { rotation: 45, y: 8, duration: 0.3 });
    gsap.to('.hamburger .middle', { opacity: 0, duration: 0.3 });
    gsap.to('.hamburger .bottom', { rotation: -45, y: -8, duration: 0.3 });
    
    mobileMenu.classList.add('active');
    gsap.to(mobileLinks, { x: 0, opacity: 1, stagger: 0.15, delay: 0.3, duration: 0.5, ease: 'power2.out' });
  } else {
    hamburger.classList.remove('active');
    // Animate lines back
    gsap.to('.hamburger .top', { rotation: 0, y: 0, duration: 0.3 });
    gsap.to('.hamburger .middle', { opacity: 1, duration: 0.3 });
    gsap.to('.hamburger .bottom', { rotation: 0, y: 0, duration: 0.3 });
    
    gsap.to(mobileLinks, { x: -50, opacity: 0, stagger: 0.05, duration: 0.3 });
    setTimeout(() => {
      mobileMenu.classList.remove('active');
    }, 600);
  }
});

// Close menu on link click
mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.click();
  });
});
