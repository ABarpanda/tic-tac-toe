let ws;
let playerSymbol = null;
let isMyTurn = false;

const board = document.getElementById("board");
const instruct = document.getElementById("instructions");
const moves = {
  "X": [],
  "O": []
};

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

    ws.onmessage = (message) => {
        const data = JSON.parse(message.data);

        if (data.type === "init") {
            console.log("Joined as player", data.player);
            instruct.innerText = `Joined as player ${data.player}\nWaiting for player 2`;
        }

        if (data.type === "start") {
            playerSymbol = data.symbol;
            isMyTurn = playerSymbol === "X";
            createBoard();
            alert(`Game started! You are ${playerSymbol}`);
            instruct.innerText = `You are ${playerSymbol} \nX goes first`;
        }

        if (data.type === "move") {
            updateCell(data.index, playerSymbol === "X" ? "O" : "X");
            isMyTurn = true;
            checkWin()
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
    if (!isMyTurn || cell.textContent !== "") {
        instruct.innerHTML = `Please wait for your turn`;
        return;
    };
    const index = cell.dataset.index;
    updateCell(index, playerSymbol);
    ws.send(JSON.stringify({ type: "move", index: index }));
    isMyTurn = false;
}

function updateCell(index, symbol) {
    const cell = board.querySelector(`[data-index='${index}']`);
    if (cell && cell.textContent === "") {
        cell.textContent = symbol;
        if (symbol === "X" || symbol === "O") {
            moves[symbol].push(Number(index));
        }
    }
    console.log(moves);
}

function checkWin(){
    wins = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ];
    x_cells = moves["X"];
    o_cells = moves["O"];
    x_cells.sort(function(a, b){return a - b});
    o_cells.sort(function(a, b){return a - b});
    
    return;
}