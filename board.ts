import { send } from "./protocol";
import { Config } from "chessground/config";
import { Chessground } from "chessground";
import { getRandomPuzzle } from "./puzzles";

function afterMove(orig, dest, capturedPiece) {
  send({ command: "move", orig, dest, capturedPiece });
  window.ground.set({
    movable: { color: oppositeColor(window.ground.state.movable.color) },
  });
}

function oppositeColor(color) {
  return color === "white" ? "black" : "white";
}

function getColorFromFen(fen) {
  const colorChar = fen.split(" ")[1];
  return colorChar === "w" ? "white" : "black";
}

const puzzle = getRandomPuzzle();

export function initBoard() {
  const board = document.getElementById("board");
  addMouseEvents(board);

  const config: Config = {
    fen: puzzle.FEN,
    movable: {
      free: true,
      color: getColorFromFen(puzzle.FEN),
      showDests: false,
    },
    events: {
      move: afterMove,
    },
  };
  const ground = Chessground(board, config);
  window.ground = ground;
}

function addMouseEvents(board) {
  let timerId;
  board.addEventListener("mousemove", (e) => {
    if (timerId) return;
    timerId = setTimeout(() => {
      send({ command: "mousepos", x: e.offsetX, y: e.offsetY });
      timerId = undefined;
    }, 50);
  });
}
