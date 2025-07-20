function applyTextFormat(tooltip) {
  tooltip.innerText = "x";
  tooltip.style.position = "absolute";
  tooltip.style.paddingLeft = "10px";
  tooltip.style.lineHeight = "0px";
  tooltip.style.marginTop = "-3px";
  tooltip.style.marginLeft = "0px";
  tooltip.style.color = "black";
  tooltip.style.fontSize = "45px";
  tooltip.style.visibility = "hidden"; // hide by default
  tooltip.style.whiteSpace = "nowrap";
  tooltip.style.userSelect = "none";
}

function applyButtonFormat(button) {
  button.style.width = "60px";
  button.style.height = "60px";
  button.style.fontFamily = "sans-serif";
  button.style.fontSize = "30px";
  button.disabled = true; // disable by default
  button.style.position = "relative"; // for tooltip positioning
}

export { applyButtonFormat, applyTextFormat };