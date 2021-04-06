import { send } from "./protocol";
import { Config } from "chessground/config";
import { Chessground } from "chessground";

function afterMove(orig, dest, capturedPiece) {
  send({ command: "move", orig, dest, capturedPiece });
}

export function initBoard() {
  const board = document.getElementById("board");
  addMouseEvents(board);
  const config: Config = {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
    movable: {
      free: false,
      color: "white",
      dests: new Map([["e2", ["e4"]]]),
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
