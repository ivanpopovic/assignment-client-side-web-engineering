import config from './config'
import $ from 'jquery'
import ChessBoard from 'chessboardjs'
import Chess from 'chess.js'
import io from 'socket.io-client';

window.$ = $

const socket = io(config.SERVER_URL);

const removeGreySquares = () => {
  $('#board .square-55d63').css('background', '');
};

const greySquare = (square) => {
  let squareEl = $('#board .square-' + square);

  let background = '#a9a9a9';
  if (squareEl.hasClass('black-3c85d') === true) {
    background = '#696969';
  }

  squareEl.css('background', background);
};

const onMouseoverSquare = (square, piece) => {
  var moves = game.moves({
    square: square,
    verbose: true
  });

  if (moves.length === 0) return;

  greySquare(square);

  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
};

const onMouseoutSquare = (square, piece) => {
  removeGreySquares();
};

const onDragStart = (source, piece, position, orientation) => {
  if (game.game_over() === true ||
    (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
    (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
    (orientation === 'white' && piece.search(/^w/) === -1) ||
    (orientation === 'black' && piece.search(/^b/) === -1)) {
    return false;
  }

  return true;
};

const onDrop = (source, target) => {
  removeGreySquares();
  const move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  if (move === null) return 'snapback';

  socket.emit('move', {
    move,
  });
};

const cfg = {
  draggable: true,
  position: 'start',
  onDragStart,
  onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare

};

const board = ChessBoard('board', cfg);
const game = new Chess.Chess();

socket.on('game created', (data) => {
  $('#game-id').html(data.game.id)
})

socket.on('game started', () => {
  board.start(true);
});

socket.on('game joined', (data => {
  $('#game-id').html(data.game.id)
  if (data.player.color !== board.orientation()) {
    board.flip();
  }
  board.position(data.game.fen);
  game.load(data.game.fen);
}))

socket.on('restart', () => {
  game.reset();
  board.position( game.fen(), false );
});

socket.on('move', (data) => {
  game.move(data.move);
  board.position(game.fen());
});

$('#host').click(() => {
  socket.emit('new game');
});

$('#join').click(() => {
  const sessionId = $('#join-id').val();

  if (sessionId !== '') {
    socket.emit('join game', {game: sessionId});
  }
});

$('#restart').click(() => {
  game.reset();
  board.position( game.fen(), false );
  socket.emit( 'restart' );
});
