(function () {
  function include(id, url) {
    var el = document.getElementById(id);
    if (!el) return;
    fetch(url)
      .then(function (res) { return res.text(); })
      .then(function (html) { el.innerHTML = html; })
      .catch(function (err) { console.error('Failed to load ' + url, err); });
  }
  include('site-nav', '/components/nav.html');
  include('site-footer', '/components/footer.html');
})();

(function () {
  // Scroll-reveal: fades/slides sections and grid items into view as they're scrolled to.
  // Pure progressive enhancement - if JS never runs, content is simply visible (no .reveal class added).
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var targets = document.querySelectorAll(
      'section, .hero-wrap, [class$="-grid"] > *, [class$="-row"], .process-steps > *'
    );
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      // No observer support: skip the effect entirely rather than risk stuck-invisible content.
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    var staggerCounts = {};
    var nextGroupId = 0;
    targets.forEach(function (el) {
      el.classList.add('reveal');
      var parent = el.parentElement;
      var isGroupItem = parent && (parent.matches('[class$="-grid"]') || parent.classList.contains('process-steps'));
      if (isGroupItem) {
        if (!parent.dataset.revealGroup) {
          parent.dataset.revealGroup = 'g' + (nextGroupId++);
        }
        var key = parent.dataset.revealGroup;
        var count = staggerCounts[key] || 0;
        el.style.transitionDelay = (Math.min(count, 6) * 70) + 'ms';
        staggerCounts[key] = count + 1;
      }
      observer.observe(el);
    });
  });
})();
