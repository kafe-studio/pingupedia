export function initGalleryLightbox(section: HTMLElement): void {
  if (section.dataset.lightboxWired === "1") return;
  const dialog = section.querySelector<HTMLDialogElement>("dialog.lightbox-dialog");
  if (!dialog) return;
  section.dataset.lightboxWired = "1";

  const thumbs = section.querySelectorAll<HTMLButtonElement>("[data-gallery-index]");
  const slides = dialog.querySelectorAll<HTMLElement>("[data-slide-index]");
  const prev = dialog.querySelector<HTMLButtonElement>(".lightbox-prev");
  const next = dialog.querySelector<HTMLButtonElement>(".lightbox-next");
  const close = dialog.querySelector<HTMLButtonElement>(".lightbox-close");
  const status = dialog.querySelector<HTMLElement>("[data-lightbox-status]");
  const total = slides.length;
  if (!prev || !next || !close || total === 0) return;

  let currentIndex = 0;
  let triggerButton: HTMLButtonElement | null = null;

  function showSlide(index: number): void {
    slides.forEach((slide, i) => {
      slide.hidden = i !== index;
    });
    const alt = slides[index]?.querySelector("img")?.alt ?? "";
    if (status) status.textContent = `Fotka ${index + 1} z ${total}: ${alt}`;
    currentIndex = index;
  }

  function goPrev(): void {
    showSlide((currentIndex - 1 + total) % total);
  }

  function goNext(): void {
    showSlide((currentIndex + 1) % total);
  }

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const idx = Number(thumb.dataset.galleryIndex ?? 0);
      triggerButton = thumb;
      showSlide(idx);
      dialog.showModal();
    });
  });

  document
    .querySelectorAll<HTMLButtonElement>("[data-open-lightbox]")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.galleryIndex ?? 0);
        triggerButton = btn;
        showSlide(Math.min(Math.max(idx, 0), total - 1));
        dialog.showModal();
      });
    });

  prev.addEventListener("click", goPrev);
  next.addEventListener("click", goNext);
  close.addEventListener("click", () => dialog.close());

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  });

  dialog.addEventListener("close", () => {
    triggerButton?.focus();
    triggerButton = null;
  });
}
