(() => {
  const dialog = document.querySelector(".breakdown-lightbox");
  const image = dialog?.querySelector("img");
  const stage = dialog?.querySelector("[data-breakdown-stage]");
  if (!dialog || !image || !stage) return;

  let zoom = 1;
  let panX = 0;
  let panY = 0;
  const pointers = new Map();
  let dragStart = null;
  let pinchStart = null;

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

  const pointerMidpoint = ([first, second]) => ({
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2
  });

  const startPinch = () => {
    const [first, second] = [...pointers.values()];
    const midpoint = pointerMidpoint([first, second]);
    const distance = Math.hypot(second.x - first.x, second.y - first.y);
    pinchStart = {
      distance: Math.max(1, distance),
      zoom,
      imageX: (midpoint.x - panX) / zoom,
      imageY: (midpoint.y - panY) / zoom
    };
    dragStart = null;
  };

  const updateDragStart = () => {
    const [pointerId, point] = pointers.entries().next().value;
    dragStart = {
      pointerId,
      x: point.x,
      y: point.y,
      panX,
      panY
    };
  };

  document.querySelectorAll(".breakdown-image-trigger[data-breakdown-image]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      image.src = trigger.dataset.breakdownImage;
      image.alt = trigger.dataset.breakdownTitle || "Full-size project breakdown diagram";
      zoom = 1;
      panX = 0;
      panY = 0;
      pointers.clear();
      dragStart = null;
      pinchStart = null;
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
    const bounds = stage.getBoundingClientRect();
    pointers.set(event.pointerId, {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    });
    stage.setPointerCapture(event.pointerId);
    if (pointers.size === 1) updateDragStart();
    else startPinch();
  });

  stage.addEventListener("pointermove", (event) => {
    if (!pointers.has(event.pointerId)) return;
    const bounds = stage.getBoundingClientRect();
    pointers.set(event.pointerId, {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    });
    if (pointers.size >= 2 && pinchStart) {
      const [first, second] = [...pointers.values()];
      const midpoint = pointerMidpoint([first, second]);
      zoom = Math.min(6, Math.max(1, pinchStart.zoom
        * Math.hypot(second.x - first.x, second.y - first.y) / pinchStart.distance));
      panX = midpoint.x - pinchStart.imageX * zoom;
      panY = midpoint.y - pinchStart.imageY * zoom;
      clampPan();
      applyTransform();
      return;
    }
    if (!dragStart || dragStart.pointerId !== event.pointerId) return;
    const point = pointers.get(event.pointerId);
    panX = dragStart.panX + point.x - dragStart.x;
    panY = dragStart.panY + point.y - dragStart.y;
    clampPan();
    applyTransform();
  });

  const stopPointer = (event) => {
    if (!pointers.delete(event.pointerId)) return;
    dragStart = null;
    pinchStart = null;
    if (pointers.size === 1) updateDragStart();
    else if (pointers.size >= 2) startPinch();
  };
  stage.addEventListener("pointerup", stopPointer);
  stage.addEventListener("pointercancel", stopPointer);
  stage.addEventListener("lostpointercapture", stopPointer);

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
