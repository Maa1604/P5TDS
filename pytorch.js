const graphScene = document.querySelector(".graph-scene");
const graph = graphScene.querySelector(".graph");
const nodes = [...graph.querySelectorAll("[data-graph]")];
const lines = [...graphScene.querySelectorAll("[data-code]")];
const arrows = [...graph.querySelectorAll(".edge")].map(edge => ({
  edge,
  forward: edge.textContent,
  backward: edge.textContent === "↑" ? "↓" : "←",
}));

const stepNodes = {
  inputs: ["x", "w", "b", "y"],
  multiply: ["x", "w", "multiply"],
  add: ["multiply", "b", "add", "z"],
  loss: ["z", "y", "bce", "loss"],
  backward: ["loss", "bce", "z", "add", "b", "multiply", "w"],
  gradients: ["w", "b"],
};
const nodeSteps = {
  x: "inputs", w: "inputs", b: "inputs", y: "inputs",
  multiply: "multiply", add: "add", z: "add", bce: "loss", loss: "loss",
};
let selected;

function selectStep(step) {
  if (step === selected) return;
  selected = step;
  const backward = step === "backward";
  graph.classList.toggle("is-backward", backward);

  for (const node of nodes) {
    const index = stepNodes[step].indexOf(node.dataset.graph);
    node.classList.toggle("active", index >= 0);
    node.style.setProperty("--delay", backward ? `${index * 110}ms` : "0ms");
  }
  for (const line of lines) {
    line.classList.toggle("active-line", line.dataset.code === step);
  }
  for (const arrow of arrows) {
    arrow.edge.textContent = backward ? arrow.backward : arrow.forward;
  }
}

function bindSelection(item, step) {
  const select = () => selectStep(step);
  item.addEventListener("mouseenter", select);
  item.addEventListener("focus", select);
  item.addEventListener("click", select);
}

for (const node of nodes) bindSelection(node, nodeSteps[node.dataset.graph]);
for (const line of lines) bindSelection(line, line.dataset.code);

const scenes = [...document.querySelectorAll(".scene")];
let lastWheelAt = -Infinity;
let wheelHandled = false;

function currentSceneIndex() {
  const center = window.innerHeight / 2;
  return scenes.findIndex(scene => scene.getBoundingClientRect().bottom > center);
}

window.addEventListener("wheel", (event) => {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey ||
      Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;

  if (event.timeStamp - lastWheelAt > 180) wheelHandled = false;
  lastWheelAt = event.timeStamp;
  if (wheelHandled) {
    event.preventDefault();
    return;
  }

  const direction = Math.sign(event.deltaY);
  const index = currentSceneIndex();
  if (index < 0) return;
  const scene = scenes[index].getBoundingClientRect();
  const canScrollWithin = direction > 0 ? scene.bottom > window.innerHeight + 2 : scene.top < -2;
  const next = scenes[index + direction];
  if (canScrollWithin || !next || !event.cancelable) return;

  event.preventDefault();
  wheelHandled = true;
  next.scrollIntoView({ block: "start" });
}, { passive: false });

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.defaultPrevented || event.repeat ||
      event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
      event.target.closest("button, a, input, select, textarea, [contenteditable]")) return;

  const current = currentSceneIndex();
  const next = scenes[current + 1];
  if (current < 0 || !next) return;
  event.preventDefault();
  next.scrollIntoView({ block: "start" });
});
