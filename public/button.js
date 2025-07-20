import { applyButtonFormat, applyTextFormat } from './format.js';

function createCellButton(index, turn) {
  const button = document.createElement("button");
  button.className = "cell";
  button.id = `tic${index}`;

  applyButtonFormat(button);

  const tooltip = document.createElement("div");
  applyTextFormat(tooltip);
  button.appendChild(tooltip);

  button.onclick = () => {
    insertMove(button);
  };

  return button;
}

export { createCellButton };