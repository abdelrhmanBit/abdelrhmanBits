const toggleMenu = document.getElementById("togglemenu");
const toggleBtn = document.getElementById("togglemenubtn");

// inject logo inside the mobile sidebar (once)
if (toggleMenu && !toggleMenu.querySelector('.menu-logo')) {
    const logoItem = document.createElement('li');
    logoItem.className = 'menu-logo';
    const logoImg = document.createElement('img');
    logoImg.src = 'assets/icons/logo.png';
    logoImg.alt = 'wesal logo';
    logoItem.appendChild(logoImg);
    toggleMenu.insertBefore(logoItem, toggleMenu.firstChild);
}

function alignMenuLogoToHeader() {
    if (!isMobileView() || !toggleMenu) return;
    const headerLogo = document.querySelector('header img');
    const menuLogoItem = toggleMenu.querySelector('.menu-logo');
    const menuLogoImg = menuLogoItem ? menuLogoItem.querySelector('img') : null;
    if (!headerLogo || !menuLogoItem || !menuLogoImg) return;

    const rect = headerLogo.getBoundingClientRect();
    const rightOffset = Math.max(0, window.innerWidth - rect.right);

    menuLogoItem.classList.add('fixed-align');
    Object.assign(menuLogoImg.style, {
        position: 'fixed',
        top: rect.top + 'px',
        right: rightOffset + 'px',
        height: rect.height + 'px',
        width: 'auto',
        zIndex: '1300',
        pointerEvents: 'none'
    });
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
        right: '',
        height: '',
        width: '',
        zIndex: '',
        pointerEvents: ''
    });
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
