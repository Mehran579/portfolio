function mediaMarkup(game){
  if(!game.media) return '<div class="game-media-placeholder">SCREENSHOT / GIF / VIDEO SLOT</div>';

  const src = game.media;
  const ext = src.split("?")[0].split(".").pop().toLowerCase();

  if(ext === "mp4" || ext === "webm" || ext === "ogg"){
    return `<div class="game-media">
      <video autoplay muted loop playsinline preload="metadata"
        aria-label="${game.title} gameplay">
        <source src="${src}" type="video/${ext === "webm" ? "webm" : ext === "ogg" ? "ogg" : "mp4"}">
      </video>
      <div class="game-media-placeholder video-fallback">VIDEO COULD NOT LOAD</div>
    </div>`;
  }

  return `<div class="game-media">
    <img src="${src}" alt="${game.title} gameplay" loading="lazy"
      onerror="this.style.display='none';this.parentElement.querySelector('.media-fallback').style.display='grid'">
    <div class="game-media-placeholder media-fallback">SCREENSHOT / GIF SLOT</div>
  </div>`;
}

function numberToWords(number){
  const ones=["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
  const tens=["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
  if(number<20)return ones[number];
  if(number<100)return tens[Math.floor(number/10)]+(number%10?`-${ones[number%10]}`:"");
  if(number<1000)return `${ones[Math.floor(number/100)]} hundred${number%100?` ${numberToWords(number%100)}`:""}`;
  return String(number);
}

function renderGames(){
  const grid=document.getElementById("game-grid");
  if(!grid)return;
  grid.innerHTML=games.map((game,index)=>`
    <article class="game-card">
      <a class="card-overlay" href="games/${game.slug}.html" aria-label="View ${game.title} project"></a>
      <div class="game-art ${game.media?"has-media":""}">
        ${mediaMarkup(game)}
        <span class="slot game-media-placeholder">SCREENSHOT / GIF SLOT</span>
      </div>
      <div class="card-body">
        <div class="card-num">${game.num}</div>
        <h3>${game.title}</h3>
        <div class="hook">${game.hook}</div>
        <ul>${game.bullets.map(b=>`<li>${b}</li>`).join("")}</ul>
        <div class="tags">${game.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>
        <div class="card-actions"><a class="card-link" href="games/${game.slug}.html">VIEW PROJECT →</a><a class="card-link secondary" href="${game.link}" target="_blank" rel="noopener">${game.linkLabel || "ITCH.IO"} ↗</a>${game.gitRepo && game.gitRepo !== "insert repo here" ? `<a class="card-link secondary" href="${game.gitRepo}" target="_blank" rel="noopener">GIT REPO ↗</a>` : `<span class="card-link secondary" aria-disabled="true" title="Add this game's repository URL in games.js">GIT REPO</span>`}</div>
      </div>
    </article>`).join("");
  const otherProjectCount=grid.querySelectorAll(".game-card").length;
  const projectCounts={
    total:otherProjectCount+Number(Boolean(document.getElementById("flagship"))),
    other:otherProjectCount
  };
  document.querySelectorAll("[data-project-count]").forEach(count=>{
    const value=projectCounts[count.dataset.projectCount];
    if(value!==undefined){
      const words=numberToWords(value);
      count.textContent=words.charAt(0).toUpperCase()+words.slice(1);
    }
  });
  grid.querySelectorAll(".game-card").forEach(card=>{
    card.addEventListener("mouseenter",()=>{
      const icon=card.querySelector(".icon");
      if(icon)icon.animate([
        {transform:"translate(0,0) rotate(0deg)"},
        {transform:"translate(12px,-5px) rotate(-8deg)"},
        {transform:"translate(-6px,3px) rotate(5deg)"},
        {transform:"translate(0,0) rotate(0deg)"}
      ],{duration:420,easing:"steps(3,end)"});
    });
  });
}
renderGames();
