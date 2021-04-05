import { Chessground } from "chessground";
import { initialize as initializeReceiver } from "./receiver";
import { initialize as initializeSender, join } from "./sender";
import Peer from "peerjs";

if (module.hot) {
  module.hot.accept();
}
let path = location.pathname.substr(1);

if (path) {
  initializeSender();
  setTimeout(() => {
    join(path);
  }, 1000);
} else {
  initializeReceiver();
}

const config = { fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" };
const board = document.getElementById("board");
const ground = Chessground(board, config);
