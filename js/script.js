document.addEventListener('DOMContentLoaded', () => {

  /* ============================
     SMOOTH SCROLL for anchor links
     ============================ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  /* ============================
     SCROLL REVEAL animation
     ============================ */
  const revealElements = document.querySelectorAll(
    '.about__top, .about__bottom, .stages__header, .stages__viewport, .participants__header, .participants__viewport'
  );
  revealElements.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => revealObserver.observe(el));


  /* ============================
     STAGES CAROUSEL (non-looping, no autoplay)
     ============================ */
  const stagesGrid = document.getElementById('stages-grid');
  const stagesPrev = document.getElementById('stages-prev');
  const stagesNext = document.getElementById('stages-next');
  const stagesDotsContainer = document.getElementById('stages-dots');
  const stagesControls = document.getElementById('stages-controls');
  let stagesSlideIndex = 0;
  let stagesTotal = 0;
  let isMobileStages = false;

  function initStagesCarousel() {
    const cards = Array.from(stagesGrid.children);
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      isMobileStages = true;
      stagesTotal = cards.length;
      stagesSlideIndex = 0;

      // Build dots
      stagesDotsContainer.innerHTML = '';
      for (let i = 0; i < stagesTotal; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goToStage(i));
        stagesDotsContainer.appendChild(dot);
      }

      updateStagesPosition();
    } else {
      isMobileStages = false;
      stagesGrid.style.transform = '';
    }
  }

  function goToStage(index) {
    if (index < 0 || index >= stagesTotal) return;
    stagesSlideIndex = index;
    updateStagesPosition();
  }

  function updateStagesPosition() {
    if (!isMobileStages) return;
    const cardWidth = stagesGrid.children[0].offsetWidth + 20; // card width + margin-right
    stagesGrid.style.transform = `translateX(-${stagesSlideIndex * cardWidth}px)`;

    // Update dots
    const dots = stagesDotsContainer.querySelectorAll('.dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === stagesSlideIndex));

    // Update buttons
    stagesPrev.disabled = stagesSlideIndex === 0;
    stagesNext.disabled = stagesSlideIndex === stagesTotal - 1;
  }

  stagesPrev.addEventListener('click', () => goToStage(stagesSlideIndex - 1));
  stagesNext.addEventListener('click', () => goToStage(stagesSlideIndex + 1));

  // Touch support for stages
  let stagesTouchStartX = 0;
  let stagesTouchEndX = 0;

  stagesGrid.addEventListener('touchstart', e => {
    stagesTouchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  stagesGrid.addEventListener('touchend', e => {
    stagesTouchEndX = e.changedTouches[0].screenX;
    const diff = stagesTouchStartX - stagesTouchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToStage(stagesSlideIndex + 1);
      else goToStage(stagesSlideIndex - 1);
    }
  }, { passive: true });


  /* ============================
     PARTICIPANTS CAROUSEL (looping, autoplay every 4s)
     ============================ */
  const track = document.getElementById('participants-track');
  let cards = track.querySelectorAll('.participant-card');
  const totalCards = cards.length;
  let currentIndex = 0;
  let autoplayTimer = null;
  let isAnimating = false;

  // Clone all cards for seamless looping
  cards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  // Re-select cards so we have access to the first card for measurements
  cards = track.querySelectorAll('.participant-card');

  function updateParticipantsPosition(animate = true) {
    const cardEl = cards[0];
    const style = getComputedStyle(cardEl);
    const marginLeft = parseFloat(style.marginLeft);
    const marginRight = parseFloat(style.marginRight);
    const cardWidth = cardEl.offsetWidth + marginLeft + marginRight;

    if (!animate) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.5s ease-in-out';
    }

    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

    // Update counters
    const displayIndex = ((currentIndex % totalCards) + totalCards) % totalCards;
    document.querySelectorAll('.slider-counter__current').forEach(el => {
      el.textContent = displayIndex + 1;
    });
    document.querySelectorAll('.slider-counter__total').forEach(el => {
      el.textContent = totalCards;
    });
  }

  function nextParticipant() {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex++;
    updateParticipantsPosition(true);

    setTimeout(() => {
      if (currentIndex >= totalCards) {
        currentIndex = 0;
        updateParticipantsPosition(false);
      }
      isAnimating = false;
    }, 500);
  }

  function prevParticipant() {
    if (isAnimating) return;
    isAnimating = true;
    
    if (currentIndex <= 0) {
      currentIndex = totalCards;
      updateParticipantsPosition(false);
      track.offsetHeight; // force reflow
    }
    
    currentIndex--;
    updateParticipantsPosition(true);

    setTimeout(() => {
      isAnimating = false;
    }, 500);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextParticipant, 4000);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  // Bind buttons
  document.querySelectorAll('.part-next').forEach(btn => {
    btn.addEventListener('click', () => {
      nextParticipant();
      startAutoplay(); // Reset timer
    });
  });

  document.querySelectorAll('.part-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      prevParticipant();
      startAutoplay(); // Reset timer
    });
  });

  // Touch support for participants
  let partTouchStartX = 0;
  track.addEventListener('touchstart', e => {
    partTouchStartX = e.changedTouches[0].screenX;
    stopAutoplay();
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = partTouchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextParticipant();
      else prevParticipant();
    }
    startAutoplay();
  }, { passive: true });


  /* ============================
     INIT & RESIZE
     ============================ */
  function init() {
    initStagesCarousel();
    updateParticipantsPosition(false);
    startAutoplay();
  }

  init();

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      initStagesCarousel();
      currentIndex = currentIndex % totalCards;
      updateParticipantsPosition(false);
    }, 150);
  });

});
