// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

// RAF for Lenis (Standard Loop)
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Integrate with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.lagSmoothing(0); // Kept for GSAP smoothness

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Logic
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('nav ul');
    const navLinks = document.querySelectorAll('nav ul li');

    if (burger) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
            burger.classList.toggle('toggle');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-active');
            if (burger) {
                burger.classList.remove('toggle');
            }
        });
    });

    // Custom Cursor Logic
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    const links = document.querySelectorAll('a, button, .project-card, .skill-box, .award-card');

    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1
        });
        gsap.to(follower, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.3
        });
    });

    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            follower.classList.add('active');
        });
        link.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            follower.classList.remove('active');
        });
    });

    // --- Efimov Style Advanced Animations ---

    // 0. Manual Split for H1 & Headers (Robust Fallback)
    document.fonts.ready.then(() => {
        try {
            // Helper: Manual Split & Scatter Animation
            function splitAndScatter(target, isHero = false) {
                if (!target) return;

                const text = target.innerText;
                target.innerHTML = ''; // Clear content
                const charElements = [];

                // Manual Split Logic
                const words = text.split(' ');
                words.forEach((wordText, index) => {
                    const wordSpan = document.createElement('span');
                    wordSpan.classList.add('word');
                    wordSpan.style.display = 'inline-block';
                    wordSpan.style.marginRight = '0.25em';

                    const chars = wordText.split('');
                    chars.forEach(charText => {
                        const charSpan = document.createElement('span');
                        charSpan.classList.add('char');
                        charSpan.style.display = 'inline-block';
                        charSpan.innerText = charText;
                        wordSpan.appendChild(charSpan);
                        charElements.push(charSpan);
                    });
                    target.appendChild(wordSpan);
                });

                // Animation Logic
                // Force initial scattered state
                gsap.set(charElements, {
                    x: (i) => (Math.random() - 0.5) * 300,
                    y: (i) => (Math.random() - 0.5) * 150,
                    opacity: 0,
                    scale: 2,
                    filter: 'blur(15px)',
                    willChange: 'transform, opacity, filter'
                });

                // Animate to final state
                const animVars = {
                    x: 0,
                    y: 0,
                    opacity: 1,
                    filter: 'blur(0px)',
                    scale: 1,
                    stagger: { amount: 1, from: 'random' },
                    ease: 'power4.out',
                    duration: 1.5
                };

                if (isHero) {
                    // Hero Timeline (plays immediately/sequenced)
                    const tl = gsap.timeline();
                    tl.to(charElements, animVars)
                        .from('.hero-content p .word', { y: 30, opacity: 0, filter: 'blur(10px)', stagger: 0.02, duration: 1 }, '-=1.0')
                        .from('.hero-visual', { scale: 0.8, opacity: 0, filter: 'blur(20px)', duration: 2 }, '-=1.5')
                        .from('.hero-buttons', { y: 20, opacity: 0, filter: 'blur(5px)' }, '-=1');
                } else {
                    // ScrollTrigger for Sections
                    gsap.to(charElements, {
                        ...animVars,
                        scrollTrigger: {
                            trigger: target,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse' // Replay on scroll back up
                        }
                    });
                }
            }

            // 1. Apply to Hero H1
            const h1 = document.querySelector('.hero-content h1');
            splitAndScatter(h1, true);

            // 2. Apply to All Section Headers
            document.querySelectorAll('.section-header h2').forEach(h2 => {
                splitAndScatter(h2, false);
            });

            // Split others using library (Universal targets) WITHOUT headers now
            try {
                // Target all significant text content
                const textTargets = [
                    '.hero-content p',
                    // '.section-header h2', // Removed, handled by Scatter
                    '.about-text p',
                    '.contact-text p',
                    '.card-body p',
                    '.card-body h3',
                    '.quote-box p'
                ].join(', ');

                const splitInstances = new SplitType(textTargets, { types: 'lines, words' });
                document.querySelectorAll('.line').forEach(l => l.style.overflow = 'hidden');
            } catch (e) { console.warn("Library split failed", e); }

        } catch (e) {
            console.warn("Manual split error:", e);
        }
    });

    // 5. Universal Text Reveals (Scroll-Based) - Removed Header selector
    const revealBatch = [
        // '.section-header h2', // Handled by scatter
        '.about-text p',
        '.contact-text p',
        '.card-body p',
        '.card-body h3',
        '.quote-box p'
    ];

    revealBatch.forEach(selector => {
        gsap.utils.toArray(selector).forEach(el => {
            // Check if element has split words, otherwise fallback to element itself
            const targets = el.querySelectorAll('.word').length > 0 ? el.querySelectorAll('.word') : el;

            gsap.from(targets, {
                y: '100%', // Slide up from mask (if line overflow hidden) or just up
                opacity: 0,
                filter: 'blur(5px)',
                duration: 0.8,
                stagger: 0.02,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    // Start when top of element hits 90% of viewport
                    start: 'top 90%',
                    // Optional: toggleActions: 'play none none reverse'
                }
            });
        });
    });

    // 6. Staggered Grids (Skills & Awards) - Enhanced with Blur/Scale
    gsap.utils.toArray('.skills-grid, .awards-grid').forEach(grid => {
        gsap.from(grid.children, {
            y: 30,
            opacity: 0,
            scale: 0.9,
            filter: 'blur(10px)',
            duration: 1,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: grid,
                start: 'top 85%'
            }
        });
    });
});
