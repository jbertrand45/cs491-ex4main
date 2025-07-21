import { applyButtonFormat, applyTextFormat } from './format.js';

function createCellButton(index, moveHandler) {
  const button = document.createElement("button");
  button.className = "cell";
  button.id = `tic${index}`;

  applyButtonFormat(button);

  const tooltip = document.createElement("div");
  applyTextFormat(tooltip);
  button.appendChild(tooltip);

  button.onclick = moveHandler;

  return button;
}

function removeHover(btn) {
  btn.removeEventListener("mouseover", showTooltip);
  btn.removeEventListener("mouseout", hideTooltip);
}

function addHover(btn) {
  btn.removeEventListener("mouseover", showTooltip);
  btn.removeEventListener("mouseout", hideTooltip);
}

function changeTooltipText(btn, text) {
  const tip = btn.querySelector("div");
  tip.innerText = text;
  tip.style.visibility = "visible";
}

function showTooltip() {
  const tip = this.querySelector("div");
  tip.innerText = turn ? "x" : "o";
  tip.style.visibility = "visible";
}

function hideTooltip() {
  const tip = this.querySelector("div");
  tip.style.visibility = "hidden";
}

function disableGrid(grid) {
  grid.querySelectorAll('.cell').forEach(btn => {
    btn.disabled = true;
  });
}

function enableGrid(grid) {
  grid.querySelectorAll('.cell').forEach(btn => {
    btn.disabled = false;
  });
}

export { createCellButton, removeHover, addHover, showTooltip, hideTooltip, changeTooltipText, disableGrid, enableGrid };