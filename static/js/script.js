const toggleMenu = document.getElementById("togglemenu");
const toggleBtn = document.getElementById("togglemenubtn");

// The sidebar logo is provided by the server-rendered template (li.menu-logo).
// We do not inject a relative-path image here to avoid wrong src resolution.

// create a body-level overlay logo that we can position independently
let overlayLogo = document.getElementById('menu-logo-overlay');
if (!overlayLogo) {
    overlayLogo = document.createElement('img');
    overlayLogo.id = 'menu-logo-overlay';
    overlayLogo.alt = 'wesal logo';
    overlayLogo.style.position = 'fixed';
    overlayLogo.style.display = 'none';
    overlayLogo.style.pointerEvents = 'none';
    overlayLogo.style.zIndex = '2100';
    document.body.appendChild(overlayLogo);
}

function alignMenuLogoToHeader() {
    if (!isMobileView() || !toggleMenu) return;
    const headerLogo = document.querySelector('header img');
    const menuLogoItem = toggleMenu.querySelector('.menu-logo');
    const menuLogoImg = menuLogoItem ? menuLogoItem.querySelector('img') : null;
    if (!headerLogo || !menuLogoItem || !menuLogoImg) return;

    const rect = headerLogo.getBoundingClientRect();
    // compute header logo center and center the sidebar logo on that X coordinate
    const centerX = rect.left + rect.width / 2;

    menuLogoItem.classList.add('fixed-align');
    Object.assign(menuLogoImg.style, {
        position: 'fixed',
        top: rect.top + 'px',
        left: centerX + 'px',
        transform: 'translateX(-50%)',
        height: rect.height + 'px',
        width: 'auto',
        zIndex: '2100', // ensure it's above the header
        pointerEvents: 'none'
    });

    // resolve header logo src to an absolute URL (handles relative src when viewing file://)
    let headerSrc = headerLogo.getAttribute && headerLogo.getAttribute('src') ? headerLogo.getAttribute('src') : headerLogo.src;
    let resolvedSrc;
    try {
        resolvedSrc = headerSrc ? new URL(headerSrc, window.location.href).href : (menuLogoImg.src || '');
    } catch (e) {
        resolvedSrc = headerLogo.src || menuLogoImg.src || '';
    }

    overlayLogo.alt = headerLogo.alt || menuLogoImg.alt || overlayLogo.alt;
    overlayLogo.style.top = rect.top + 'px';
    overlayLogo.style.left = centerX + 'px';
    overlayLogo.style.transform = 'translateX(-50%)';
    overlayLogo.style.height = rect.height + 'px';
    overlayLogo.style.width = 'auto';

    // only show overlay and hide sidebar image if the overlay actually loads
    overlayLogo.onload = function() {
        overlayLogo.style.display = 'block';
        // hide the menu image inside the sidebar to avoid duplicate visuals using CSS class
        try { menuLogoImg.classList.add('hidden'); } catch (e) {}
    };
    overlayLogo.onerror = function() {
        // failed to load overlay — keep sidebar image visible and hide overlay
        overlayLogo.style.display = 'none';
        overlayLogo.onload = null;
        overlayLogo.onerror = null;
        try { menuLogoImg.classList.remove('hidden'); } catch (e) {}
    };

    // set src last to trigger load handlers
    overlayLogo.src = resolvedSrc;
}

function resetMenuLogoAlignment() {
    if (!toggleMenu) return;
    const menuLogoItem = toggleMenu.querySelector('.menu-logo');
    const menuLogoImg = menuLogoItem ? menuLogoItem.querySelector('img') : null;
    if (!menuLogoItem || !menuLogoImg) return;
    menuLogoItem.classList.remove('fixed-align');
    Object.assign(menuLogoImg.style, {
        position: '',
        top: '',
        left: '',
        right: '',
        transform: '',
        height: '',
        width: '',
        zIndex: '',
        pointerEvents: ''
    });

    // hide overlay and restore sidebar image visibility
    if (overlayLogo) {
        overlayLogo.style.display = 'none';
        overlayLogo.style.top = '';
        overlayLogo.style.left = '';
        overlayLogo.style.transform = '';
        overlayLogo.style.height = '';
        overlayLogo.style.width = '';
    }
    if (menuLogoImg) {
        try { menuLogoImg.classList.remove('hidden'); } catch (e) {}
    }
}

// ensure overlay exists once
let menuOverlay = document.getElementById('menu-overlay');
if (!menuOverlay) {
    menuOverlay = document.createElement('div');
    menuOverlay.id = 'menu-overlay';
    menuOverlay.className = 'menu-overlay';
    document.body.appendChild(menuOverlay);
}

function isMobileView() {
    return window.innerWidth < 992;
}

function openMenu() {
    if (!toggleMenu) return;
    toggleMenu.classList.add('open');
    if (isMobileView()) {
        document.body.classList.add('no-scroll');
        menuOverlay.classList.add('show');
        alignMenuLogoToHeader();
    } else {
        // desktop: no overlay, keep scroll enabled
        document.body.classList.remove('no-scroll');
        menuOverlay.classList.remove('show');
    }
}

function closeMenu() {
    if (!toggleMenu) return;
    toggleMenu.classList.remove('open');
    document.body.classList.remove('no-scroll');
    menuOverlay.classList.remove('show');
    resetMenuLogoAlignment();
}

function toggleMenuState() {
    if (toggleMenu.classList.contains('open')) {
        closeMenu();
    } else {
        openMenu();
    }
}

if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleMenuState);
}

// close on overlay click (mobile only)
menuOverlay.addEventListener('click', function() {
    if (isMobileView()) closeMenu();
});

// close when clicking a link inside menu
if (toggleMenu) {
    toggleMenu.addEventListener('click', function(e) {
        const target = e.target;
        if (target && target.tagName === 'A') {
            closeMenu();
        }
    });
}

// close on ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeMenu();
    }
});

// click outside on desktop closes the dropdown
document.addEventListener('click', function(e) {
    if (!toggleMenu || !toggleBtn) return;
    if (!isMobileView() && toggleMenu.classList.contains('open')) {
        const clickInsideMenu = toggleMenu.contains(e.target);
        const clickOnButton = toggleBtn.contains(e.target);
        if (!clickInsideMenu && !clickOnButton) {
            closeMenu();
        }
    }
});

// handle resize: sync overlay and scroll lock when switching breakpoints
window.addEventListener('resize', function() {
    if (isMobileView()) {
        if (toggleMenu.classList.contains('open')) {
            document.body.classList.add('no-scroll');
            menuOverlay.classList.add('show');
            alignMenuLogoToHeader();
        }
    } else {
        // desktop
        menuOverlay.classList.remove('show');
        document.body.classList.remove('no-scroll');
        resetMenuLogoAlignment();
    }
});

// keep alignment while scrolling when menu is open (mobile only)
window.addEventListener('scroll', function() {
    if (isMobileView() && toggleMenu && toggleMenu.classList.contains('open')) {
        alignMenuLogoToHeader();
    }
});

// ensure initial state is closed on load
document.addEventListener('DOMContentLoaded', function() {
    closeMenu();
});
