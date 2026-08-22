document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      button.classList.add('is-clicked');
      setTimeout(() => button.classList.remove('is-clicked'), 180);
    });
  });

  function initCarousel() {
    const carousel = document.querySelector('.modal-carousel');
    const dots = document.querySelectorAll('.carousel-dot');
    const arrowLeft = document.querySelector('.carousel-arrow-left');
    const arrowRight = document.querySelector('.carousel-arrow-right');
    let currentIndex = 0;

    function updateIndicators() {
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });
    }

    function scrollToSlide(index) {
      if (!carousel || dots.length === 0) return;
      currentIndex = Math.max(0, Math.min(index, dots.length - 1));
      const slideWidth = carousel.clientWidth;
      carousel.scrollLeft = slideWidth * currentIndex;
      updateIndicators();
    }

    if (carousel) {
      carousel.addEventListener('scroll', () => {
        const slideWidth = carousel.clientWidth;
        const newIndex = Math.round(carousel.scrollLeft / slideWidth);
        if (newIndex !== currentIndex) {
          currentIndex = newIndex;
          updateIndicators();
        }
      });
    }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        scrollToSlide(index);
      });
    });

    arrowLeft?.addEventListener('click', () => {
      scrollToSlide(currentIndex - 1);
    });

    arrowRight?.addEventListener('click', () => {
      scrollToSlide(currentIndex + 1);
    });

    document.addEventListener('keydown', (event) => {
      const modal = document.getElementById('productModal');
      if (!modal || !modal.classList.contains('open')) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollToSlide(currentIndex - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollToSlide(currentIndex + 1);
      }
    });
  }

  initCarousel();

  const modal = document.getElementById('productModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const modalPrice = document.getElementById('modalPrice');
  const modalSpecs = document.getElementById('modalSpecs');
  const modalRank = document.getElementById('modalRank');
  const closeButton = document.querySelector('.modal-close');
  const closeBackdrop = document.querySelector('[data-close="true"]');
  const productCards = document.querySelectorAll('.product-card');

  function openModal(card) {
    if (!modal || !card) return;

    const { name, price, specs, description, carouselImages } = card.dataset;

    modalTitle.textContent = name || 'Laptop';
    modalPrice.textContent = price || '$0';
    modalDescription.textContent = description || 'Premium laptop designed for professionals and creators.';

    const rank = card.querySelector('.product-number')?.textContent?.trim();
    if (modalRank) {
      modalRank.textContent = rank || '1';
    }

    const specList = specs ? specs.split('|') : [];
    modalSpecs.innerHTML = specList.map((item) => `<li>${item}</li>`).join('');

    if (carouselImages) {
      const imageUrls = carouselImages.split(',').map((url) => url.trim());
      const carouselSlides = document.querySelectorAll('.carousel-slide img');

      carouselSlides.forEach((slide, index) => {
        if (imageUrls[index]) {
          slide.src = imageUrls[index];
          slide.alt = `${name || 'Laptop'} preview ${index + 1}`;
        }
      });

      const carousel = document.querySelector('.modal-carousel');
      if (carousel) {
        requestAnimationFrame(() => {
          carousel.scrollLeft = 0;
        });
      }

      const dots = document.querySelectorAll('.carousel-dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === 0);
      });
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  let isCheckoutOpen = false;

  function closeModal() {
    if (!modal || isCheckoutOpen) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  productCards.forEach((card) => {
    card.addEventListener('click', (event) => {
      const commanderBtn = event.target.closest('.btn-commander');
      if (commanderBtn) {
        event.stopPropagation();
        event.preventDefault();

        const name = card.dataset.name || 'Laptop';
        const priceText = card.dataset.price || '0';
        const price = parsePrice(priceText);
        const image = card.dataset.image || '';
        const id = toProductSlug(name);
        const specs = card.dataset.specs || '';
        const description = card.dataset.description || '';

        openCheckout({ name, price, image, id, specs, description });
        return;
      }

      const detailsBtn = event.target.closest('.btn-details');
      if (detailsBtn) {
        event.stopPropagation();
        event.preventDefault();
        openModal(card);
        return;
      }

      openModal(card);
    });
  });

  closeButton?.addEventListener('click', closeModal);
  closeBackdrop?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (event) => {
    if (isCheckoutOpen) return;
    if (event.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });

  const searchBox = document.querySelector('.search-box');
  const productShowcase = document.querySelector('.product-showcase');
  const filterChips = document.querySelectorAll('.filter-chip');
  const productCountEl = document.getElementById('productCount');

  let activeCategoryFilter = 'all';

  function filterProducts() {
    if (!productShowcase) return;
    const searchTerm = searchBox ? searchBox.value.toLowerCase().trim() : '';
    const allCards = productShowcase.querySelectorAll('.product-card');
    let visibleCount = 0;

    allCards.forEach((card) => {
      const name = card.dataset.name?.toLowerCase() || '';
      const description = card.dataset.description?.toLowerCase() || '';
      const specs = card.dataset.specs?.toLowerCase() || '';
      const category = card.dataset.category?.toLowerCase() || '';

      const matchesSearch = searchTerm === '' || name.includes(searchTerm) || description.includes(searchTerm) || specs.includes(searchTerm);
      const matchesCategory = activeCategoryFilter === 'all' || category.includes(activeCategoryFilter);

      if (matchesSearch && matchesCategory) {
        card.style.display = 'flex';
        visibleCount += 1;
      } else {
        card.style.display = 'none';
      }
    });

    if (productCountEl) {
      productCountEl.textContent = visibleCount;
    }
  }

  if (searchBox) {
    searchBox.addEventListener('input', filterProducts);
  }

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategoryFilter = chip.dataset.filter || 'all';
      filterProducts();
    });
  });

  // Initialiser le compteur de produits
  filterProducts();

  const canvas = document.getElementById('heroCanvas');
  const heroSection = document.querySelector('.hero-section');

  if (canvas && heroSection) {
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
      canvas.width = heroSection.offsetWidth;
      canvas.height = heroSection.offsetHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = [];
    const floatingShapes = [];
    let time = 0;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 1;
        this.speedY = (Math.random() - 0.5) * 1;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.maxOpacity = this.opacity;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < -50) this.x = canvas.width + 50;
        if (this.x > canvas.width + 50) this.x = -50;
        if (this.y < -50) this.y = canvas.height + 50;
        if (this.y > canvas.height + 50) this.y = -50;

        this.speedY += Math.sin(time * 0.01 + this.x) * 0.02;
      }

      draw() {
        ctx.fillStyle = `rgba(124, 200, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(77, 184, 255, ${this.opacity * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    class FloatingShape {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 80 + 40;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.01;
        this.type = Math.floor(Math.random() * 3);
        this.opacity = 0.08;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.x < -200) this.x = canvas.width + 200;
        if (this.x > canvas.width + 200) this.x = -200;
        if (this.y < -200) this.y = canvas.height + 200;
        if (this.y > canvas.height + 200) this.y = -200;

        this.speedY += Math.sin(time * 0.005) * 0.001;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.strokeStyle = `rgba(124, 200, 255, ${this.opacity})`;
        ctx.lineWidth = 2;

        if (this.type === 0) {
          ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else if (this.type === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = Math.cos(angle) * (this.size / 2);
            const y = Math.sin(angle) * (this.size / 2);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    for (let i = 0; i < 80; i++) {
      particles.push(new Particle());
    }

    for (let i = 0; i < 4; i++) {
      floatingShapes.push(new FloatingShape());
    }

    function drawGradientMesh() {
      const meshSize = 200;
      const offsetX = Math.sin(time * 0.0005) * 20;
      const offsetY = Math.cos(time * 0.0005) * 20;

      for (let x = 0; x < canvas.width; x += meshSize) {
        for (let y = 0; y < canvas.height; y += meshSize) {
          const gradient = ctx.createLinearGradient(x + offsetX, y + offsetY, x + meshSize + offsetX, y + meshSize + offsetY);
          gradient.addColorStop(0, `rgba(31, 53, 90, ${0.02 + Math.sin(time * 0.001 + x + y) * 0.01})`);
          gradient.addColorStop(1, `rgba(124, 200, 255, ${0.01 + Math.cos(time * 0.001 + x + y) * 0.005})`);
          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, meshSize, meshSize);
        }
      }
    }

    function drawGlow() {
      const mouseX = canvas.width / 2;
      const mouseY = canvas.height / 2;
      const glowRadius = 400 + Math.sin(time * 0.002) * 100;

      const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, glowRadius);
      gradient.addColorStop(0, `rgba(124, 200, 255, ${0.05 + Math.sin(time * 0.003) * 0.02})`);
      gradient.addColorStop(1, 'rgba(124, 200, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function animate() {
      ctx.fillStyle = 'rgba(10, 20, 31, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time++;

      drawGradientMesh();
      drawGlow();

      floatingShapes.forEach((shape) => {
        shape.update();
        shape.draw();
      });

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < Math.min(i + 8, particles.length); j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200) {
            const opacity = (1 - distance / 200) * 0.3;
            ctx.strokeStyle = `rgba(124, 200, 255, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    animate();

    heroSection.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      return false;
    });
  }

  const scrollToLaptopsBtn = document.getElementById('scrollToLaptops');
  const siteHeader = document.querySelector('.site-header');

  if (scrollToLaptopsBtn && siteHeader) {
    scrollToLaptopsBtn.addEventListener('click', () => {
      siteHeader.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // =============================================
  // CHECKOUT OVERLAY — Commander Ordering System
  // =============================================

  const checkoutOverlay = document.getElementById('checkoutOverlay');
  const checkoutBackdrop = document.getElementById('checkoutBackdrop');
  const checkoutCloseBtn = document.getElementById('checkoutClose');
  const checkoutForm = document.getElementById('checkoutForm');
  const checkoutConfirmBtn = document.getElementById('checkoutConfirmBtn');

  // Checkout product display elements
  const checkoutProductImg = document.getElementById('checkoutProductImg');
  const checkoutProductName = document.getElementById('checkoutHeading');
  const checkoutProductPriceEl = document.getElementById('checkoutProductPrice');

  // Summary elements
  const summaryProductName = document.getElementById('summaryProductName');
  const summaryProductPrice = document.getElementById('summaryProductPrice');
  const summaryDeliveryRow = document.getElementById('summaryDeliveryRow');
  const summaryDeliveryLabel = document.getElementById('summaryDeliveryLabel');
  const summaryDeliveryPrice = document.getElementById('summaryDeliveryPrice');
  const summaryTotal = document.getElementById('summaryTotal');

  // Form inputs
  const inputNom = document.getElementById('checkoutNom');
  const inputPrenom = document.getElementById('checkoutPrenom');
  const inputTel = document.getElementById('checkoutTel');
  const inputEmail = document.getElementById('checkoutEmail');
  const inputWilaya = document.getElementById('checkoutWilaya');
  const inputAdresse = document.getElementById('checkoutAdresse');
  const deliveryRadios = document.querySelectorAll('.checkout-delivery-radio');
  const deliveryCards = document.querySelectorAll('.checkout-delivery-card');

  // Error elements
  const errorNom = document.getElementById('errorNom');
  const errorPrenom = document.getElementById('errorPrenom');
  const errorTel = document.getElementById('errorTel');
  const errorEmail = document.getElementById('errorEmail');
  const errorWilaya = document.getElementById('errorWilaya');
  const errorAdresse = document.getElementById('errorAdresse');
  const errorDelivery = document.getElementById('errorDelivery');

  // Current product state
  let currentCheckoutProduct = null;
  let isSubmittingOrder = false;

  // Status alert notification element
  const checkoutStatusAlert = document.getElementById('checkoutStatusAlert');

  /**
   * Afficher un message de statut (succès ou erreur) dans le formulaire de checkout
   */
  function showCheckoutAlert(type, title, message, badgeText) {
    if (!checkoutStatusAlert) return;
    checkoutStatusAlert.className = `checkout-status-alert is-${type}`;
    let html = `<div class="checkout-status-alert-title">`;
    if (type === 'success') {
      html += `<span>✓</span> <span>${title}</span>`;
    } else {
      html += `<span>⚠️</span> <span>${title}</span>`;
    }
    html += `</div><div class="checkout-status-alert-body">${message}</div>`;
    if (badgeText) {
      html += `<div class="checkout-status-alert-badge">Réf : ${badgeText}</div>`;
    }
    checkoutStatusAlert.innerHTML = html;
    checkoutStatusAlert.style.display = 'block';
    checkoutStatusAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Masquer le message de statut du checkout
   */
  function hideCheckoutAlert() {
    if (!checkoutStatusAlert) return;
    checkoutStatusAlert.style.display = 'none';
    checkoutStatusAlert.innerHTML = '';
    checkoutStatusAlert.className = 'checkout-status-alert';
  }

  /**
   * Format a number with locale thousand separators for Algerian Dinar display.
   * e.g. 78000 → "78,000 DA"
   */
  function formatPrice(num) {
    return num.toLocaleString('en-US') + ' DA';
  }

  /**
   * Parse a price string like "66000 DA" or "66,000 DA" → number 66000
   */
  function parsePrice(priceStr) {
    if (!priceStr) return 0;
    const cleaned = priceStr.replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
  }

  /**
   * Convert product name to clean URL slug matching database
   */
  function toProductSlug(name) {
    return (name || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Open the checkout overlay with the given product data.
   * @param {Object} product - { name, price, image, id }
   */
  function openCheckout(product) {
    if (!checkoutOverlay || !product) return;

    currentCheckoutProduct = product;
    isCheckoutOpen = true;
    isSubmittingOrder = false;

    // Populate product display
    checkoutProductImg.src = product.image;
    checkoutProductImg.alt = product.name;
    checkoutProductName.textContent = product.name;
    checkoutProductPriceEl.textContent = formatPrice(product.price);

    // Populate summary
    summaryProductName.textContent = product.name;
    summaryProductPrice.textContent = formatPrice(product.price);
    summaryDeliveryRow.style.display = 'none';
    summaryTotal.textContent = formatPrice(product.price);

    // Reset form & alerts
    checkoutForm.reset();
    clearAllErrors();
    clearAllValidation();
    hideCheckoutAlert();
    deliveryCards.forEach(card => card.classList.remove('is-selected'));
    
    // Reset confirm button
    checkoutConfirmBtn.disabled = true;
    checkoutConfirmBtn.classList.remove('is-loading');
    checkoutConfirmBtn.innerHTML = '<span class="btn-text">CONFIRMER LA COMMANDE</span>';
    checkoutConfirmBtn.style.background = '';
    checkoutConfirmBtn.style.boxShadow = '';

    // Slide out the product modal
    if (modal && modal.classList.contains('open')) {
      modal.classList.add('checkout-slide-out');
    }

    // Open checkout overlay
    checkoutOverlay.classList.remove('is-closing');
    checkoutOverlay.classList.add('is-open');
    checkoutOverlay.setAttribute('aria-hidden', 'false');

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    // Scroll the checkout to top
    const scrollContainer = checkoutOverlay.querySelector('.checkout-scroll');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }

    // Focus the close button for accessibility
    setTimeout(() => {
      checkoutCloseBtn.focus();
    }, 100);
  }

  /**
   * Close the checkout overlay with reverse animation.
   */
  function closeCheckoutOverlay() {
    if (!checkoutOverlay || !isCheckoutOpen) return;

    isCheckoutOpen = false;

    // Start closing animation
    checkoutOverlay.classList.add('is-closing');
    checkoutOverlay.classList.remove('is-open');
    checkoutOverlay.setAttribute('aria-hidden', 'true');

    // Slide the product modal back in
    if (modal && modal.classList.contains('checkout-slide-out')) {
      modal.classList.remove('checkout-slide-out');
      modal.classList.add('checkout-slide-back');
    }

    // After animation completes, clean up
    setTimeout(() => {
      checkoutOverlay.classList.remove('is-closing');
      if (modal) {
        modal.classList.remove('checkout-slide-back');
      }
      // Only restore scroll if the modal is no longer open
      if (!modal || !modal.classList.contains('open')) {
        document.body.style.overflow = '';
      }
    }, 750);
  }

  // ---- Global Commander Button Handler ----
  // Handles clicks on any Commander button (inside product detail modal or on product cards)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, .btn');
    if (!btn) return;

    const btnText = btn.textContent.trim().toLowerCase();
    if (btnText === 'commander') {
      e.preventDefault();
      e.stopPropagation();

      // If clicked inside the open detail modal
      if (modal && modal.classList.contains('open')) {
        const name = modalTitle?.textContent || 'Laptop';
        const priceText = modalPrice?.textContent || '0';
        const price = parsePrice(priceText);

        const firstSlideImg = document.querySelector('.carousel-slide img');
        const image = firstSlideImg ? firstSlideImg.src : '';
        const id = toProductSlug(name);
        const description = modalDescription?.textContent || '';
        const specs = Array.from(modalSpecs?.querySelectorAll('li') || []).map(li => li.textContent).join(' | ');

        openCheckout({ name, price, image, id, specs, description });
        return;
      }

      // If clicked on a product card
      const card = btn.closest('.product-card');
      if (card) {
        const name = card.dataset.name || 'Laptop';
        const priceText = card.dataset.price || '0';
        const price = parsePrice(priceText);
        const image = card.dataset.image || '';
        const id = toProductSlug(name);
        const specs = card.dataset.specs || '';
        const description = card.dataset.description || '';

        openCheckout({ name, price, image, id, specs, description });
      }
    }
  });

  // ---- Close handlers ----
  checkoutCloseBtn?.addEventListener('click', closeCheckoutOverlay);

  checkoutBackdrop?.addEventListener('click', closeCheckoutOverlay);

  // ESC key closes checkout (takes priority over modal ESC since z-index is higher)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isCheckoutOpen) {
      e.preventDefault();
      e.stopPropagation();
      closeCheckoutOverlay();
    }
  });

  // ---- Delivery Selection ----
  deliveryRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      // Update card styles
      deliveryCards.forEach(card => card.classList.remove('is-selected'));
      const parentCard = radio.closest('.checkout-delivery-card');
      if (parentCard) {
        parentCard.classList.add('is-selected');
      }

      // Clear delivery error
      errorDelivery.textContent = '';

      // Update summary
      updateOrderSummary();
      validateForm();
    });
  });

  /**
   * Update the order summary section with current product and delivery prices.
   */
  function updateOrderSummary() {
    if (!currentCheckoutProduct) return;

    const productPrice = currentCheckoutProduct.price;
    const selectedDelivery = document.querySelector('.checkout-delivery-radio:checked');

    if (selectedDelivery) {
      const deliveryPrice = parseInt(selectedDelivery.value, 10);
      const deliveryName = selectedDelivery.id === 'deliveryYalidine' ? 'Bureau Yalidine' : 'Livraison à domicile';

      summaryDeliveryRow.style.display = 'flex';
      summaryDeliveryLabel.textContent = deliveryName;
      summaryDeliveryPrice.textContent = formatPrice(deliveryPrice);

      const total = productPrice + deliveryPrice;
      summaryTotal.textContent = formatPrice(total);
    } else {
      summaryDeliveryRow.style.display = 'none';
      summaryTotal.textContent = formatPrice(productPrice);
    }
  }

  // ---- Form Validation ----

  /**
   * Normalize an Algerian phone number string.
   */
  function cleanAlgerianPhone(phone) {
    if (!phone) return '';
    let cleaned = phone.replace(/[\s\-\.\(\)\/]+/g, '');
    if (cleaned.startsWith('+213')) {
      cleaned = '0' + cleaned.slice(4);
    } else if (cleaned.startsWith('00213')) {
      cleaned = '0' + cleaned.slice(5);
    } else if (cleaned.startsWith('213') && cleaned.length === 11) {
      cleaned = '0' + cleaned.slice(3);
    }
    return cleaned;
  }

  /**
   * Validate an Algerian phone number.
   * Must start with 05, 06, or 07 and be exactly 10 digits.
   */
  function isValidAlgerianPhone(phone) {
    const cleaned = cleanAlgerianPhone(phone);
    return /^0[567]\d{8}$/.test(cleaned);
  }

  /**
   * Validate an email address format.
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  /**
   * Clear all error messages.
   */
  function clearAllErrors() {
    [errorNom, errorPrenom, errorTel, errorEmail, errorWilaya, errorAdresse, errorDelivery].forEach(el => {
      if (el) el.textContent = '';
    });
  }

  /**
   * Clear all validation styling.
   */
  function clearAllValidation() {
    [inputNom, inputPrenom, inputTel, inputEmail, inputWilaya, inputAdresse].forEach(el => {
      if (el) {
        el.classList.remove('is-invalid', 'is-valid');
      }
    });
  }

  /**
   * Validate a single field and show error/valid state.
   * Returns true if valid, false if invalid.
   */
  function validateField(input, errorEl, validatorFn, errorMsg) {
    const value = input.value;

    // Only show validation if the user has interacted (field has content or was blurred)
    if (value.trim() === '' && !input.dataset.touched) {
      input.classList.remove('is-invalid', 'is-valid');
      errorEl.textContent = '';
      return false;
    }

    if (validatorFn(value)) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      errorEl.textContent = '';
      return true;
    } else {
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
      errorEl.textContent = errorMsg;
      return false;
    }
  }

  /**
   * Validate the entire form and update the confirm button state.
   */
  function validateForm() {
    const nomValid = inputNom.value.trim().length > 0;
    const prenomValid = inputPrenom.value.trim().length > 0;
    const telValid = isValidAlgerianPhone(inputTel.value);
    const emailValid = isValidEmail(inputEmail.value);
    const wilayaValid = inputWilaya.value !== '';
    const adresseValid = inputAdresse.value.trim().length > 0;
    const deliveryValid = document.querySelector('.checkout-delivery-radio:checked') !== null;

    const allValid = nomValid && prenomValid && telValid && emailValid && wilayaValid && adresseValid && deliveryValid;
    checkoutConfirmBtn.disabled = !allValid;

    return allValid;
  }

  // Mark fields as touched on blur so validation shows after interaction
  [inputNom, inputPrenom, inputTel, inputEmail, inputWilaya, inputAdresse].forEach(input => {
    if (!input) return;

    input.addEventListener('blur', () => {
      input.dataset.touched = 'true';
      runFieldValidation(input);
      validateForm();
    });

    input.addEventListener('input', () => {
      if (input.dataset.touched) {
        runFieldValidation(input);
      }
      validateForm();
    });
  });

  // Special handling for the select (wilaya)
  inputWilaya?.addEventListener('change', () => {
    inputWilaya.dataset.touched = 'true';
    runFieldValidation(inputWilaya);
    validateForm();
  });

  /**
   * Run validation for a specific field.
   */
  function runFieldValidation(input) {
    switch (input) {
      case inputNom:
        validateField(input, errorNom, v => v.trim().length > 0, 'Le nom est requis');
        break;
      case inputPrenom:
        validateField(input, errorPrenom, v => v.trim().length > 0, 'Le prénom est requis');
        break;
      case inputTel:
        validateField(input, errorTel, v => isValidAlgerianPhone(v), 'Numéro invalide (ex: 05XXXXXXXX)');
        break;
      case inputEmail:
        validateField(input, errorEmail, v => isValidEmail(v), 'Email invalide');
        break;
      case inputWilaya:
        validateField(input, errorWilaya, v => v !== '', 'Veuillez sélectionner une wilaya');
        break;
      case inputAdresse:
        validateField(input, errorAdresse, v => v.trim().length > 0, "L'adresse est requise");
        break;
    }
  }

  // ---- Confirm Button ----
  checkoutConfirmBtn?.addEventListener('click', async () => {
    if (checkoutConfirmBtn.disabled || isSubmittingOrder) return;

    // Mark all fields as touched to show any remaining errors
    [inputNom, inputPrenom, inputTel, inputEmail, inputWilaya, inputAdresse].forEach(input => {
      if (input) {
        input.dataset.touched = 'true';
        runFieldValidation(input);
      }
    });

    // Check delivery selection
    const deliverySelected = document.querySelector('.checkout-delivery-radio:checked');
    if (!deliverySelected) {
      errorDelivery.textContent = 'Veuillez choisir un mode de livraison';
    }

    if (!validateForm()) return;

    hideCheckoutAlert();

    const deliveryMethod = deliverySelected.id === 'deliveryYalidine' ? 'yalidine' : 'domicile';
    const deliveryPrice = parseInt(deliverySelected.value, 10);
    const subtotal = currentCheckoutProduct.price;
    const expectedTotal = subtotal + deliveryPrice;

    const customerData = {
      nom: inputNom.value.trim(),
      prenom: inputPrenom.value.trim(),
      telephone: cleanAlgerianPhone(inputTel.value),
      email: inputEmail.value.trim(),
      wilaya: inputWilaya.value,
      adresse: inputAdresse.value.trim(),
      deliveryMethod,
      deliveryPrice,
      productSlug: currentCheckoutProduct.id,
      productName: currentCheckoutProduct.name,
      productPrice: subtotal,
      productSpecs: currentCheckoutProduct.specs || '',
      productDescription: currentCheckoutProduct.description || '',
      productImage: currentCheckoutProduct.image || '',
      totalPrice: expectedTotal
    };

    // Activer l'état de chargement et verrouiller les soumissions concurrentes
    isSubmittingOrder = true;
    checkoutConfirmBtn.disabled = true;
    checkoutConfirmBtn.classList.add('is-loading');
    checkoutConfirmBtn.innerHTML = `
      <span class="checkout-btn-spinner"></span>
      <span class="btn-text">Traitement de votre commande...</span>
    `;

    try {
      const generatedOrderNumber = 'DT-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
      let resultOrder = {
        success: true,
        order_number: generatedOrderNumber,
        total_price: customerData.totalPrice,
        product_name: customerData.productName
      };

      // 1. Enregistrement prioritaire dans Firebase Firestore
      let firebaseSaved = false;
      if (window.dragonFirebase && typeof window.dragonFirebase.saveOrderToFirestore === 'function') {
        try {
          const fbResult = await window.dragonFirebase.saveOrderToFirestore({
            ...customerData,
            orderNumber: generatedOrderNumber
          });
          if (fbResult && fbResult.success) {
            firebaseSaved = true;
            resultOrder.firestore_id = fbResult.id;
            console.log('✅ DragonTec: Commande enregistrée avec succès dans Firebase Firestore.');
          }
        } catch (fbErr) {
          console.warn('⚠️ DragonTec: Erreur Firestore:', fbErr);
        }
      }

      // 2. Synchronisation / Enregistrement dans Supabase (si configuré)
      const client = (window.dragonSupabase) || (typeof window.getSupabaseClient === 'function' && window.getSupabaseClient());
      if (client) {
        try {
          const { data, error } = await client.rpc('submit_checkout_order', {
            p_first_name: customerData.prenom,
            p_last_name: customerData.nom,
            p_phone: customerData.telephone,
            p_email: customerData.email,
            p_wilaya: customerData.wilaya,
            p_full_address: customerData.adresse,
            p_delivery_method: customerData.deliveryMethod,
            p_product_slug: customerData.productSlug,
            p_quantity: 1
          });

          if (!error && data && data.success) {
            resultOrder.order_number = data.order_number || resultOrder.order_number;
            resultOrder.order_id = data.order_id;
            resultOrder.total_price = data.total_price || resultOrder.total_price;
          } else if (error) {
            console.warn('DragonTec: RPC non disponible ou erreur, tentative d\'insertion directe Supabase:', error);
            const { data: orderData, error: orderErr } = await client
              .from('orders')
              .insert([{
                order_number: resultOrder.order_number,
                first_name: customerData.prenom,
                last_name: customerData.nom,
                phone: customerData.telephone,
                email: customerData.email,
                wilaya: customerData.wilaya,
                full_address: customerData.adresse,
                delivery_method: customerData.deliveryMethod,
                delivery_price: customerData.deliveryPrice,
                subtotal: customerData.productPrice,
                total_price: customerData.totalPrice,
                status: 'pending'
              }])
              .select('id, order_number, total_price')
              .single();

            if (!orderErr && orderData) {
              resultOrder.order_id = orderData.id;
              await client.from('order_items').insert([{
                order_id: orderData.id,
                product_slug: customerData.productSlug,
                product_name: customerData.productName,
                unit_price: customerData.productPrice,
                quantity: 1,
                subtotal: customerData.productPrice
              }]);
            }
          }
        } catch (dbErr) {
          console.warn('⚠️ DragonTec: Note Supabase:', dbErr);
          if (!firebaseSaved) throw dbErr;
        }
      }

      // 3. Traitement du succès
      const orderRef = resultOrder.order_number || ('DT-' + Date.now().toString().slice(-6));
      
      showCheckoutAlert(
        'success',
        'Commande enregistrée avec succès !',
        `Merci <strong>${customerData.prenom}</strong>. Votre commande pour <strong>${customerData.productName}</strong> (${formatPrice(resultOrder.total_price || customerData.totalPrice)}) a été enregistrée avec succès dans notre base de données. Notre équipe vous contactera au <strong>${customerData.telephone}</strong> pour confirmation.`,
        orderRef
      );

      // Mettre à jour le bouton avec le statut de confirmation
      checkoutConfirmBtn.classList.remove('is-loading');
      checkoutConfirmBtn.innerHTML = '<span class="btn-text">✓ COMMANDE CONFIRMÉE</span>';
      checkoutConfirmBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      checkoutConfirmBtn.style.boxShadow = '0 12px 28px rgba(16, 185, 129, 0.35)';

      // Réinitialiser le formulaire
      checkoutForm.reset();
      clearAllErrors();
      clearAllValidation();
      deliveryCards.forEach(card => card.classList.remove('is-selected'));
      summaryDeliveryRow.style.display = 'none';

      // Fermeture automatique de l'overlay après délai
      setTimeout(() => {
        if (isCheckoutOpen) {
          closeCheckoutOverlay();
        }
        checkoutConfirmBtn.innerHTML = '<span class="btn-text">CONFIRMER LA COMMANDE</span>';
        checkoutConfirmBtn.style.background = '';
        checkoutConfirmBtn.style.boxShadow = '';
        checkoutConfirmBtn.disabled = true;
        isSubmittingOrder = false;
      }, 5500);

    } catch (err) {
      console.error('❌ DragonTec Erreur de commande:', err);

      // Afficher un message d'erreur professionnel en français sans exposer de détails techniques
      showCheckoutAlert(
        'error',
        'Une erreur est survenue',
        'Impossible d\'enregistrer votre commande pour le moment. Veuillez vérifier votre connexion Internet et réessayer, ou nous contacter directement via Instagram / WhatsApp.'
      );

      // Réactiver le bouton pour permettre une nouvelle tentative sans perdre les données saisies
      checkoutConfirmBtn.disabled = false;
      checkoutConfirmBtn.classList.remove('is-loading');
      checkoutConfirmBtn.innerHTML = '<span class="btn-text">RÉESSAYER LA COMMANDE</span>';
      isSubmittingOrder = false;
    }
  });
});
