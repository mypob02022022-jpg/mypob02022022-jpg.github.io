/* Все цветы для Энска — премиальные анимации
   Дополняет scripts/script.js, ничего в нём не меняя. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Каскад появления карточек букетов ----------
     Задержки только до первого появления: после неё снимаем,
     чтобы hover-эффекты фотографий оставались мгновенными. */
  var catalogCards = document.querySelectorAll('.catalog-grid .card.reveal');
  if (catalogCards.length && !reduceMotion) {
    catalogCards.forEach(function (card, i) {
      card.style.transitionDelay = (i * 90) + 'ms';
    });

    var delaysCleared = false;
    var clearDelays = function () {
      if (delaysCleared) return;
      delaysCleared = true;
      catalogCards.forEach(function (card) {
        card.style.transitionDelay = '';
      });
    };

    var last = catalogCards[catalogCards.length - 1];
    if ('TransitionEvent' in window) {
      last.addEventListener('transitionend', function handler(e) {
        if (e.propertyName !== 'transform' || !last.classList.contains('visible')) return;
        last.removeEventListener('transitionend', handler);
        clearDelays();
      });
    }
    /* страховка, если переход по какой-то причине не наступил */
    setTimeout(clearDelays, 3000);
  }

  /* ---------- Каскад появления фото свадебной секции ---------- */
  var pairImgs = document.querySelectorAll('.photo-pair img.reveal');
  if (pairImgs.length && !reduceMotion) {
    pairImgs.forEach(function (img, i) {
      img.style.transitionDelay = (i * 160) + 'ms';
    });
    var clearedPair = false;
    var clearPair = function () {
      if (clearedPair) return;
      clearedPair = true;
      pairImgs.forEach(function (img) {
        img.style.transitionDelay = '';
      });
    };
    var lastPair = pairImgs[pairImgs.length - 1];
    if ('TransitionEvent' in window) {
      lastPair.addEventListener('transitionend', function handler(e) {
        if (e.propertyName !== 'transform' || !lastPair.classList.contains('visible')) return;
        lastPair.removeEventListener('transitionend', handler);
        clearPair();
      });
    }
    setTimeout(clearPair, 3000);
  }

  /* ---------- Управление фотолентой: кнопка «Пауза» ---------- */
  var marquee = document.querySelector('.marquee');
  var toggleBtn = document.getElementById('marquee-toggle');
  if (marquee && toggleBtn) {
    if (reduceMotion) {
      /* при отключённых анимациях лента статична — кнопка не нужна */
      marquee.classList.add('is-paused');
      toggleBtn.hidden = true;
    } else {
      toggleBtn.addEventListener('click', function () {
        var paused = marquee.classList.toggle('is-paused');
        toggleBtn.setAttribute('aria-pressed', String(paused));
        toggleBtn.textContent = paused ? 'Продолжить' : 'Пауза';
      });
    }
  }
})();
