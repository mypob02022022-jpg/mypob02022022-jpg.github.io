/* Все цветы для Энска — окно заказа букета
   Реальный способ связи: телефонный звонок с названием букета.
   Отправка форм не имитируется — backend у проекта отсутствует. */
(function () {
  'use strict';

  var modal = document.getElementById('order-modal');
  var bouquetEl = document.getElementById('order-modal-bouquet');
  var closeBtn = document.getElementById('order-modal-close');
  var lastTrigger = null;

  if (!modal || !bouquetEl || !closeBtn) return;

  function openModal(bouquetName, trigger) {
    bouquetEl.textContent = 'Вы выбрали букет ' + bouquetName + ' — от 1 500 ₽.';
    lastTrigger = trigger || null;
    modal.hidden = false;
    document.body.classList.add('order-modal-open');
    closeBtn.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('order-modal-open');
    if (lastTrigger) lastTrigger.focus();
  }

  /* Кнопки «Заказать букет» в карточках каталога */
  document.querySelectorAll('.order-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openModal(btn.getAttribute('data-bouquet') || '', btn);
    });
  });

  closeBtn.addEventListener('click', closeModal);

  /* клик по затемнению за пределами окна */
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  /* Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  /* простая фокус-ловушка: Tab внутри диалога */
  modal.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || modal.hidden) return;
    var focusable = modal.querySelectorAll('button, a[href]');
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();
