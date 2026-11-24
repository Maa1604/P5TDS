const stage = document.querySelector("#stage");
const chapters = document.querySelector("#chapters");
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");
const progress = document.querySelector("#progress");
const points = document.querySelector("#points");
const example = document.querySelector("#example");
let slideIndex = 0;
let revealed = 0;

progress.max = slides.length;
slides.forEach(({ title }, index) => {
  chapters.add(new Option(`${index + 1}. ${title}`, index));
});

function render() {
  const slide = slides[slideIndex];
  const finished = slideIndex === slides.length - 1 && revealed === slide.steps.length;
  document.querySelector("#section").textContent = slide.section;
  document.querySelector("#slide-number").textContent = `${slideIndex + 1} / ${slides.length}`;
  document.querySelector("#title").textContent = slide.title;
  document.querySelector("#intro").textContent = slide.intro;
  points.replaceChildren();
  slide.steps.slice(0, revealed).forEach(([explanation], index) => {
    const item = document.createElement("li");
    item.textContent = explanation;
    if (index === revealed - 1) item.className = "current";
    points.append(item);
  });

  example.replaceChildren();
  example.hidden = revealed === 0;
  if (revealed) {
    const content = slide.steps[revealed - 1][1];
    if (slideIndex === 11) {
      const chart = new Image();
      chart.src = `assets/${content}.png`;
      chart.alt = content === "loss"
        ? "La pérdida de entrenamiento y validación disminuye durante las cinco épocas."
        : "La precisión de entrenamiento y validación aumenta durante las cinco épocas.";
      example.append(chart);
    } else {
      const code = document.createElement("pre");
      code.textContent = content;
      example.append(code);
    }
  }

  chapters.value = slideIndex;
  progress.value = slideIndex + revealed / slide.steps.length;
  previous.disabled = slideIndex === 0 && revealed === 0;
  next.textContent = finished ? "Reiniciar" : revealed === slide.steps.length ? "Siguiente diapositiva" : "Siguiente";
  document.querySelector("#status").textContent = finished
    ? "Presentación completada"
    : `Ideas mostradas ${revealed} de ${slide.steps.length}`;
}

function goTo(index, step = 0) {
  slideIndex = index;
  revealed = step;
  render();
  window.scrollTo(0, 0);
}

function advance() {
  if (revealed < slides[slideIndex].steps.length) {
    revealed++;
    render();
  } else {
    goTo((slideIndex + 1) % slides.length);
  }
}

function rewind() {
  if (revealed > 0) {
    revealed--;
    render();
  } else if (slideIndex > 0) {
    goTo(slideIndex - 1, slides[slideIndex - 1].steps.length);
  }
}

stage.addEventListener("click", () => {
  if (window.getSelection()?.isCollapsed !== false) advance();
});
next.addEventListener("click", advance);
previous.addEventListener("click", rewind);
chapters.addEventListener("change", () => goTo(Number(chapters.value)));

document.addEventListener("keydown", (event) => {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.target.closest("select, input, textarea, [contenteditable]")) return;
  if (event.key === "Enter" && event.target.closest("button")) return;
  if (event.key === "Enter" || event.key === "ArrowRight" || event.key === "ArrowLeft") {
    event.preventDefault();
    if (event.repeat) return;
    if (event.key === "ArrowLeft") rewind();
    else advance();
  }
});

render();
