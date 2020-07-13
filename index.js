import { Chessground } from "chessground";

const config = { fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" };
const board= document.getElementById("board");
const ground = Chessground(board, config);
