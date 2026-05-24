const projects = [
 /* {
    title: "Studio Website",
    category: "web",
    description: "Eine responsive Website für ein Kreativstudio mit klarer Navigation.",
    tags: ["HTML", "CSS", "Responsive"],
  },
  {
    title: "Task Dashboard",
    category: "app",
    description: "Eine kleine App zum Sortieren, Filtern und Priorisieren von Aufgaben.",
    tags: ["JavaScript", "UI", "State"],
  },
  {
    title: "Brand System",
    category: "design",
    description: "Farben, Typografie und Komponenten für einen einheitlichen Auftritt.",
    tags: ["Design", "Styleguide", "UI"],
  },*/
  {
    title: "Portfolio V1",
    category: "web",
    description: "Diese Website als Startpunkt für Bewerbungen und Projektanfragen.",
    tags: ["Portfolio", "JS", "CSS", "HTML"],
  },
];

const projectGrid = document.querySelector("#projectGrid");
const filterButtons = document.querySelectorAll(".filter-button");
const themeToggle = document.querySelector("#themeToggle");
const form = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");
const year = document.querySelector("#year");
const canvas = document.querySelector("#heroCanvas");
const ctx = canvas.getContext("2d");
const heroNodes = Array.from({ length: 42 }, (_, index) => ({
  x: (index * 97) % 100,
  y: (index * 53) % 100,
  size: 1.8 + (index % 4) * 0.55,
  speed: 0.35 + (index % 5) * 0.08,
}));

year.textContent = new Date().getFullYear();

function renderProjects(filter = "all") {
  const visibleProjects = filter === "all"
    ? projects
    : projects.filter((project) => project.category === filter);

  projectGrid.innerHTML = visibleProjects.map((project, index) => {
    const tags = project.tags.map((tag) => `<span>${tag}</span>`).join("");

    return `
      <article class="project-card reveal" style="transition-delay: ${index * 80}ms">
        <div class="project-visual" style="filter: hue-rotate(${index * 34}deg)"></div>
        <div>
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <div class="tags">${tags}</div>
        </div>
      </article>
    `;
  }).join("");

  observeReveals();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderProjects(button.dataset.filter);
  });
});

themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("theme", theme);
});

if (localStorage.getItem("theme") !== "light") {
  document.documentElement.classList.add("dark");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const subject = encodeURIComponent(`Portfolio Anfrage von ${data.get("name")}`);
  const body = encodeURIComponent(data.get("message"));

  formStatus.textContent = "Danke! Dein E-Mail-Programm wird vorbereitet.";
  window.location.href = `mailto:deinname@example.com?subject=${subject}&body=${body}`;
});

let observer;

function observeReveals() {
  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.16 });

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

document.querySelectorAll(".section, .about, .stats article").forEach((element) => {
  element.classList.add("reveal");
});

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(canvas.offsetWidth * pixelRatio);
  canvas.height = Math.floor(canvas.offsetHeight * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function drawHero(time = 0) {
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;
  const isDark = document.documentElement.classList.contains("dark");

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = isDark ? "#070a08" : "#f7f4ed";
  ctx.fillRect(0, 0, width, height);

  const centerX = width * 0.74;
  const centerY = height * 0.48;

  for (let i = 0; i < 7; i += 1) {
    const radius = 70 + i * 42;
    ctx.beginPath();
    ctx.ellipse(
      centerX,
      centerY,
      radius * 1.45,
      radius * 0.78,
      time / 9000 + i * 0.22,
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = isDark
      ? `rgba(57, 255, 136, ${0.16 - i * 0.012})`
      : `hsla(${170 + i * 14}, 58%, 38%, ${0.15 - i * 0.012})`;
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  const nodes = heroNodes.map((node, index) => {
    const driftX = Math.sin(time / (1200 / node.speed) + index) * 22;
    const driftY = Math.cos(time / (1500 / node.speed) + index * 0.7) * 18;

    return {
      x: width * (0.48 + node.x / 200) + driftX,
      y: height * (0.14 + node.y / 135) + driftY,
      size: node.size,
    };
  });

  nodes.forEach((node, index) => {
    for (let nextIndex = index + 1; nextIndex < nodes.length; nextIndex += 1) {
      const next = nodes[nextIndex];
      const distance = Math.hypot(node.x - next.x, node.y - next.y);

      if (distance < 130) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(next.x, next.y);
        ctx.strokeStyle = `rgba(${isDark ? "57, 255, 136" : "15, 123, 117"}, ${0.18 - distance / 900})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  });

  nodes.forEach((node, index) => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
    ctx.fillStyle = index % 7 === 0
      ? (isDark ? "#b6ff4d" : "#d84a33")
      : (isDark ? "#39ff88" : "#0f7b75");
    ctx.globalAlpha = index % 7 === 0 ? 0.86 : 0.68;
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  requestAnimationFrame(drawHero);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
renderProjects();
observeReveals();
requestAnimationFrame(drawHero);
