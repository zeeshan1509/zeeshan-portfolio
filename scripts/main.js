// Tooltip for project card images
    document.querySelectorAll('.project-img').forEach(function(imgDiv) {
        const tooltip = imgDiv.querySelector('.project-img-tooltip');
        if (!tooltip) return;
        let hideTimeout = null;
        imgDiv.addEventListener('mouseenter', function() {
            imgDiv.classList.add('show-tooltip');
            if (hideTimeout) clearTimeout(hideTimeout);
            hideTimeout = setTimeout(function() {
                imgDiv.classList.remove('show-tooltip');
            }, 4000);
        });
        imgDiv.addEventListener('mouseleave', function() {
            imgDiv.classList.remove('show-tooltip');
            if (hideTimeout) clearTimeout(hideTimeout);
        });
    });
document.addEventListener('DOMContentLoaded', function() {
    // Theme setup: from storage or default to light
    const root = document.documentElement;
    const getStored = () => {
        try { return localStorage.getItem('theme'); } catch { return null; }
    };
    const setStored = (val) => {
        try { localStorage.setItem('theme', val); } catch {}
    };
    let theme = getStored() || 'light';
    const applyTheme = (t) => {
        root.classList.toggle('theme-dark', t === 'dark');
        root.classList.toggle('theme-light', t === 'light');
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.classList.toggle('fa-moon', t !== 'dark');
            icon.classList.toggle('fa-sun', t === 'dark');
        }
    };
    applyTheme(theme);

    // Theme Toggle Functionality (guarded)
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            theme = (root.classList.contains('theme-dark') ? 'light' : 'dark');
            applyTheme(theme);
            setStored(theme);
        });
    }

    // Mobile Menu Toggle for Navbar (guarded)
    const menuToggle = document.getElementById('menu-toggle');
    const navbarLinks = document.querySelector('.navbar-links');
    if (menuToggle && navbarLinks) {
        menuToggle.addEventListener('click', () => {
            navbarLinks.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('.navbar-links a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return; // allow default if no target
            e.preventDefault();
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
            // Update active class
            document.querySelectorAll('.navbar-links a').forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            // Close mobile menu after clicking
            if (window.innerWidth < 969 && navbarLinks) {
                navbarLinks.classList.remove('active');
            }
        });
    });

    // Scroll progress bar & active link highlighting
    const nav = document.querySelector('.navbar');
    const progressBar = document.querySelector('.nav-progress');
    const sections = Array.from(document.querySelectorAll('main section[id]'));
    const navLinks = Array.from(document.querySelectorAll('.navbar-links a[href^="#"]'));

    const setActiveLink = (id) => {
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
    };

    const onScroll = () => {
        // progress
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = Math.max(0, Math.min(1, scrollTop / (docHeight || 1)));
        if (progressBar) progressBar.style.width = `${pct * 100}%`;
        // shrink navbar
        if (nav) {
            if (scrollTop > 10) nav.classList.add('shrink'); else nav.classList.remove('shrink');
        }
        // active section
        if (sections.length && navLinks.length) {
            let current = sections[0]?.id;
            for (const sec of sections) {
                const rect = sec.getBoundingClientRect();
                if (rect.top <= 120 && rect.bottom >= 200) { current = sec.id; break; }
            }
            if (current) setActiveLink(current);
        }
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Initialize Projects Slider (only if Swiper exists and container present)
    if (typeof Swiper !== 'undefined' && document.querySelector('.projects-slider')) {
        // eslint-disable-next-line no-undef
        new Swiper('.projects-slider', {
            slidesPerView: 3,
            spaceBetween: 120,
            loop: true,
            loopAdditionalSlides: 2,
            centeredSlides: false,
            grabCursor: true,
            initialSlide: 0,
            slideVisibleClass: 'swiper-slide-visible',
            speed: 500,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                dynamicBullets: true
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                0: { 
                    slidesPerView: 1,
                    spaceBetween: 20
                },
                768: { 
                    slidesPerView: 2,
                    spaceBetween: 25
                },
                1400: { 
                    slidesPerView: 3,
                    spaceBetween: 30
                }
            }
        });
    }

    // Initialize Leaflet map for My Journey section
    if (document.getElementById('journey-map')) {
        window.journeyMap = L.map('journey-map', {
            center: [33.6844, 60], // Centered on Islamabad/Pakistan region
            zoom: 4,
            zoomControl: false,
            attributionControl: false
        });
        // Base layers
        var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors'
        });
        var cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors, © CARTO'
        });
        var cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors, © CARTO'
        });
    cartoLight.addTo(window.journeyMap);
        // Add zoom control to top left
        L.control.zoom({ position: 'topleft' }).addTo(window.journeyMap);

        // Add fullscreen button below zoom controls
        var FullscreenControl = L.Control.extend({
            options: { position: 'topleft' },
            onAdd: function(map) {
                var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom map-ctrl-btn');
                container.title = 'Full screen map';
                container.style.marginTop = '2.5em';
                container.style.width = '34px';
                container.style.height = '34px';
                container.style.display = 'flex';
                container.style.alignItems = 'center';
                container.style.justifyContent = 'center';
                container.innerHTML = '<i class="fas fa-expand"></i>';
                container.onclick = function(e) {
                    e.stopPropagation();
                    var mapContainer = map.getContainer();
                    // Try Leaflet.fullscreen plugin if available
                    if (map.toggleFullscreen) {
                        map.toggleFullscreen();
                    } else {
                        // Fallback: toggle a fullscreen class
                        if (!document.fullscreenElement) {
                            mapContainer.requestFullscreen();
                        } else {
                            document.exitFullscreen();
                        }
                    }
                };
                return container;
            }
        });
        window.journeyMap.addControl(new FullscreenControl());
        // Add layer control to top right (OSM, Carto Light, Carto Dark)
        var baseMaps = {
            "Light": cartoLight,
            "Dark": cartoDark,
            "OpenStreetMap": osm
        };
        // Add education markers layer
        var educationIcon = L.divIcon({
            className: 'edu-marker',
            html: '<i class="fas fa-graduation-cap"></i>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
        window.islamabadMarker = L.marker([33.6844, 73.0479], { icon: educationIcon }).bindPopup("Islamabad, Pakistan<br>Bachelor's: NUST");
        var rawalpindiMarker = L.marker([33.5889, 73.2236], { icon: educationIcon }).bindPopup("Rawalpindi, Pakistan<br>Work: Full Stack GIS Developer");
        var dubaiMarker = L.marker([25.2048, 55.2708], { icon: educationIcon }).bindPopup("Dubai, UAE<br>Work: Geospatial Developer");
        var ukMarker = L.marker([51.5074, -0.1278], { icon: educationIcon }).bindPopup("United Kingdom<br>Work: GIS Developer");
        var eduLayer = L.layerGroup([window.islamabadMarker, rawalpindiMarker, dubaiMarker, ukMarker]);
    eduLayer.addTo(window.journeyMap);

        // Add work markers layer
        var workIcon = L.divIcon({
            className: 'work-marker',
            html: '<i class="fas fa-briefcase"></i>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
        var blueAreaMarker = L.marker([33.7101, 73.0551], { icon: workIcon }).bindPopup("Blue Area, Islamabad");
        var workLayer = L.layerGroup([
            window.riyadhMarker, window.arnhemMarker, window.melbourneMarker, window.californiaMarker, blueAreaMarker
        ]);
    workLayer.addTo(window.journeyMap);

        // Add both layers to the control
    L.control.layers(baseMaps, { 'My Education': eduLayer, 'Work': workLayer }, { position: 'topright' }).addTo(window.journeyMap);
        // Clickable text for all markers
        var markerLinks = [
            { id: 'zoom-nust', marker: window.islamabadMarker, latlng: [33.6844, 73.0479], zoom: 12 },
            { id: 'zoom-twente', marker: window.enschedeMarker, latlng: [52.2215, 6.8937], zoom: 12 },
            { id: 'zoom-arnhem', marker: window.arnhemMarker, latlng: [51.9851, 5.8987], zoom: 12 },
            { id: 'zoom-california', marker: window.californiaMarker, latlng: [36.7783, -119.4179], zoom: 6 },
            { id: 'zoom-riyadh', marker: window.riyadhMarker, latlng: [24.7136, 46.6753], zoom: 12 },
            { id: 'zoom-melbourne', marker: window.melbourneMarker, latlng: [-37.8136, 144.9631], zoom: 12 }
        ];
        markerLinks.forEach(function(link) {
            var el = document.getElementById(link.id);
            if (el) {
                el.style.cursor = 'pointer';
                el.addEventListener('click', function() {
                    window.journeyMap.setView(link.latlng, link.zoom, { animate: true });
                    link.marker.openPopup();
                });
            }
        });
    }
});