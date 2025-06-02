document.addEventListener('DOMContentLoaded', () => {
    // Preloader
    window.addEventListener('load', () => {
        const preloader = document.querySelector('.preloader');
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    });

    // Custom Cursor
    const cursor = document.getElementById('custom-cursor');
    const cursorRing = document.querySelector('.cursor-ring');
    const cursorDot = document.querySelector('.cursor-dot');
    let trailElements = [];

    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;

        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;

        // Create trail effect
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.left = `${x}px`;
        trail.style.top = `${y}px`;
        document.body.appendChild(trail);
        trailElements.push(trail);

        // Remove oldest trail element after a delay
        if (trailElements.length > 10) {
            const oldTrail = trailElements.shift();
            oldTrail.remove();
        }

        // Update mouse interaction for Three.js
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    document.addEventListener('mousedown', () => {
        cursor.classList.add('active');
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.remove('active');
    });

    // Navigation
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-link');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });

                // Close mobile nav after clicking a link
                if (mobileNav.classList.contains('active')) {
                    mobileNav.classList.remove('active');
                    navToggle.classList.remove('active');
                }

                // Update active nav link
                navLinks.forEach(nav => nav.removeAttribute('data-active'));
                link.setAttribute('data-active', 'true');
            }
        });
    });

    // Update active nav link on scroll
    window.addEventListener('scroll', () => {
        const fromTop = window.scrollY + 100;

        navLinks.forEach(link => {
            const sectionId = link.getAttribute('href').substring(1);
            const section = document.getElementById(sectionId);

            if (section && section.offsetTop <= fromTop && section.offsetTop + section.offsetHeight > fromTop) {
                navLinks.forEach(nav => nav.removeAttribute('data-active'));
                link.setAttribute('data-active', 'true');
            }
        });
    });

    // Contact Pop-up
    const form = document.getElementById('contact-form');
    const popup = document.getElementById('contact-popup');
    const closePopup = document.querySelector('.popup-close');

    if (form && popup) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            popup.classList.add('active');
            popup.setAttribute('aria-hidden', 'false');
            gsap.fromTo('.popup-content', 
                { opacity: 0, scale: 0.8, y: 50 },
                { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power2.out' }
            );
        });

        closePopup.addEventListener('click', () => {
            gsap.to('.popup-content', {
                opacity: 0,
                scale: 0.8,
                y: 50,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    popup.classList.remove('active');
                    popup.setAttribute('aria-hidden', 'true');
                    form.reset();
                }
            });
        });

        // Close pop-up on clicking outside
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                closePopup.click();
            }
        });
    }

    // Three.js Moon Animation (Home Section)
    function createScene(canvasId) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById(canvasId), alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        camera.position.z = 10;
        return { scene, camera, renderer };
    }

    // Hero Moon
    const heroMoon = createScene('earth-hero-canvas');
    const heroGeometry = new THREE.SphereGeometry(3, 64, 64);
    const heroTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/moon_1024.jpg');
    const heroMaterial = new THREE.MeshStandardMaterial({
        map: heroTexture,
        color: 0x808080,
        emissive: 0x000000,
        metalness: 0,
        roughness: 1
    });
    const heroSphere = new THREE.Mesh(heroGeometry, heroMaterial);
    heroMoon.scene.add(heroSphere);

    // Atmosphere Glow
    const atmosphereGeometry = new THREE.SphereGeometry(3.1, 64, 64);
    const atmosphereMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    heroMoon.scene.add(atmosphere);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 20;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.05,
        transparent: true,
        opacity: 0.5
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    heroMoon.scene.add(particles);

    // Lighting
    const heroLight = new THREE.PointLight(0xffffff, 1, 100);
    heroLight.position.set(10, 10, 10);
    heroMoon.scene.add(heroLight);
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    heroMoon.scene.add(ambientLight);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        heroSphere.rotation.y += 0.003;
        atmosphere.rotation.y += 0.003;
        particles.rotation.y += 0.001;
        heroMoon.camera.position.x += (mouseX - heroMoon.camera.position.x) * 0.05;
        heroMoon.camera.position.y += (-mouseY - heroMoon.camera.position.y) * 0.05;
        heroMoon.camera.lookAt(heroMoon.scene.position);
        heroMoon.renderer.render(heroMoon.scene, heroMoon.camera);
    }
    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        heroMoon.camera.aspect = window.innerWidth / window.innerHeight;
        heroMoon.camera.updateProjectionMatrix();
        heroMoon.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // GSAP Animations with ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Hero Content Animation
    gsap.fromTo('.hero-content', 
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 1.5, ease: 'power4.out', delay: 0.5 }
    );

    // Project Cards Animation with 3D Tilt
    gsap.utils.toArray('.project-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 50,
            duration: 1,
            delay: i * 0.3,
            ease: 'power4.out'
        });

        // 3D Tilt Effect
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(card, {
                rotationY: x * 0.05,
                rotationX: -y * 0.05,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotationY: 0,
                rotationX: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
});