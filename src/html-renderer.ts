const createElement = (col) => {
  const div = document.createElement("div");
  div.classList.add("board");
  div.style.display = "inline-block";
  div.style.marginLeft = "10px";
  div.style.height = "6px";
  div.style.width = "6px";
  div.style.backgroundColor =
    col === 0
      ? "white"
      : col === 1
      ? "cornflowerblue"
      : col === 2
      ? "gray"
      : "silver";
  div.style.borderRadius = "90%";

  return div;
};

export const paint = (game: number[][], lives: number, score: number) => {
  document.body.innerHTML = `Lives: ${lives}, Score: ${score}`;

  game.forEach((row) => {
    const rowContainer = document.createElement("div");
    row.forEach((col) => rowContainer.appendChild(createElement(col)));
    document.body.appendChild(rowContainer);
  });
};
