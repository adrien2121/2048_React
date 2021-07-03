const SIZE_OF_GAME = 4;
const WIN_NUMBER = 2048;


class App extends React.Component {
  constructor(props) {
    super(props);

    // State initial du tableau de jeu
    this.state = {
      board: null,
      score: 0,
      gameOver: false,
      win: false,
      message: null,
      keyPressRef : this.handleKeyPress.bind(this)
    };
  }


  // Fonction pour trouver tous les coordonnees de cases vides
  // Elle retourne un tableau ou chaque element est un tuple
  // (x, y) situant la case vide
  retrieveEmptyCells(board) {
    let emptyCells = [];

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {

        if (board[i][j] == 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    return emptyCells;
  }


  // Fonction pour choisir un nombre aleatoire entre 2 et 4
  startingRandomNum() {
    let nums = [2, 4];
    let selected = nums[Math.floor(Math.random() * 2)];
    return selected;
  }


  // Fonction placant le nombre aleatoire choisit sur une case vide
  // choisit au hasard
  putRandom(board) {
    let emptyCells = this.retrieveEmptyCells(board);
    let emptyCellsSize = emptyCells.length; // variable pour alleger le code
    // On prend une case du tableau vide au hasard
    let emptyRandomCoord = emptyCells[Math.floor(Math.random() * emptyCellsSize)];

    let randomNum = this.startingRandomNum();
    board[emptyRandomCoord[0]][emptyRandomCoord[1]] = randomNum;

    return board;
  }


  // Creation du tableau en placant 2 nombres (2 ou 4) au tout
  // debut de la partie
  boardInitialize(n) {
    let newBoard = [];
    for (let i = 0; i < n; i++) {
      newBoard.push(Array(n).fill(0));
    }

    // Met deux nombres aleatoires
    newBoard = this.putRandom(this.putRandom(newBoard));
    this.setState(
      {
        board: newBoard,
        score: 0,
        gameOver: false,
        message: null
      });

    // Si on recommence une partie a partir dune partie gagnee
    if(this.state.win == true) {
      this.state.win = false;
    }

    let body = document.querySelector('body');
    body.addEventListener('keydown', this.state.keyPressRef, true);
  }


  // Fonction qui verifie si le tableau est en situation de game over
  checkGameOver(gameBoard) {
    let upPossibility = this.swipeUp(gameBoard).board;
    let leftPossibility = this.swipeLeft(gameBoard).board;
    let rightPossibility = this.swipeRight(gameBoard).board;
    let downPossibility = this.swipeDown(gameBoard).board;

    let possibilites = [
      this.changedBoard(gameBoard, upPossibility),
      this.changedBoard(gameBoard, leftPossibility),
      this.changedBoard(gameBoard, rightPossibility),
      this.changedBoard(gameBoard, downPossibility)
    ];

    // si dans tous les coups possibles quon peut jouer le tableau
    // ne change pas, alors cest game over
    for (let i = 0; i < possibilites.length; i++) {
      if (possibilites[i] == true) {
        return false;
      }
    }
    return true;
  }


  // Fonction qui verifie si est a gagne la partie
  verifyWin(gameBoard) {
    for(let i = 0; i < gameBoard.length; i++) {
      for(let j = 0; j < gameBoard.length; j++) {
        if(gameBoard[i][j] >= WIN_NUMBER) {
          this.setState({
            win: true,
            message: "Game won !"
          })

          // enleve la possibilite de continuer a jouer
          let body = document.querySelector('body');
          console.log("BODY : " + body);
          body.removeEventListener('keydown', this.state.keyPressRef, true);
        }
      }
    }
  }


  // Fonction qui verifie si le tableau a change apres un coup joue
  changedBoard(prevBoard, nextBoard) {
    if (JSON.stringify(prevBoard) == JSON.stringify(nextBoard)) {
      return false;
    } else {
      return true;
    }
  }


  // Fonction helper pour swipe qui verifie quelle direction
  // est jouee
  checkDirection(swipeDirFunc, currBoard) {
    let swipeDir= swipeDirFunc(currBoard);

    let prevBoard = currBoard;
    let nextBoard = swipeDir.board;
    if(this.changedBoard(prevBoard, nextBoard)) {
      let dirRand = this.putRandom(swipeDir.board);


      // Il faut aussi regarder si cest 
      // "game over" ou non
      if (this.checkGameOver(dirRand)) {
        this.setState({board: dirRand, gameOver: true, message: "Game Lost !"});
      } else {
        this.setState({board: dirRand, score: this.state.score += swipeDir.score});

        // On regarde si le coup quon a joue nous a mene a la victoire
        this.verifyWin(dirRand);
      }
    }
  }


  // Fonction qui bouge le tableau selon la touche appuyee
  swipe(direction) {

    // si on est pas en situation de "game over"
    if(!this.state.gameOver) {

      if(direction == "up") {
        this.checkDirection(this.swipeUp.bind(this), this.state.board);

      } else if(direction == "right") {
        this.checkDirection(this.swipeRight.bind(this), this.state.board);

      } else if(direction == "left") {
        this.checkDirection(this.swipeLeft.bind(this), this.state.board);

      } else if(direction == "down") {
        this.checkDirection(this.swipeDown.bind(this), this.state.board);

      }

    } else {
      this.setState({message: "Game Lost !"});
    }
  }


  // Fonction qui fait la rotation du tableau a droite pour faciliter
  // le mouvement des cellules quand on bouge le tableau vers le haut
  rightRotation(gameBoard) {
    let rotatedRight = [];

    for (let i = 0; i < gameBoard.length; i++) {
      let row = [];
      for (let j = gameBoard.length - 1; j >= 0; j--) {
        row.push(gameBoard[j][i]);
      }
      rotatedRight.push(row);
    }
    return rotatedRight;
  }


  // Fonction qui fait la rotation du tableau a gauche pour faciliter
  // le mouvement des cellules quand on bouge le tableau vers le bas
  leftRotation(gameBoard) {
    let rotatedLeft = [];

    for (let i = gameBoard.length - 1; i >= 0; i--) {
      let row = [];
      for (let j = gameBoard.length - 1; j >= 0; j--) {
        row.unshift(gameBoard[j][i]);
      }
      rotatedLeft.push(row);
    }
    return rotatedLeft;
  }


  // Fonction pour faire la translation des nombres a droite
  rightShift(rotatedBoard, gameBoard) {

    for (let i = 0; i < rotatedBoard.length; i++) {
      let row = [];
      for (let j = 0; j < rotatedBoard[i].length; j++) {
        let currVal = rotatedBoard[i][j];
        if (currVal == 0) {
          row.unshift(currVal);
        } else {
          row.push(currVal);
        }
      }
      gameBoard.push(row);
    }
    return gameBoard;
  }


  // Fonction pour faire la translation des nombres a gauche
  leftShift(rotatedBoard, gameBoard) {

    for (let i = 0; i < rotatedBoard.length; i++) {
      let row = [];
      for (let j = rotatedBoard[i].length - 1; j >=0; j--) {
        let currVal = rotatedBoard[i][j];
        if (currVal == 0) {
          row.push(currVal);
        } else {
          row.unshift(currVal);
        }
      }
      gameBoard.push(row);
    }
    return gameBoard;
  }


  // Fonction pour combiner les nombres et faire la translation a droite
  rightCombineShift(score, gameBoard) {
    for (let i = 0; i < gameBoard.length; i++) {
      for (let j = gameBoard[i].length - 1; j >= 0; j--) {

        if (gameBoard[i][j] > 0 && gameBoard[i][j] == gameBoard[i][j - 1]) {
          gameBoard[i][j] = gameBoard[i][j] * 2;
          gameBoard[i][j - 1] = 0;
          score += gameBoard[i][j];

        } else if (gameBoard[i][j] == 0 && gameBoard[i][j - 1] > 0) {
          gameBoard[i][j] = gameBoard[i][j - 1];
          gameBoard[i][j - 1] = 0;
        }
      }
    }
    return [score, gameBoard];
  }


  // Fonction pour combiner les nombres et faire la translation a gauche
  leftCombineShift(score, gameBoard) {
    for (let i = 0; i < gameBoard.length; i++) {
      for (let j = 0; j < gameBoard.length; j++) {

        if (gameBoard[i][j] > 0 && gameBoard[i][j] == gameBoard[i][j + 1]) {
          gameBoard[i][j] = gameBoard[i][j] * 2;
          gameBoard[i][j + 1] = 0;
          score += gameBoard[i][j];

        } else if (gameBoard[i][j] == 0 && gameBoard[i][j + 1] > 0) {
          gameBoard[i][j] = gameBoard[i][j + 1];
          gameBoard[i][j + 1] = 0;
        }
      }
    }
    return [score, gameBoard];
  }


  // Fonction qui bouge le tableau vers le haut
  swipeUp(gameBoard) {
    // rotation a droite pour faciliter le deplacement
    let rightRotate = this.rightRotation(gameBoard);

    let board = [];
    board = this.rightShift(rightRotate, board);

    let score = 0;
    [score, board] = this.rightCombineShift(score, board);

    // remet le tableau en place
    board = this.leftRotation(board);

    return {board, score};
  }


  // Fonction qui bouge le tableau vers le bas
  swipeDown(gameBoard) {
    // rotation a droite pour faciliter le deplacement
    let rightRotate = this.rightRotation(gameBoard);

    let board = [];
    board = this.leftShift(rightRotate, board);

    let score = 0;
    [score, board] = this.leftCombineShift(score, board);

    // remet le tableau en place
    board = this.leftRotation(board);

    return {board, score};
  }


  // Fonction qui bouge le tableau a gauche
  swipeLeft(gameBoard) {
    let board = []
    board = this.leftShift(gameBoard, board);

    let score = 0;
    [score, board] = this.leftCombineShift(score, board);

    return {board, score};
  }


  // Fonction qui bouge le tableau a droite
  swipeRight(gameBoard) {
    let board = [];
    board = this.rightShift(gameBoard, board);

    let score = 0;
    [score, board] = this.rightCombineShift(score, board);

    return {board, score};
  }


  componentWillMount() {
    this.boardInitialize(SIZE_OF_GAME);
  }


  // Fonction qui gere les cas ou on appuie sur des touches
  handleKeyPress(a) {
    let left = 37;
    let up = 38;
    let right = 39;
    let down = 40;
    let n = 78;

    switch (a.keyCode) {
      case up :
        this.swipe("up");
        break;

      case down :
        this.swipe("down");
        break;

      case left :
        this.swipe("left");
        break;

      case right:
        this.swipe("right");
        break;

      case n:
        this.boardInitialize(SIZE_OF_GAME);
    }
  }


  render() {
    return ( 
      <div>
        <div className="button" onClick={() => {this.boardInitialize(SIZE_OF_GAME)}}>New Game</div>
        <div className="score">Score = {this.state.score}</div>

        <table>
          {this.state.board.map((row, i) => (<Row row={row} key={i} />))}
        </table>

        <p>{this.state.message}</p>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

