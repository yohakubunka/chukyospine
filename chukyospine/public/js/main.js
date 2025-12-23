// メニューボタンの処理
document.addEventListener('DOMContentLoaded', function () {
  const menuBtn = document.querySelector('.header_burger');
  const nav = document.querySelector('.header_nav');
  const overlay = document.querySelector('.header_overlay');
  const header = document.querySelector('.header');
  const mainvisual = document.querySelector('.mainvisual');
  const footer = document.querySelector('.footer');
  const scrollDown = document.querySelector('.scroll_down_wrap');

  const closeNav = () => {
    if (!header || !menuBtn) return;
    header.classList.remove('header--open');
    menuBtn.classList.remove('is-active');
    menuBtn.setAttribute('aria-expanded', 'false');
    if (overlay) overlay.classList.remove('is-active');
  };

  const openNav = () => {
    if (!header || !menuBtn) return;
    header.classList.add('header--open');
    menuBtn.classList.add('is-active');
    menuBtn.setAttribute('aria-expanded', 'true');
    if (overlay) overlay.classList.add('is-active');
  };

  if (menuBtn && nav && header) {
    menuBtn.addEventListener('click', function () {
      const isOpen = header.classList.contains('header--open');
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    if (overlay) {
      overlay.addEventListener('click', closeNav);
    }

    nav.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => closeNav());
    });
  }

  // スムーススクロール
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = targetElement.offsetTop - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // メインビジュアルを過ぎたらヘッダーに背景を付与
  const updateHeaderBg = () => {
    if (!header) return;
    const headerHeight = header.offsetHeight || 0;
    const mainHeight = mainvisual ? mainvisual.offsetHeight : 0;
    const triggerPoint = Math.max(0, mainHeight - headerHeight);
    if (window.scrollY > triggerPoint) {
      header.classList.add('header--solid');
    } else {
      header.classList.remove('header--solid');
    }
  };

  updateHeaderBg();
  window.addEventListener('scroll', updateHeaderBg, { passive: true });
  window.addEventListener('resize', updateHeaderBg);

  const updateScrollDown = () => {
    if (!scrollDown || !footer) return;
    const footerTop = footer.getBoundingClientRect().top + window.scrollY;
    const viewportBottom = window.scrollY + window.innerHeight;
    if (viewportBottom >= footerTop) {
      scrollDown.classList.add('is-hidden');
    } else {
      scrollDown.classList.remove('is-hidden');
    }
  };

  updateScrollDown();
  window.addEventListener('scroll', updateScrollDown, { passive: true });
  window.addEventListener('resize', updateScrollDown);

  // ページ読み込み時のアニメーション
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  });

  const animateElements = document.querySelectorAll('.service-card');
  animateElements.forEach(el => observer.observe(el));
});