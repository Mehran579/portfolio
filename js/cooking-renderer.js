function cookingMediaMarkup(project) {
  const classes = ["game-art"];
  if (project.mediaClass) classes.push(project.mediaClass);

  // Add a local image/video path here later if a cooking project gets media.
  if (!project.media) {
    return `<div class="${classes.join(" ")}"><span class="slot${project.mediaTextClass ? " " + project.mediaTextClass : ""}">${project.mediaLabel || "MEDIA SLOT"}</span></div>`;
  }

  const src = project.media;
  const ext = src.split("?")[0].split(".").pop().toLowerCase();

  if (["mp4", "webm", "ogg"].includes(ext)) {
    const type = ext === "webm" ? "webm" : ext === "ogg" ? "ogg" : "mp4";
    return `<div class="${classes.join(" ")}">
      <video autoplay muted loop playsinline preload="metadata" aria-label="${project.title} gameplay">
        <source src="${src}" type="video/${type}">
      </video>
    </div>`;
  }

  return `<div class="${classes.join(" ")}">
    <img src="${src}" alt="${project.title} gameplay" loading="lazy">
  </div>`;
}

function renderCookingProjects() {
  const grid = document.getElementById("cooking-grid");
  if (!grid) return;

  grid.innerHTML = cookingProjects.map(project => `
    <article class="game-card">
      ${cookingMediaMarkup(project)}
      <div class="card-body">
        <div class="card-num">${project.num}</div>
        <h3>${project.title}</h3>
        <div class="hook">${project.hook}</div>
        <ul>${project.bullets.map(bullet => `<li>${bullet}</li>`).join("")}</ul>
        <div class="tags">${project.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
      </div>
    </article>
  `).join("");
}

renderCookingProjects();
