const HERO_IMAGE_SRC = "./assets/foto-topo.jpg";
const ABOUT_IMAGE_SRC = "./assets/cliente-principal.jpg";
const FALLBACK_IMAGE_SRC = "./assets/cliente-principal.svg";
const GALLERY_CONFIG = {
  enabled: false,
  autoShowIfHasImages: true,
  folder: "./assets/galeria",
  extensions: ["jpg", "jpeg", "png", "webp"],
  items: [
    { baseName: "01", title: "União Amorosa", comment: "Trabalho para harmonização de vínculo afetivo." },
    { baseName: "02", title: "Prosperidade", comment: "Abertura de caminhos para evolução financeira." },
    { baseName: "03", title: "Proteção Espiritual", comment: "Fortalecimento energético e limpeza espiritual." },
    { baseName: "04", title: "Saúde e Equilíbrio", comment: "Apoio espiritual para mais equilíbrio no dia a dia." },
    { baseName: "05", title: "Trabalho Espiritual", comment: "Comentário deste trabalho espiritual." },
    { baseName: "06", title: "Trabalho Espiritual", comment: "Comentário deste trabalho espiritual." },
    { baseName: "07", title: "Trabalho Espiritual", comment: "Comentário deste trabalho espiritual." },
    { baseName: "08", title: "Trabalho Espiritual", comment: "Comentário deste trabalho espiritual." },
    { baseName: "09", title: "Trabalho Espiritual", comment: "Comentário deste trabalho espiritual." },
    { baseName: "10", title: "Trabalho Espiritual", comment: "Comentário deste trabalho espiritual." }
  ]
};

const heroImage = document.querySelector("[data-hero-image]");
const yearTarget = document.querySelector("[data-current-year]");

if (yearTarget) {
  yearTarget.textContent = String(new Date().getFullYear());
}

if (heroImage) {
  heroImage.src = HERO_IMAGE_SRC;
  heroImage.addEventListener("error", () => {
    heroImage.src = FALLBACK_IMAGE_SRC;
  });
}

const aboutImage = document.querySelector("[data-about-image]");
if (aboutImage) {
  aboutImage.src = ABOUT_IMAGE_SRC;
  aboutImage.addEventListener("error", () => {
    aboutImage.src = FALLBACK_IMAGE_SRC;
  });
}

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const gallerySection = document.querySelector("[data-gallery-section]");
const galleryGrid = document.querySelector("[data-gallery-grid]");
const galleryModal = document.querySelector("[data-gallery-modal]");
const galleryModalImage = document.querySelector("[data-gallery-modal-image]");
const galleryModalTitle = document.querySelector("[data-gallery-modal-title]");
const galleryModalComment = document.querySelector("[data-gallery-modal-comment]");
const galleryCloseTargets = document.querySelectorAll("[data-gallery-close]");

function validateImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(src);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

async function initGallery() {
  if (!gallerySection || !galleryGrid) return;

  const validItems = [];

  for (const item of GALLERY_CONFIG.items) {
    for (const ext of GALLERY_CONFIG.extensions) {
      const src = `${GALLERY_CONFIG.folder}/${item.baseName}.${ext}`;
      const validSrc = await validateImage(src);
      if (validSrc) {
        validItems.push({ ...item, src: validSrc });
        break;
      }
    }
  }

  const shouldShow =
    GALLERY_CONFIG.enabled ||
    (GALLERY_CONFIG.autoShowIfHasImages && validItems.length > 0);

  if (!shouldShow || validItems.length === 0) {
    gallerySection.hidden = true;
    return;
  }

  const html = validItems
    .map(
      (item, index) => `
        <figure class="gallery__item reveal is-visible">
          <button
            type="button"
            class="gallery__open"
            data-gallery-open
            data-gallery-src="${item.src}"
            data-gallery-title="${item.title}"
            data-gallery-comment="${item.comment}"
            aria-label="Expandir foto ${index + 1} da galeria"
          >
            <img class="gallery__image" src="${item.src}" alt="${item.title}" loading="lazy" />
          </button>
          <figcaption class="gallery__caption">
            <p class="gallery__work-title">${item.title}</p>
            <p class="gallery__comment">${item.comment}</p>
          </figcaption>
        </figure>
      `
    )
    .join("");

  galleryGrid.innerHTML = html;
  gallerySection.hidden = false;

  galleryGrid.querySelectorAll("[data-gallery-open]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!galleryModal || !galleryModalImage || !galleryModalTitle || !galleryModalComment) return;
      galleryModalImage.src = button.dataset.gallerySrc ?? "";
      galleryModalImage.alt = button.dataset.galleryTitle ?? "Foto ampliada do trabalho espiritual";
      galleryModalTitle.textContent = button.dataset.galleryTitle ?? "Trabalho Espiritual";
      galleryModalComment.textContent = button.dataset.galleryComment ?? "";
      galleryModal.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });
}

void initGallery();

function closeGalleryModal() {
  if (!galleryModal || !galleryModalImage) return;
  galleryModal.hidden = true;
  galleryModalImage.src = "";
  document.body.style.overflow = "";
}

galleryCloseTargets.forEach((element) => {
  element.addEventListener("click", closeGalleryModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && galleryModal && !galleryModal.hidden) {
    closeGalleryModal();
  }
});

const slider = document.querySelector("[data-testimonials-slider]");
if (slider) {
  const slides = Array.from(slider.querySelectorAll("[data-slide]"));
  const prevBtn = slider.querySelector("[data-slide-prev]");
  const nextBtn = slider.querySelector("[data-slide-next]");
  const dotsWrap = slider.querySelector("[data-slide-dots]");
  const SWIPE_THRESHOLD = 36;
  let currentIndex = 0;
  let autoplayTimer;
  let touchStartX = 0;
  let touchStartY = 0;
  let isTouchTracking = false;

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "slider-dot";
    dot.setAttribute("aria-label", `Ir para depoimento ${index + 1}`);
    dot.addEventListener("click", () => showSlide(index));
    dotsWrap.appendChild(dot);
    return dot;
  });

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === currentIndex);
    });
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = window.setInterval(() => {
      showSlide(currentIndex + 1);
    }, 4000);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
    }
  }

  prevBtn?.addEventListener("click", () => {
    showSlide(currentIndex - 1);
    startAutoplay();
  });

  nextBtn?.addEventListener("click", () => {
    showSlide(currentIndex + 1);
    startAutoplay();
  });

  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  slider.addEventListener("focusin", stopAutoplay);
  slider.addEventListener("focusout", startAutoplay);

  slider.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      isTouchTracking = true;
      stopAutoplay();
    },
    { passive: true }
  );

  slider.addEventListener(
    "touchend",
    (event) => {
      if (!isTouchTracking) return;
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

      if (isHorizontalSwipe && Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX < 0) {
          showSlide(currentIndex + 1);
        } else {
          showSlide(currentIndex - 1);
        }
      }

      isTouchTracking = false;
      startAutoplay();
    },
    { passive: true }
  );

  slider.addEventListener(
    "touchcancel",
    () => {
      isTouchTracking = false;
      startAutoplay();
    },
    { passive: true }
  );

  showSlide(0);
  startAutoplay();
}
