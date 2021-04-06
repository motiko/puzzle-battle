
export function getCursor(id) {
  let results = {};
  return (function () {
    if (results[id]) return results[id];
    const cursor = document.getElementById(`cursor_${id}`);
    if (cursor) {
      results[id] = cursor;
      return cursor;
    }
    const newCursor = document.getElementById("openhand").cloneNode();
    newCursor.className = "cursor";
    newCursor.style.display = "block";
    newCursor.id = `cursor_${id}`;
    newCursor.alt = "";
    document.body.appendChild(newCursor);
    return newCursor;
  })();
}

export function boardSize() {
  let boardSize;
  return (function () {
    if (boardSize) return boardSize;
    const board = document.getElementById("board");
    boardSize = board.getBoundingClientRect();
    return boardSize;
  })();
}
