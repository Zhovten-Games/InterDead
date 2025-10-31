// All in-code comments are in English per project guidelines.
(function () {
  const body = document.body;
  const gate = document.getElementById('gm-ageGate');
  const btnAdult = document.getElementById('gm-btnAdult');
  const btnDemo = document.getElementById('gm-btnDemo');
  const toast = document.getElementById('gm-toast');
  const timerEl = document.getElementById('gm-timer');
  const betaTimerEl = document.getElementById('gm-beta-timer');
  const ctaStart = document.getElementById('gm-ctaStart');
  const ctaDemo = document.getElementById('gm-ctaDemo');
  const noise = document.querySelector('.gm-noise');
  const header = document.querySelector('.gm-header');
  const headerActions = document.querySelector('[data-header-actions]');
  const headerLogo = document.querySelector('[data-header-logo]');
  const headerCtaStart = document.getElementById('gm-ctaStartHeader');
  const headerCtaDemo = document.getElementById('gm-ctaDemoHeader');
  const ctaAnchors = Array.from(document.querySelectorAll('[data-cta-anchor]'));
  const heroMedia = document.querySelector('[data-hero-media]');
  const CTA_URL = 'https://discord.gg/vAWYg3jFEp';
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  const ogUrlMeta = document.querySelector('meta[property="og:url"]');

  if (canonicalLink) {
    canonicalLink.setAttribute('href', window.location.href);
  }
  if (ogUrlMeta) {
    ogUrlMeta.setAttribute('content', window.location.href);
  }

  function getVisibleCtaAnchor() {
    for (const anchor of ctaAnchors) {
      if (anchor && anchor.offsetParent !== null) {
        return anchor;
      }
    }
    return null;
  }

  function updateHeaderActionsVisibility() {
    if (!headerActions || !header) return;
    const anchor = getVisibleCtaAnchor();
    if (!anchor) {
      headerActions.classList.remove('gm-header__actions--visible');
      return;
    }
    const rect = anchor.getBoundingClientRect();
    const headerBottom = header.offsetHeight;
    const shouldShow = rect.top <= headerBottom;
    headerActions.classList.toggle('gm-header__actions--visible', shouldShow);
  }

  function refreshHeaderActionsVisibility() {
    if (!headerActions || !header) return;
    requestAnimationFrame(updateHeaderActionsVisibility);
  }

  // Render selected mode and optionally trigger demo toast.
  function setMode(mode, opts = {}) {
    body.setAttribute('data-mode', mode);
    localStorage.setItem('gm_age_mode', mode);
    if (mode === 'demo' && opts.toast && toast) {
      toast.classList.add('gm-toast--show');
      setTimeout(() => toast.classList.remove('gm-toast--show'), 10_000);
    }
    if (gate) {
      gate.style.display = 'none';
    }
    refreshHeaderActionsVisibility();
  }

  // Restore previous mode or show the gate.
  const saved = localStorage.getItem('gm_age_mode');
  if (saved === 'adult' || saved === 'demo') {
    setMode(saved);
    if (gate) gate.style.display = 'none';
  } else if (gate) {
    gate.style.display = 'grid';
  }

  btnAdult?.addEventListener('click', () => setMode('adult'));
  btnDemo?.addEventListener('click', () => setMode('demo', { toast: true }));

  class HeaderLogoController {
    constructor({ logoElement, targetElement, visibleClass = 'gm-header__logo--visible' }) {
      this.logoElement = logoElement;
      this.targetElement = targetElement;
      this.visibleClass = visibleClass;
      this.observer = null;
      this.handleIntersection = this.handleIntersection.bind(this);
    }

    init() {
      if (!this.logoElement) {
        return;
      }
      if (!this.targetElement || typeof IntersectionObserver !== 'function') {
        this.updateVisibility(true);
        return;
      }
      this.updateVisibility(false);
      this.observer = new IntersectionObserver(this.handleIntersection, {
        threshold: 0.35,
      });
      this.observer.observe(this.targetElement);
    }

    handleIntersection(entries) {
      if (!Array.isArray(entries) || entries.length === 0) {
        return;
      }
      const entry = entries[entries.length - 1];
      this.updateVisibility(!entry.isIntersecting);
    }

    updateVisibility(shouldShow) {
      this.logoElement.classList.toggle(this.visibleClass, Boolean(shouldShow));
    }
  }

  const headerLogoController = new HeaderLogoController({
    logoElement: headerLogo,
    targetElement: heroMedia,
  });
  headerLogoController.init();

  // CTA feedbacks in English.
  function handleStartClick(event) {
    event?.preventDefault();
    window.open(CTA_URL, '_blank', 'noopener');
  }

  function handleDemoClick() {
    if (noise) {
      noise.style.animationDuration = '0.3s';
      setTimeout(() => (noise.style.animationDuration = '6s'), 700);
    }
    alert('Harmless beacon sent. The cat approves.');
  }

  [ctaStart, headerCtaStart].forEach((btn) => {
    if (btn) {
      btn.setAttribute('href', CTA_URL);
      btn.setAttribute('rel', 'noopener');
      btn.setAttribute('target', '_blank');
      btn.addEventListener('click', handleStartClick);
    }
  });
  [ctaDemo, headerCtaDemo].forEach((btn) => btn?.addEventListener('click', handleDemoClick));

  if (headerActions && header) {
    updateHeaderActionsVisibility();
    window.addEventListener('scroll', updateHeaderActionsVisibility, { passive: true });
    window.addEventListener('resize', updateHeaderActionsVisibility);
  }

  // Countdown to midnight (local time) for both timers if present.
  function updateTimer() {
    if (!timerEl && !betaTimerEl) return;
    const now = new Date();
    const end = new Date(now);
    end.setHours(24, 0, 0, 0);
    const ms = end.getTime() - now.getTime();
    const display = ms <= 0 ? ['00', '00', '00'] : [
      String(Math.floor(ms / 3_600_000)).padStart(2, '0'),
      String(Math.floor((ms % 3_600_000) / 60_000)).padStart(2, '0'),
      String(Math.floor((ms % 60_000) / 1000)).padStart(2, '0'),
    ];
    const formatted = display.join(':');
    if (timerEl) timerEl.textContent = formatted;
    if (betaTimerEl) betaTimerEl.textContent = formatted;
  }

  updateTimer();
  setInterval(updateTimer, 1000);

  // --- Slider logic (BEM selectors) ---
  const slider = document.querySelector('.gm-slider');
  const track = slider?.querySelector('.js-slider-track');
  const dotsEl = slider?.querySelector('.js-slider-dots');
  const prev = slider?.querySelector('.gm-slider__nav--prev');
  const next = slider?.querySelector('.gm-slider__nav--next');
  const scoreboard = slider?.querySelector('[data-scoreboard]');
  const scoreboardInner = slider?.querySelector('[data-scoreboard-inner]');
  const scoreboardValue = slider?.querySelector('[data-scoreboard-value]');
  let idx = 0;
  if (slider && track && dotsEl && prev && next) {
    const ordered = Array.from(track.children)
      .slice()
      .sort((a, b) => {
        const aVal = Number(a.dataset.mediums ?? a.dataset.index ?? 0);
        const bVal = Number(b.dataset.mediums ?? b.dataset.index ?? 0);
        return aVal - bVal;
      });
    ordered.forEach((slide) => track.appendChild(slide));
    const slides = Array.from(track.children);
    const mediumValues = slides.map((slide, i) => {
      const parsed = Number(slide.dataset.mediums);
      const value = Number.isNaN(parsed) ? i + 1 : parsed;
      slide.dataset.mediums = String(value);
      return value;
    });
    function setScoreboard(index, shouldAnimate) {
      if (!scoreboard || !scoreboardValue) return;
      const nextValue = mediumValues[index] ?? index + 1;
      scoreboardValue.textContent = `+${nextValue}`;
      if (shouldAnimate && scoreboardInner) {
        scoreboardInner.classList.remove('gm-slider__scoreboardInner--animate');
        void scoreboardInner.offsetWidth;
        scoreboardInner.classList.add('gm-slider__scoreboardInner--animate');
      }
    }
    slides.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'gm-slider__dot' + (i === 0 ? ' gm-slider__dot--active' : '');
      d.addEventListener('click', () => go(i));
      dotsEl.appendChild(d);
    });
    function go(targetIndex) {
      const prevIdx = idx;
      const rawTarget = targetIndex;
      idx = (targetIndex + slides.length) % slides.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dotsEl.querySelectorAll('.gm-slider__dot').forEach((el, n) => {
        el.classList.toggle('gm-slider__dot--active', n === idx);
      });
      const forwardStep = prevIdx + 1;
      const wrappedForward = prevIdx === slides.length - 1 && rawTarget >= slides.length;
      const isForward = rawTarget === forwardStep || wrappedForward;
      const shouldAnimate = isForward && rawTarget !== prevIdx;
      setScoreboard(idx, shouldAnimate);
    }
    prev.addEventListener('click', () => go(idx - 1));
    next.addEventListener('click', () => go(idx + 1));
    let x0 = null;
    track.addEventListener('pointerdown', (e) => (x0 = e.clientX));
    track.addEventListener('pointerup', (e) => {
      if (x0 == null) return;
      const dx = e.clientX - x0;
      if (Math.abs(dx) > 30) go(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    track.addEventListener('pointercancel', () => (x0 = null));
    track.addEventListener('pointerleave', () => (x0 = null));
    setScoreboard(idx, false);
  }

  // --- FAQ accordion (single-open) ---
  (function () {
    const root = document.querySelector('#faq');
    if (!root) return;
    root.addEventListener('click', (e) => {
      const q = e.target.closest('.gm-faq__q');
      if (!q) return;
      const item = q.closest('.gm-faq__item');
      const list = root.querySelector('.gm-faq__list');
      list
        .querySelectorAll('.gm-faq__item')
        .forEach((el) => {
          if (el !== item) el.classList.remove('gm-faq__item--active');
        });
      item.classList.toggle('gm-faq__item--active');
    });
  })();

})();

// --- Minimal i18n switcher ---
(function () {
  const LS_KEY = 'gm_lang';
  const DEFAULT_LANG = 'en';
  const langSelect = document.getElementById('gm-lang');

  class HtmlSanitizer {
    constructor(options = {}) {
      const defaultTags = ['A', 'BR', 'EM', 'STRONG', 'SPAN'];
      const defaultAttributes = {
        '*': ['class'],
        A: ['href', 'target', 'rel', 'title', 'class'],
        SPAN: ['title', 'class'],
      };
      const defaultSchemes = ['http', 'https', 'mailto', 'tel'];
      const defaultTargets = ['_blank', '_self', '_parent', '_top'];
      const defaultRelTokens = ['noopener', 'noreferrer', 'nofollow'];

      this.allowedTags = new Set(
        (options.allowedTags || defaultTags).map((tag) => String(tag).toUpperCase())
      );
      this.allowedAttributes = new Map();
      const attributeConfig = options.allowedAttributes || defaultAttributes;
      Object.entries(attributeConfig).forEach(([tag, attrs]) => {
        const key = tag === '*' ? '*' : String(tag).toUpperCase();
        this.allowedAttributes.set(
          key,
          new Set((attrs || []).map((attr) => String(attr).toLowerCase()))
        );
      });
      this.allowedSchemes = new Set(
        (options.allowedSchemes || defaultSchemes).map((scheme) => String(scheme).toLowerCase())
      );
      this.allowedTargets = new Set(
        (options.allowedTargets || defaultTargets).map((target) => String(target).toLowerCase())
      );
      this.allowedRelTokens = new Set(
        (options.allowedRelTokens || defaultRelTokens).map((token) => String(token).toLowerCase())
      );
    }

    sanitize(html) {
      if (typeof html !== 'string') {
        return '';
      }
      const template = document.createElement('template');
      template.innerHTML = html;
      const elements = [];
      const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT);
      while (walker.nextNode()) {
        elements.push(walker.currentNode);
      }
      elements.forEach((node) => {
        const tagName = node.tagName;
        if (!this.allowedTags.has(tagName)) {
          node.replaceWith(document.createTextNode(node.textContent || ''));
          return;
        }
        const allowedAttrs = this.getAllowedAttributes(tagName);
        Array.from(node.attributes).forEach((attr) => {
          const name = attr.name.toLowerCase();
          if (!allowedAttrs.has(name)) {
            node.removeAttribute(attr.name);
            return;
          }
          if (name === 'href' && !this.isSafeUrl(attr.value)) {
            node.removeAttribute(attr.name);
            return;
          }
          if (name === 'target' && !this.isAllowedTarget(attr.value)) {
            node.removeAttribute(attr.name);
            return;
          }
          if (name === 'rel') {
            const normalized = this.normalizeRelTokens(attr.value);
            if (normalized) {
              node.setAttribute(attr.name, normalized);
            } else {
              node.removeAttribute(attr.name);
            }
          }
        });
        if (
          node.tagName === 'A' &&
          node.getAttribute('target') === '_blank' &&
          !node.hasAttribute('rel')
        ) {
          node.setAttribute('rel', 'noopener');
        }
      });
      return template.innerHTML;
    }

    getAllowedAttributes(tagName) {
      const attrs = new Set();
      const globalAttrs = this.allowedAttributes.get('*');
      const specificAttrs = this.allowedAttributes.get(tagName);
      if (globalAttrs) {
        globalAttrs.forEach((attr) => attrs.add(attr));
      }
      if (specificAttrs) {
        specificAttrs.forEach((attr) => attrs.add(attr));
      }
      return attrs;
    }

    isSafeUrl(value) {
      if (typeof value !== 'string') {
        return false;
      }
      const trimmed = value.trim();
      if (!trimmed) {
        return false;
      }
      if (trimmed.startsWith('#') || trimmed.startsWith('/')) {
        return true;
      }
      try {
        const url = new URL(trimmed, document.baseURI);
        const protocol = url.protocol.replace(':', '').toLowerCase();
        return this.allowedSchemes.has(protocol);
      } catch (error) {
        return false;
      }
    }

    isAllowedTarget(value) {
      if (typeof value !== 'string') {
        return false;
      }
      return this.allowedTargets.has(value.toLowerCase());
    }

    normalizeRelTokens(value) {
      if (typeof value !== 'string') {
        return '';
      }
      const tokens = value
        .split(/\s+/)
        .map((token) => token.trim().toLowerCase())
        .filter((token) => token && this.allowedRelTokens.has(token));
      if (tokens.length === 0) {
        return '';
      }
      const unique = Array.from(new Set(tokens));
      return unique.join(' ');
    }
  }

  const htmlSanitizer = new HtmlSanitizer();

  class LocaleRepository {
    constructor(initialLocales = {}, loaders = []) {
      this.cache = new Map();
      Object.entries(initialLocales).forEach(([lang, map]) => {
        if (map && typeof map === 'object') {
          this.cache.set(lang, map);
        }
      });
      this.loaders = Array.isArray(loaders) ? loaders.slice() : [];
      this.pending = new Map();
    }

    async load(lang) {
      if (this.cache.has(lang)) {
        return this.cache.get(lang);
      }
      if (!this.pending.has(lang)) {
        this.pending.set(
          lang,
          this.loadSequentially(lang)
            .finally(() => {
              this.pending.delete(lang);
            })
        );
      }
      return this.pending.get(lang);
    }

    async loadSequentially(lang) {
      for (const loader of this.loaders) {
        if (!loader || typeof loader.load !== 'function') {
          continue;
        }
        try {
          const data = await loader.load(lang);
          if (data && typeof data === 'object') {
            this.cache.set(lang, data);
            return data;
          }
        } catch (error) {
          console.error('[i18n] Failed to load locale:', lang, error);
        }
      }
      return null;
    }
  }

  class I18nManager {
    constructor(repository, options = {}) {
      this.repository = repository;
      this.defaultLang = options.defaultLang || DEFAULT_LANG;
      this.onApply = options.onApply || (() => {});
      this.currentLang = this.defaultLang;
    }

    applyTranslations(map) {
      document.querySelectorAll('[data-i18n-html]').forEach((el) => {
        const key = el.getAttribute('data-i18n-html');
        if (key && Object.prototype.hasOwnProperty.call(map, key)) {
          const sanitized = htmlSanitizer.sanitize(map[key]);
          el.innerHTML = sanitized;
        }
      });
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        if (el.hasAttribute('data-i18n-skip-text')) {
          return;
        }
        const key = el.getAttribute('data-i18n');
        if (key && Object.prototype.hasOwnProperty.call(map, key)) {
          el.textContent = map[key];
        }
      });
      document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
        const key = el.getAttribute('data-i18n-aria-label');
        if (key && Object.prototype.hasOwnProperty.call(map, key)) {
          el.setAttribute('aria-label', map[key]);
        }
      });
      document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
        const attr = el.getAttribute('data-i18n-attr');
        const key = el.getAttribute('data-i18n');
        if (attr && key && Object.prototype.hasOwnProperty.call(map, key)) {
          el.setAttribute(attr, map[key]);
        }
      });
    }

    async use(lang) {
      const locale = await this.repository.load(lang);
      if (locale) {
        this.applyTranslations(locale);
        this.currentLang = lang;
        this.onApply(lang);
        return;
      }
      if (lang !== this.defaultLang) {
        const fallback = await this.repository.load(this.defaultLang);
        if (fallback) {
          this.applyTranslations(fallback);
          this.currentLang = this.defaultLang;
          this.onApply(this.defaultLang);
        }
      }
    }
  }

  function collectDefaultLocale() {
    const map = {};
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      if (key) {
        map[key] = htmlSanitizer.sanitize(el.innerHTML ?? '');
      }
    });
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      if (el.hasAttribute('data-i18n-skip-text')) {
        return;
      }
      const key = el.getAttribute('data-i18n');
      if (key) {
        map[key] = el.textContent ?? '';
      }
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria-label');
      if (key) {
        map[key] = el.getAttribute('aria-label') ?? '';
      }
    });
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      const attr = el.getAttribute('data-i18n-attr');
      const key = el.getAttribute('data-i18n');
      if (attr && key) {
        map[key] = el.getAttribute(attr) ?? '';
      }
    });
    return map;
  }

  class BaseLocaleLoader {
    async load() {
      throw new Error('BaseLocaleLoader.load must be implemented in a subclass.');
    }
  }

  class GlobalLocaleLoader extends BaseLocaleLoader {
    constructor(options = {}) {
      super();
      this.globalNamespace = options.globalNamespace || '__GM_LOCALES__';
    }

    async load(lang) {
      const store = window[this.globalNamespace];
      if (store && typeof store === 'object' && store[lang]) {
        return store[lang];
      }
      return null;
    }
  }

  class FetchLocaleLoader extends BaseLocaleLoader {
    constructor(options = {}) {
      super();
      this.basePath = options.basePath || 'locales';
      this.enabled = options.enabled || (() => window.location.protocol !== 'file:');
    }

    async load(lang) {
      if (!this.enabled()) {
        return null;
      }
      const response = await fetch(`${this.basePath}/${lang}.json`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Unexpected status ${response.status}`);
      }
      return response.json();
    }
  }

  class ScriptLocaleLoader extends BaseLocaleLoader {
    constructor(options = {}) {
      super();
      this.globalNamespace = options.globalNamespace || '__GM_LOCALES__';
      this.scriptFactory = options.scriptFactory || ((lang) => `locales/${lang}.js`);
      this.enabled = options.enabled || (() => window.location.protocol === 'file:');
      this.pending = new Map();
    }

    getStore() {
      const globalObj = window[this.globalNamespace];
      return globalObj && typeof globalObj === 'object' ? globalObj : null;
    }

    ensureStore() {
      if (!window[this.globalNamespace] || typeof window[this.globalNamespace] !== 'object') {
        window[this.globalNamespace] = {};
      }
      return window[this.globalNamespace];
    }

    async load(lang) {
      if (!this.enabled()) {
        return null;
      }
      const store = this.getStore();
      if (store && store[lang]) {
        return store[lang];
      }
      if (!this.pending.has(lang)) {
        const promise = new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.defer = true;
          script.src = this.scriptFactory(lang);
          script.addEventListener('load', () => {
            const map = this.getStore();
            resolve(map ? map[lang] ?? null : null);
          });
          script.addEventListener('error', (event) => {
            reject(new Error(`Failed to load script for locale ${lang}: ${event?.message || 'unknown error'}`));
          });
          this.ensureStore();
          document.head.appendChild(script);
        })
          .catch((error) => {
            console.error('[i18n] Failed to load locale via script:', lang, error);
            return null;
          })
          .finally(() => {
            this.pending.delete(lang);
          });
        this.pending.set(lang, promise);
      }
      return this.pending.get(lang);
    }
  }

  const repository = new LocaleRepository(
    { [DEFAULT_LANG]: collectDefaultLocale() },
    [
      new GlobalLocaleLoader(),
      new FetchLocaleLoader(),
      new ScriptLocaleLoader(),
    ]
  );
  const manager = new I18nManager(repository, {
    defaultLang: DEFAULT_LANG,
    onApply(lang) {
      document.documentElement.setAttribute('lang', lang);
      if (langSelect) {
        langSelect.value = lang;
      }
    },
  });

  function getInitialLang() {
    return localStorage.getItem(LS_KEY) || document.documentElement.getAttribute('lang') || DEFAULT_LANG;
  }

  async function initI18n() {
    await manager.use(getInitialLang());
    if (langSelect) {
      langSelect.addEventListener('change', async (e) => {
        const next = e.target.value;
        localStorage.setItem(LS_KEY, next);
        await manager.use(next);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n, { once: true });
  } else {
    initI18n();
  }
})();
