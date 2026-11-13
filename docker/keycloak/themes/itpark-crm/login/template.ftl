<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false>
<!DOCTYPE html>
<html lang="${lang!"en"}" data-theme="light">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>Ethiopian IT Park • Enterprise CRM Portal</title>
    <link rel="icon" type="image/x-icon" href="${url.resourcesPath}/img/favicon.ico" />
    <link rel="stylesheet" href="${url.resourcesPath}/css/login.css" />
</head>
<body class="itpark-login-page">

<!-- Wide-Area 3D Landscape Mountain Terrain Canvas -->
<canvas id="dotted-terrain-canvas"></canvas>

<!-- Top Right Floating Bar: Theme Toggle & Language Switcher -->
<header class="itpark-topbar">
    <div class="itpark-top-controls">
        <!-- Theme Mode Selector (System / Light / Dark) -->
        <div class="itpark-pill itpark-theme-pill" role="group" aria-label="Theme selection">
            <button type="button" class="itpark-pill-btn" data-theme-val="system" title="System theme" id="theme-btn-system">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="20" height="14" x="2" y="3" rx="2"/>
                    <line x1="8" x2="16" y1="21" y2="21"/>
                    <line x1="12" x2="12" y1="17" y2="21"/>
                </svg>
            </button>
            <button type="button" class="itpark-pill-btn" data-theme-val="light" title="Light mode" id="theme-btn-light">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2"/><path d="M12 20v2"/>
                    <path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>
                    <path d="M2 12h2"/><path d="M20 12h2"/>
                    <path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
                </svg>
            </button>
            <button type="button" class="itpark-pill-btn" data-theme-val="dark" title="Dark mode" id="theme-btn-dark">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
            </button>
        </div>

        <!-- Language Switcher (English / አማርኛ) -->
        <div class="itpark-pill itpark-lang-pill" role="group" aria-label="Language selection">
            <button type="button" class="itpark-pill-btn itpark-lang-btn active" data-lang="en" id="lang-btn-en">
                English
            </button>
            <button type="button" class="itpark-pill-btn itpark-lang-btn" data-lang="am" id="lang-btn-am">
                አማርኛ
            </button>
        </div>
    </div>
</header>

<div class="itpark-container">
    <!-- Floating Glassmorphism/Matte Login Card -->
    <div class="itpark-card">
        <!-- Inside Card Header with Official Website Logos -->
        <div class="itpark-card-header">
            <div class="itpark-brand-logo-container">
                <!-- Light Mode Official Logo (Navy + Teal) -->
                <img src="${url.resourcesPath}/img/itpark-logo-light.png" 
                     alt="Ethiopian IT Park • የኢትዮጵያ ኢንፎርሜሽን ቴክኖሎጂ ፓርክ" 
                     class="itpark-logo-img itpark-logo-light" />
                
                <!-- Dark Mode Official Logo (Pure Monochrome White) -->
                <img src="${url.resourcesPath}/img/itpark-logo-dark.png" 
                     alt="Ethiopian IT Park • የኢትዮጵያ ኢንፎርሜሽን ቴክኖሎጂ ፓርክ" 
                     class="itpark-logo-img itpark-logo-dark" />
            </div>
            <p class="itpark-card-subtitle" data-i18n="card_desc">Sign in with your corporate account</p>
        </div>

        <!-- Alert Banner (Error/Info Messages from Keycloak) -->
        <#if displayMessage && message?has_content && (message.type != 'warning')>
            <div class="itpark-alert">
                <svg class="itpark-alert-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" x2="12" y1="8" y2="12"/>
                    <line x1="12" x2="12.01" y1="16" y2="16"/>
                </svg>
                <span class="itpark-alert-title">${kcSanitize(message.summary)?no_esc}</span>
            </div>
        </#if>

        <!-- Nested Content (Login Form & Social Buttons) -->
        <#nested "form">
    </div>

    <!-- Security Notice Footer -->
    <div class="itpark-footer">
        <p>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
            </svg>
            <span data-i18n="footer_notice">Official Platform • Ethiopian IT Park Corporation &copy; 2026</span>
        </p>
    </div>
</div>

<!-- Scripts for Wide Mountain Terrain Simulation, Language Switcher, and Theme Management -->
<script>
(function() {
    // ----------------------------------------------------
    // 1. Language Translation Engine (English / አማርኛ)
    // ----------------------------------------------------
    const i18n = {
        en: {
            card_desc: "Sign in with your corporate account",
            label_email: "Username or Email",
            placeholder_email: "Enter your username or email",
            label_password: "Password",
            placeholder_password: "Enter your password",
            remember_me: "Remember me",
            forgot_password: "Forgot password?",
            btn_signin: "Sign In",
            divider_text: "or continue with",
            footer_notice: "Official Platform • Ethiopian IT Park Corporation © 2026",
            reset_alert: "Password resets are managed by your system administrator."
        },
        am: {
            card_desc: "በድርጅት መለያዎ ይግቡ",
            label_email: "የተጠቃሚ ስም ወይም ኢሜይል",
            placeholder_email: "የተጠቃሚ ስም ወይም ኢሜይልዎን ያስገቡ",
            label_password: "የይለፍ ቃል",
            placeholder_password: "የይለፍ ቃልዎን ያስገቡ",
            remember_me: "አስታውሰኝ",
            forgot_password: "የይለፍ ቃል ረሱ?",
            btn_signin: "ግባ",
            divider_text: "ወይም በዚህ ይቀጥሉ",
            footer_notice: "ኦፊሴላዊ መድረክ • የኢትዮጵያ ኢንፎርሜሽን ቴክኖሎጂ ፓርክ © 2026",
            reset_alert: "የይለፍ ቃል ዳግም ማስጀመር የሚተዳደረው በሲስተም አስተዳዳሪዎ ነው።"
        }
    };

    let currentLang = localStorage.getItem('itpark_crm_lang') || 'en';

    function setLanguage(lang) {
        if (!i18n[lang]) lang = 'en';
        currentLang = lang;
        localStorage.setItem('itpark_crm_lang', lang);

        document.querySelectorAll('.itpark-lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (i18n[lang][key]) el.textContent = i18n[lang][key];
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (i18n[lang][key]) el.placeholder = i18n[lang][key];
        });

        window.currentI18n = i18n[lang];
    }

    document.querySelectorAll('.itpark-lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setLanguage(this.getAttribute('data-lang'));
        });
    });

    setLanguage(currentLang);

    // ----------------------------------------------------
    // 2. Theme Mode Management (System / Light / Dark)
    // ----------------------------------------------------
    let currentTheme = localStorage.getItem('itpark_crm_theme') || 'system';

    function applyTheme(theme) {
        currentTheme = theme;
        localStorage.setItem('itpark_crm_theme', theme);

        document.querySelectorAll('[data-theme-val]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-theme-val') === theme);
        });

        let effectiveTheme = theme;
        if (theme === 'system') {
            effectiveTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        document.documentElement.setAttribute('data-theme', effectiveTheme);
        document.body.setAttribute('data-theme', effectiveTheme);

        if (window.updateTerrainColors) {
            window.updateTerrainColors(effectiveTheme);
        }
    }

    document.querySelectorAll('[data-theme-val]').forEach(btn => {
        btn.addEventListener('click', function() {
            applyTheme(this.getAttribute('data-theme-val'));
        });
    });

    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (currentTheme === 'system') applyTheme('system');
        });
    }

    applyTheme(currentTheme);

    // ----------------------------------------------------
    // 3. Wide-Area Rolling Mountain Landscape Simulation
    // ----------------------------------------------------
    const canvas = document.getElementById('dotted-terrain-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
        dpr = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // SMU Reference Color Palettes:
    // Dark mode: Radiant golden-amber mountain peaks on warm amber valleys
    // Light mode: Warm terracotta & copper mountain contour ridges
    let baseColor = { r: 185, g: 105, b: 55 };
    let peakColor = { r: 235, g: 145, b: 75 };

    window.updateTerrainColors = function(effectiveTheme) {
        if (effectiveTheme === 'dark') {
            baseColor = { r: 215, g: 110, b: 15 };   // Deep golden amber valley
            peakColor = { r: 252, g: 195, b: 45 };   // Bright radiant gold mountain ridge
        } else {
            baseColor = { r: 180, g: 90, b: 45 };    // Warm terracotta valley
            peakColor = { r: 225, g: 130, b: 50 };   // Rich copper/amber ridge
        }
    };
    window.updateTerrainColors(document.documentElement.getAttribute('data-theme') || 'light');

    // High lateral & depth resolution for massive terrain coverage
    const COLS = 110;       // Wide horizontal resolution
    const ROWS = 60;        // Full depth resolution from foreground to horizon

    let time = 0;
    let mouseX = 0;
    let smoothMouseX = 0;

    window.addEventListener('mousemove', function(e) {
        mouseX = (e.clientX - width / 2) * 0.00015;
    });

    let lastTime = performance.now();

    function renderTerrain(now) {
        const delta = Math.min(32, now - lastTime);
        lastTime = now;

        // Smooth slow rolling progression
        time += delta * 0.00042;
        smoothMouseX += (mouseX - smoothMouseX) * 0.03;

        ctx.clearRect(0, 0, width, height);

        // Wide perspective calibration:
        // Start horizon at 28% from the top (behind upper card)
        // Spans down to 105% (past bottom edge of screen)
        const startHorizonY = height * 0.28;
        const totalDepthY = height * 0.74;
        const originX = width / 2;
        const spacingX = (width * 1.55) / COLS;

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        for (let iz = 0; iz < ROWS; iz++) {
            // Normalized depth: 0 at horizon (top), 1 at foreground (bottom)
            const depthRatio = iz / ROWS;
            const baseGroundY = depthRatio * totalDepthY;

            // Perspective factor: spreading wider in the foreground
            const perspectiveSpread = 0.75 + depthRatio * 1.15;

            // Fog factor: near horizon fades softly, foreground is vivid
            const fogFactor = Math.sin(depthRatio * Math.PI * 0.5);

            for (let ix = 0; ix < COLS; ix++) {
                const x = (ix - COLS / 2) * spacingX;

                // Multiple overlapping mountain and valley harmonics
                // Primary rolling mountain peaks across width
                const hill1 = Math.sin(ix * 0.082 + time) * 46;
                // Secondary transverse mountain ridge
                const hill2 = Math.cos(iz * 0.092 - time * 0.75) * 36;
                // Diagonal undulating landscape contour
                const hill3 = Math.sin((ix * 0.048 + iz * 0.065) + time * 0.5) * 26;
                // Micro topographic slope detail
                const micro = Math.cos(ix * 0.16 + time * 0.3) * 8;

                const elevation = (hill1 + hill2 + hill3 + micro);

                // Perspective coordinates
                const px = originX + (x * perspectiveSpread) + (smoothMouseX * iz * 0.45);
                const py = startHorizonY + baseGroundY + (elevation * (0.35 + depthRatio * 0.75));

                // Dot sizing: small dots on distant mountain ridges, larger dots in foreground
                const dotSize = Math.max(0.9, 1.1 + depthRatio * 1.8);

                // Color gradient from valley to mountain ridge
                const ridgeFactor = Math.max(0, Math.min(1, (elevation + 40) / 80));
                const r = Math.round(baseColor.r * (1 - ridgeFactor) + peakColor.r * ridgeFactor);
                const g = Math.round(baseColor.g * (1 - ridgeFactor) + peakColor.g * ridgeFactor);
                const b = Math.round(baseColor.b * (1 - ridgeFactor) + peakColor.b * ridgeFactor);

                // Alpha blending: soft fog near horizon, crisp in foreground
                const alpha = Math.min(
                    isDark ? 0.75 : 0.55,
                    Math.max(0.06, fogFactor * (0.35 + ridgeFactor * 0.55))
                );

                ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + alpha.toFixed(3) + ")";
                ctx.fillRect(px, py, dotSize, dotSize);
            }
        }

        requestAnimationFrame(renderTerrain);
    }

    requestAnimationFrame(renderTerrain);
})();
</script>

</body>
</html>
</#macro>
