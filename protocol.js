export function processData(data){
    console.log("Data recieved", data);
    const dataArr = data.split(":");
    const command = dataArr[0];
    const board = document.getElementById("board");
    switch (command) {
      case "mousepos":
        const coords = dataArr[1].split(",");
        const [x, y] = coords;
        const cursor = document.getElementById("cursor");
        cursor.style.left = `${
          parseInt(board.getBoundingClientRect().x) + parseInt(x)
        }px`;
        cursor.style.top = `${
          parseInt(board.getBoundingClientRect().y) + parseInt(y)
        }px`;
        break;
    }

}
