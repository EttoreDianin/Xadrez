const chessboard = document.getElementById('chessboard');
const statusDisplay = document.getElementById('status');
let selectedPiece = null;
let currentPlayer = 'white';

const initialBoard = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
];

function createBoard() {
    chessboard.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            square.dataset.row = row;
            square.dataset.col = col;

            if (initialBoard[row][col]) {
                square.textContent = initialBoard[row][col];
                square.dataset.piece = initialBoard[row][col];
                square.dataset.color = row < 2 ? 'black' : 'white';
            }

            square.addEventListener('click', handleSquareClick);
            chessboard.appendChild(square);
        }
    }
}

function handleSquareClick(e) {
    const square = e.target;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const piece = square.dataset.piece;
    const color = square.dataset.color;

    if (selectedPiece) {
        if (selectedPiece === square) {
            resetSelection();
            return;
        }

        if (isValidMove(selectedPiece, square)) {
            movePiece(selectedPiece, square);
            switchPlayer();
        } else {
            if (color === currentPlayer) {
                selectPiece(square);
            } else {
                resetSelection();
            }
        }
    } else {
        if (piece && color === currentPlayer) {
            selectPiece(square);
        }
    }
}

function selectPiece(square) {
    selectedPiece = square;
    square.classList.add('selected');
    highlightPossibleMoves(square);
}

function resetSelection() {
    if (selectedPiece) {
        selectedPiece.classList.remove('selected');
        clearHighlights();
        selectedPiece = null;
    }
}

function highlightPossibleMoves(square) {
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const piece = square.dataset.piece;
    const color = square.dataset.color;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const targetSquare = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            const originalPiece = targetSquare.dataset.piece;
            const originalColor = targetSquare.dataset.color;
            
            targetSquare.dataset.piece = '';
            targetSquare.dataset.color = '';
            
            if (isValidMove(square, targetSquare)) {
                targetSquare.classList.add('possible-move');
            }
            
            targetSquare.dataset.piece = originalPiece;
            targetSquare.dataset.color = originalColor;
        }
    }
}

function clearHighlights() {
    document.querySelectorAll('.possible-move').forEach(square => {
        square.classList.remove('possible-move');
    });
}

function isValidMove(fromSquare, toSquare) {
    const fromRow = parseInt(fromSquare.dataset.row);
    const fromCol = parseInt(fromSquare.dataset.col);
    const toRow = parseInt(toSquare.dataset.row);
    const toCol = parseInt(toSquare.dataset.col);
    const piece = fromSquare.dataset.piece;
    const color = fromSquare.dataset.color;
    const targetPiece = toSquare.dataset.piece;
    const targetColor = toSquare.dataset.color;

    if (targetColor === color) return false;

    if (piece === '♙' || piece === '♟') {
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        if (toCol === fromCol && !targetPiece) {
            if (toRow === fromRow + direction) return true;
            if (fromRow === startRow && toRow === fromRow + 2*direction && !isPieceBetween(fromRow, fromCol, toRow, toCol)) {
                return true;
            }
        }
        if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction && targetPiece) {
            return true;
        }
        return false;
    }

    if (piece === '♖' || piece === '♜') {
        if (fromRow !== toRow && fromCol !== toCol) return false;
        return isPathClear(fromRow, fromCol, toRow, toCol);
    }

    if (piece === '♘' || piece === '♞') {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    if (piece === '♗' || piece === '♝') {
        if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;
        return isPathClear(fromRow, fromCol, toRow, toCol);
    }

    if (piece === '♕' || piece === '♛') {
        if (fromRow !== toRow && fromCol !== toCol && 
            Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;
        return isPathClear(fromRow, fromCol, toRow, toCol);
    }

    if (piece === '♔' || piece === '♚') {
        return Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1;
    }

    return false;
}

function isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow > fromRow ? 1 : (toRow < fromRow ? -1 : 0);
    const colStep = toCol > fromCol ? 1 : (toCol < fromCol ? -1 : 0);
    
    if (Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol)) {
        let currentRow = fromRow + rowStep;
        let currentCol = fromCol + colStep;
        
        while (currentRow !== toRow && currentCol !== toCol) {
            const square = document.querySelector(`[data-row="${currentRow}"][data-col="${currentCol}"]`);
            if (square.dataset.piece) return false;
            
            currentRow += rowStep;
            currentCol += colStep;
        }
        return true;
    }
    
    if (fromRow === toRow || fromCol === toCol) {
        let currentRow = fromRow;
        let currentCol = fromCol;
        
        if (fromRow === toRow) {
            currentCol += colStep;
            while (currentCol !== toCol) {
                const square = document.querySelector(`[data-row="${currentRow}"][data-col="${currentCol}"]`);
                if (square.dataset.piece) return false;
                currentCol += colStep;
            }
        } else {
            currentRow += rowStep;
            while (currentRow !== toRow) {
                const square = document.querySelector(`[data-row="${currentRow}"][data-col="${currentCol}"]`);
                if (square.dataset.piece) return false;
                currentRow += rowStep;
            }
        }
        return true;
    }
    
    return false;
}

function isPieceBetween(fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow > fromRow ? 1 : (toRow < fromRow ? -1 : 0);
    const colStep = toCol > fromCol ? 1 : (toCol < fromCol ? -1 : 0);
    
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    
    while (currentRow !== toRow || currentCol !== toCol) {
        const square = document.querySelector(`[data-row="${currentRow}"][data-col="${currentCol}"]`);
        if (square.dataset.piece) return true;
        
        currentRow += rowStep;
        currentCol += colStep;
    }
    return false;
}

function movePiece(fromSquare, toSquare) {
    toSquare.textContent = fromSquare.textContent;
    toSquare.dataset.piece = fromSquare.dataset.piece;
    toSquare.dataset.color = fromSquare.dataset.color;
    
    fromSquare.textContent = '';
    delete fromSquare.dataset.piece;
    delete fromSquare.dataset.color;
    
    resetSelection();
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    statusDisplay.textContent = `Vez das ${currentPlayer === 'white' ? 'brancas' : 'pretas'}`;
}

createBoard();
