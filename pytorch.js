const graphSteps = [
  { line: "inputs", nodes: ["x", "w", "b", "y"], label: "Entrada, pesos, sesgo y etiqueta" },
  { line: "multiply", nodes: ["x", "w", "multiply"], label: "Multiplicación de la entrada por los pesos" },
  { line: "add", nodes: ["multiply", "b", "add", "z"], label: "Sumamos el sesgo para obtener z" },
  { line: "loss", nodes: ["z", "y", "bce", "loss"], label: "La entropía cruzada binaria calcula la pérdida" },
  { line: "backward", nodes: ["loss", "bce", "z", "add", "b", "multiply", "w"], label: "De la pérdida hacia los pesos y el sesgo" },
  { line: "gradients", nodes: ["w", "b"], label: "Gradientes disponibles en w.grad y b.grad" },
];

const template = document.querySelector("#graph-scene");
for (const { line, nodes, label } of graphSteps) {
  const fragment = template.content.cloneNode(true);
  const graph = fragment.querySelector(".graph");
  graph.setAttribute("aria-label", label);
  fragment.querySelector(`[data-code="${line}"]`).classList.add("active-line");

  nodes.forEach((node, index) => {
    for (const item of graph.querySelectorAll(`[data-graph="${node}"]`)) {
      item.classList.add("active");
      item.style.setProperty("--delay", `${index * 110}ms`);
    }
  });

  if (line === "backward") {
    for (const edge of graph.querySelectorAll(".edge")) {
      edge.textContent = edge.textContent === "↑" ? "↓" : "←";
    }
    graph.querySelector(".input-edge").classList.add("no-gradient");
    graph.querySelector('[data-graph="y"] .edge').classList.add("no-gradient");
  }
  template.before(fragment);
}

const scenes = [...document.querySelectorAll(".scene")];
const visibility = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    entry.target.classList.toggle("in-view", entry.isIntersecting);
  }
}, { threshold: .45 });

document.querySelectorAll(".graph-scene").forEach(scene => visibility.observe(scene));

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.defaultPrevented || event.repeat ||
      event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
      event.target.closest("button, a, input, select, textarea, [contenteditable]")) return;

  const center = window.innerHeight / 2;
  const current = scenes.findIndex(scene => scene.getBoundingClientRect().bottom > center);
  const next = scenes[current + 1];
  if (current < 0 || !next) return;
  event.preventDefault();
  next.scrollIntoView({ block: "start" });
});
