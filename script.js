document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      button.classList.add('is-clicked');
      setTimeout(() => button.classList.remove('is-clicked'), 180);
    });
  });

  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  let totalSeconds = 12 * 3600 + 45 * 60 + 9;

  function updateCountdown() {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');

    if (hoursEl) hoursEl.textContent = hours;
    if (minutesEl) minutesEl.textContent = minutes;
    if (secondsEl) secondsEl.textContent = seconds;

    if (totalSeconds > 0) {
      totalSeconds -= 1;
    } else {
      totalSeconds = 12 * 3600 + 45 * 60 + 9;
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Carousel functionality
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
      if (!carousel) return;
      currentIndex = Math.max(0, Math.min(index, dots.length - 1));
      const slideWidth = carousel.clientWidth;
      carousel.scrollLeft = slideWidth * currentIndex;
      updateIndicators();
    }

    // Handle carousel scroll events
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

    // Handle dot clicks
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        scrollToSlide(index);
      });
    });

    // Handle arrow buttons
    arrowLeft?.addEventListener('click', () => {
      scrollToSlide(currentIndex - 1);
    });

    arrowRight?.addEventListener('click', () => {
      scrollToSlide(currentIndex + 1);
    });

    // Keyboard navigation
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
  const modalBadge = document.getElementById('modalBadge');
  const modalTag = document.getElementById('modalTag');
  const modalImage = document.getElementById('modalImage');
  const closeButton = document.querySelector('.modal-close');
  const closeBackdrop = document.querySelector('[data-close="true"]');
  const productCards = document.querySelectorAll('.product-card');

  function openModal(card) {
    if (!modal || !card) return;

    const { name, price, specs, description, badge, image, carouselImages } = card.dataset;

    modalTitle.textContent = name || 'Laptop';
    modalPrice.textContent = price || '$0';
    modalDescription.textContent = description || 'Premium laptop designed for professionals and creators.';
    modalBadge.textContent = badge || 'Featured laptop';
    modalTag.textContent = badge || 'Featured laptop';

    const specList = specs ? specs.split('|') : [];
    modalSpecs.innerHTML = specList.map((item) => `<li>${item}</li>`).join('');

    // Update carousel images if provided
    if (carouselImages) {
      const imageUrls = carouselImages.split(',');
      const carouselSlides = document.querySelectorAll('.carousel-slide img');
      
      carouselSlides.forEach((slide, index) => {
        if (imageUrls[index]) {
          slide.src = imageUrls[index];
          slide.alt = `${name || 'Laptop'} preview ${index + 1}`;
        }
      });

      // Reset carousel to first slide
      const carousel = document.querySelector('.modal-carousel');
      if (carousel) {
        carousel.scrollLeft = 0;
      }

      // Reset indicators
      const dots = document.querySelectorAll('.carousel-dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === 0);
      });
    }

    if (modalImage && image) {
      modalImage.src = image;
      modalImage.alt = name || 'Laptop preview';
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  productCards.forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('.btn')) {
        event.stopPropagation();
      }
      openModal(card);
    });
  });

  closeButton?.addEventListener('click', closeModal);
  closeBackdrop?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });
});
