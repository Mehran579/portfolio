(() => {
  const dialog = document.querySelector(".breakdown-lightbox");
  const image = dialog?.querySelector("img");
  const stage = dialog?.querySelector("[data-breakdown-stage]");
  if (!dialog || !image || !stage) return;

  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let dragStart = null;

  const panBounds = () => {
    const imageHeight = image.naturalWidth
      ? image.naturalHeight * stage.clientWidth / image.naturalWidth
      : stage.clientHeight;
    return {
      x: Math.max(0, stage.clientWidth * (zoom - 1)),
      y: Math.max(0, imageHeight * zoom - stage.clientHeight)
    };
  };

  const applyTransform = () => {
    image.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    stage.classList.toggle("is-zoomed", zoom > 1);
  };

  const clampPan = () => {
    const bounds = panBounds();
    panX = Math.max(-bounds.x, Math.min(0, panX));
    panY = Math.max(-bounds.y, Math.min(0, panY));
  };

  const setZoom = (value, anchorX = stage.clientWidth / 2, anchorY = stage.clientHeight / 2) => {
    const previousZoom = zoom;
    zoom = Math.min(6, Math.max(1, value));
    if (zoom === 1) {
      panX = 0;
      panY = 0;
    } else {
      const scaleRatio = zoom / previousZoom;
      panX = anchorX - (anchorX - panX) * scaleRatio;
      panY = anchorY - (anchorY - panY) * scaleRatio;
      clampPan();
    }
    applyTransform();
  };

  document.querySelectorAll(".breakdown-image-trigger[data-breakdown-image]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      image.src = trigger.dataset.breakdownImage;
      image.alt = trigger.dataset.breakdownTitle || "Full-size project breakdown diagram";
      zoom = 1;
      panX = 0;
      panY = 0;
      if (!dialog.open) dialog.showModal();
      applyTransform();
    });
  });

  dialog.querySelector("[data-breakdown-close]")?.addEventListener("click", () => dialog.close());

  dialog.querySelectorAll("[data-breakdown-zoom]").forEach((button) => {
    button.addEventListener("click", () => {
      switch (button.dataset.breakdownZoom) {
        case "in":
          setZoom(zoom * 1.25);
          break;
        case "out":
          setZoom(zoom / 1.25);
          break;
        case "reset":
          setZoom(1);
          break;
      }
    });
  });

  stage.addEventListener("wheel", (event) => {
    event.preventDefault();
    const bounds = stage.getBoundingClientRect();
    setZoom(
      zoom * (event.deltaY < 0 ? 1.15 : 1 / 1.15),
      event.clientX - bounds.left,
      event.clientY - bounds.top
    );
  }, { passive: false });

  stage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    dragStart = {
      x: event.clientX,
      y: event.clientY,
      panX,
      panY
    };
    stage.setPointerCapture(event.pointerId);
  });

  stage.addEventListener("pointermove", (event) => {
    if (!dragStart) return;
    panX = dragStart.panX + event.clientX - dragStart.x;
    panY = dragStart.panY + event.clientY - dragStart.y;
    clampPan();
    applyTransform();
  });

  const stopDragging = () => {
    dragStart = null;
  };
  stage.addEventListener("pointerup", stopDragging);
  stage.addEventListener("pointercancel", stopDragging);

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
