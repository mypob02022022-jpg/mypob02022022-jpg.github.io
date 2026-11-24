/* Все цветы для Энска — интерактивная часть */
(function () {
  'use strict';

  /* ---------- Мобильное меню ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Год в подвале ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Появление блоков при прокрутке ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); }); setTimeout(function () { revealEls.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add("visible"); }); }, 1200);
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- SVG-карта Энска ---------- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  var streetsG = document.getElementById('streets');
  var boulevardsG = document.getElementById('boulevards');
  var shopMarker = document.getElementById('shop-marker');
  if (!streetsG || !boulevardsG || !shopMarker) return;

  // Бульварные: 4 поперечные улицы
  var boulevards = [
    { x: 150, label: '1-я Бульварная' },
    { x: 385, label: '2-я Бульварная' },
    { x: 620, label: '3-я Бульварная' },
    { x: 855, label: '4-я Бульварная' }
  ];
  // Параллельные улицы: 3 улицы × 4 квартала [домов в квартале]
  var streets = [
    { name: 'ул. Ленина',   y: 230, blocks: [7, 8, 7, 8], shop: 13 },
    { name: 'ул. Маркса',   y: 365, blocks: [7, 8, 7, 8], shop: null },
    { name: 'ул. Энгельса', y: 500, blocks: [7, 8, 7, 8], shop: null }
  ];

  function el(tag, attrs, parent) {
    var node = document.createElementNS(SVGNS, tag);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  // Границы кварталов между бульварами/краями карты
  var margins = [14, 163, 398, 633, 868, 986];
  var blockRanges = [];
  for (var b = 0; b < 4; b++) blockRanges.push([margins[b] + 10, margins[b + 1] - 10]);

  // Бульварные — полосы и подписи
  boulevards.forEach(function (bl) {
    el('rect', { x: bl.x - 13, y: 150, width: 26, height: 440, class: 'boulevard-band' }, boulevardsG);
    var t = el('text', { x: bl.x, y: 590, class: 'boulevard-name' }, boulevardsG);
    t.textContent = bl.label;
  });

  var shopPos = null;

  streets.forEach(function (st) {
    // Дорога
    el('rect', { x: 0, y: st.y - 15, width: 1000, height: 30, fill: '#E7DFCE' }, streetsG);
    // Название — над дорогой
    var name = el('text', { x: 28, y: st.y - 24, class: 'street-name' }, streetsG);
    name.textContent = st.name;

    // Дома: 4 квартала, сквозная нумерация 1..30
    var houseNo = 0;
    st.blocks.forEach(function (count, bi) {
      var range = blockRanges[bi];
      for (var i = 0; i < count; i++) {
        houseNo++;
        var hx = range[0] + (range[1] - range[0]) * (count === 1 ? 0 : i / (count - 1));
        var g = el('g', { class: 'house', tabindex: '0' }, streetsG);
        el('title', {}, g).textContent = st.name + ', ' + houseNo;
        el('rect', { x: hx - 13, y: st.y + 22, width: 26, height: 20, rx: 3 }, g);
        var num = el('text', { x: hx, y: st.y + 36 }, g);
        num.textContent = houseNo;
        if (st.shop === houseNo) {
          shopPos = { x: hx, y: st.y + 32 };
          g.setAttribute('class', 'house shop-house');
          g.setAttribute('aria-label', 'ул. Ленина, 13 — магазин «Все цветы для Энска»');
        }
      }
    });
  });

  // Магазин: ул. Ленина, 13
  var mapCard = document.getElementById('map-card');
  var mapCardClose = document.getElementById('map-card-close');
  var mapSvg = document.getElementById('ensc-map');
  var zoomInBtn = document.getElementById('zoom-in');
  var zoomOutBtn = document.getElementById('zoom-out');
  var zoomed = false;
  var ZOOM_K = 2.2; // кратность приближения к дому 13

  function openMapCard() {
    if (!mapCard) return;
    mapCard.hidden = false;
    var hint = document.getElementById('map-hint');
    if (hint) hint.hidden = false;
    shopMarker.classList.add('highlight');
  }
  function closeMapCard() {
    if (!mapCard) return;
    mapCard.hidden = true;
    if (mapCardClose) mapCardClose.focus();
  }
  if (mapCardClose) {
    mapCardClose.addEventListener('click', closeMapCard);
  }
  // ESC закрывает карточку
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mapCard && !mapCard.hidden) closeMapCard();
  });

  // Масштабирование: transform-origin на доме 13, переход в CSS
  function setZoom(on) {
    if (!mapSvg || !shopPos) return;
    zoomed = on;
    var ox = (shopPos.x / 1000 * 100).toFixed(2) + '%';
    var oy = (shopPos.y / 660 * 100).toFixed(2) + '%';
    mapSvg.style.transformOrigin = ox + ' ' + oy;
    mapSvg.style.transform = on ? 'scale(' + ZOOM_K + ')' : '';
    if (zoomInBtn) zoomInBtn.disabled = on;
    if (zoomOutBtn) zoomOutBtn.disabled = !on;
  }
  if (zoomInBtn) zoomInBtn.addEventListener('click', function () { setZoom(true); openMapCard(); });
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', function () { setZoom(false); });

  // Дом 13 и маркер магазина: клик и клавиатура открывают карточку
  var shopHouse = streetsG ? streetsG.querySelector('.shop-house') : null;
  function bindOpen(node) {
    if (!node) return;
    node.addEventListener('click', function () { openMapCard(); });
    node.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMapCard(); }
    });
  }
  bindOpen(shopHouse);
  bindOpen(shopMarker);

  if (shopPos) {
    shopMarker.setAttribute('transform', 'translate(' + shopPos.x + ',' + (shopPos.y - 8) + ')');
  }

  /* ---------- «Как добраться»: подсветка, приближение, карточка ---------- */
  var howBtn = document.getElementById('how-to-get');
  if (howBtn) {
    howBtn.addEventListener('click', function () {
      document.getElementById('contacts').scrollIntoView({ behavior: 'smooth' });
      openMapCard();
      setZoom(true);
    });
  }
})();
