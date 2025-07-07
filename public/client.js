let ws;
let playerSymbol = null;
let isMyTurn = false;

const board = document.getElementById("board");

function joinRoom() {
  const roomName = document.getElementById("room").value;
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    ws = new WebSocket(`${protocol}://${location.host}`);


    ws.onopen = () => {
    ws.send(JSON.stringify({ type: "join", room: roomName }));
    };

    ws.onerror = (e) => {
    console.error("❌ WebSocket error", e);
    };

    ws.onclose = () => {
    console.warn("⚠️ WebSocket closed");
    };

    // ws.onmessage = (msg) => {
    // console.log("📨 Message from server:", msg.data);
    // };

  ws.onmessage = (message) => {
    const data = JSON.parse(message.data);

    if (data.type === "init") {
      console.log("Joined as player", data.player);
    }

    if (data.type === "start") {
      playerSymbol = data.symbol;
      isMyTurn = playerSymbol === "X";
      createBoard();
      alert(`Game started! You are ${playerSymbol}`);
    }

    if (data.type === "move") {
      updateCell(data.index, playerSymbol === "X" ? "O" : "X");
      isMyTurn = true;
    }

    if (data.type === "error") {
      alert(data.message);
    }
  };
}

function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.onclick = () => makeMove(cell);
    board.appendChild(cell);
  }
}

function makeMove(cell) {
  if (!isMyTurn || cell.textContent !== "") return;
  const index = cell.dataset.index;
  updateCell(index, playerSymbol);
  ws.send(JSON.stringify({ type: "move", index: index }));
  isMyTurn = false;
}

function updateCell(index, symbol) {
  const cell = board.querySelector(`[data-index='${index}']`);
  if (cell) cell.textContent = symbol;
}
