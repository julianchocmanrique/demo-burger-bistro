(() => {
  'use strict';

  const menuToggle = document.querySelector('#menu-toggle');
  const mobileMenu = document.querySelector('#mobile-menu');

  const closeMenu = (restoreFocus = false) => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
    mobileMenu.hidden = true;
    document.body.classList.remove('menu-open');
    if (restoreFocus) menuToggle.focus();
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
      menuToggle.setAttribute('aria-expanded', String(willOpen));
      menuToggle.setAttribute('aria-label', willOpen ? 'Cerrar menú' : 'Abrir menú');
      mobileMenu.hidden = !willOpen;
      document.body.classList.toggle('menu-open', willOpen);
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => closeMenu());
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !mobileMenu.hidden) closeMenu(true);
    });
    const desktop = window.matchMedia('(min-width: 821px)');
    desktop.addEventListener('change', event => {
      if (event.matches) closeMenu();
    });
    closeMenu();
  }

  const filters = [...document.querySelectorAll('[data-filter]')];
  const dishes = [...document.querySelectorAll('.dish-card[data-category]')];
  const filterStatus = document.querySelector('#filter-status');

  filters.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.filter;
      filters.forEach(filter => {
        const selected = filter === button;
        filter.setAttribute('aria-pressed', String(selected));
        filter.classList.toggle('is-active', selected);
      });
      let visibleCount = 0;
      dishes.forEach(dish => {
        const visible = category === 'all' || dish.dataset.category === category;
        dish.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      if (filterStatus) {
        filterStatus.textContent = `${visibleCount} ${visibleCount === 1 ? 'sabor' : 'sabores'} en esta selección.`;
      }
    });
  });

  const form = document.querySelector('#order-form');
  if (form) {
    const fields = {
      nombre: form.elements.namedItem('nombre'),
      producto: form.elements.namedItem('producto'),
      cantidad: form.elements.namedItem('cantidad'),
      servicio: form.elements.namedItem('servicio'),
      mensaje: form.elements.namedItem('mensaje')
    };
    const productNames = {
      carta: 'Carta y disponibilidad',
      california: 'Hamburguesa California',
      houston: 'Hot dog Houston',
      papas: 'Papas montaña',
      chocolate: 'Malteada de chocolate'
    };
    const serviceNames = {
      domicilio: 'Domicilio',
      recoger: 'Para recoger',
      local: 'Consumo en el restaurante'
    };
    const preview = document.querySelector('#message-preview');
    const feedback = document.querySelector('#form-feedback');
    const submitButton = form.querySelector('[type="submit"]');

    const buildMessage = () => {
      const name = fields.nombre.value.trim();
      const product = fields.producto.value;
      const service = fields.servicio.value;
      const quantity = Number(fields.cantidad.value);
      const notes = fields.mensaje.value.trim();
      const lines = [
        `Hola, The Burger Bistro Sogamoso.${name ? ` Soy ${name}.` : ''}`,
        '',
        product === 'carta'
          ? 'Quisiera consultar la carta actual.'
          : `Me interesa: ${productNames[product] || 'Consultar la carta'}.`
      ];
      if (product !== 'carta' && Number.isInteger(quantity) && quantity >= 1 && quantity <= 20) {
        lines.push(`Cantidad: ${quantity}.`);
      }
      lines.push(`Servicio: ${serviceNames[service] || 'Por confirmar'}.`);
      if (notes) lines.push(`Notas: ${notes}`);
      lines.push('', '¿Me confirman la carta, los precios y la disponibilidad?');
      lines.push(service === 'domicilio'
        ? 'También quisiera confirmar la cobertura, el costo del domicilio y el tiempo estimado de entrega.'
        : '¿Cuál es el tiempo estimado de preparación?');
      lines.push('Gracias. Quedo pendiente de su confirmación.');
      return lines.join('\n');
    };

    const updatePreview = () => {
      if (preview) preview.textContent = buildMessage();
    };

    if (Object.values(fields).every(Boolean)) {
      const resetFeedback = () => {
        fields.nombre.setCustomValidity('');
        fields.cantidad.setCustomValidity('');
        fields.producto.setCustomValidity('');
        fields.servicio.setCustomValidity('');
        if (feedback) feedback.textContent = '';
        updatePreview();
      };

      form.addEventListener('input', resetFeedback);
      form.addEventListener('change', resetFeedback);

      document.querySelectorAll('[data-product]').forEach(link => {
        link.addEventListener('click', () => {
          const product = link.dataset.product;
          if (Object.prototype.hasOwnProperty.call(productNames, product)) {
            fields.producto.value = product;
            resetFeedback();
          }
        });
      });

      document.querySelectorAll('[data-service]').forEach(link => {
        link.addEventListener('click', () => {
          const service = link.dataset.service;
          if (Object.prototype.hasOwnProperty.call(serviceNames, service)) {
            fields.servicio.value = service;
            resetFeedback();
          }
        });
      });

      form.addEventListener('submit', event => {
        event.preventDefault();
        resetFeedback();
        const name = fields.nombre.value.trim();
        const quantity = Number(fields.cantidad.value);

        if (!name || name.length > 60) {
          fields.nombre.setCustomValidity('Escribe tu nombre, de hasta 60 caracteres.');
        }
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
          fields.cantidad.setCustomValidity('Elige una cantidad entera entre 1 y 20.');
        }
        if (!Object.prototype.hasOwnProperty.call(productNames, fields.producto.value)) {
          fields.producto.setCustomValidity('Selecciona una opción de la lista.');
        }
        if (!Object.prototype.hasOwnProperty.call(serviceNames, fields.servicio.value)) {
          fields.servicio.setCustomValidity('Selecciona cómo quieres disfrutar tu pedido.');
        }
        if (!form.reportValidity()) {
          if (feedback) feedback.textContent = 'Revisa los datos indicados para continuar.';
          return;
        }

        fields.nombre.value = name;
        updatePreview();
        if (feedback) {
          feedback.textContent = 'Se abrirá WhatsApp con tu consulta. Revisa el mensaje y envíalo allí; el restaurante confirmará disponibilidad y precio.';
        }
        window.location.href = `https://wa.me/573157868805?text=${encodeURIComponent(buildMessage())}`;
      });

      if (submitButton) submitButton.disabled = false;
      updatePreview();
    }
  }

  const privacyOpen = document.querySelector('#privacy-open');
  const privacyDialog = document.querySelector('#privacy-dialog');
  const privacyClose = document.querySelector('#privacy-close');
  if (privacyOpen && privacyDialog && privacyClose) {
    privacyOpen.addEventListener('click', () => privacyDialog.showModal());
    privacyClose.addEventListener('click', () => privacyDialog.close());
    privacyDialog.addEventListener('close', () => privacyOpen.focus());
  }

  const year = document.querySelector('#current-year');
  if (year) {
    year.textContent = new Intl.DateTimeFormat('es-CO', {
      year: 'numeric', timeZone: 'America/Bogota'
    }).format(new Date());
  }
})();
