import { GameMode, Player } from "../common";
import Board from "./Board";
import { useEffect, useState } from "react";
import { getBotMove, getPossibleMoves, getStartingPositions } from "../service";
import "./Game.css";
import { getPlayerNames } from "../utils";

export default function Game(props) {
  const [whiteCircles, setWhiteCircles] = useState([]);
  const [blackCircles, setBlackCircles] = useState([]);
  const [possibleMoves, setPossibleMoves] = useState([]);

  const [isWhiteTurn, setIsWhiteTurn] = useState(false);
  const [isFirstPlayerTurn, setIsFirstPlayerTurn] = useState(true);
  const [state, setState] = useState(props.firstPlayer);
  const [botMove, setBotMove] = useState(null);
  const [changes, setChanges] = useState([]);

  const [showAlert, setShowAlert] = useState(false);

  const { firstPlayerName, secondPlayerName } = getPlayerNames(
    props.firstPlayer,
    props.secondPlayer
  );

  useEffect(() => {
    const getPositions = async () => {
      const result = await getStartingPositions(props.width, props.height);
      setBlackCircles(result.blackDots);
      setWhiteCircles(result.whiteDots);
      setPossibleMoves(result.possibleMoves);
      setChanges(result.changes);
    };
    getPositions();
  }, [props.height, props.width]);

  const userPlayed = async (userMoveCoords) => {
    if (possibleMoves.includes(userMoveCoords)) {
      const index = possibleMoves.indexOf(userMoveCoords);
      changeDots(userMoveCoords, changes[index]);
    } else {
      console.log("ERROR: Invalid user move");
    }
  };

  const gameFlow = async () => {
    if (state === Player.BOT) {
      changeDots(botMove, changes);
    } else {
      setShowAlert(true);
    }
  };

  const changeDots = async (moveCoords, changes) => {
    setShowAlert(false);

    let white;
    let black;
    if (isWhiteTurn) {
      white = [...whiteCircles, moveCoords, ...changes];
      black = blackCircles.filter((item) => !changes.includes(item));
    } else {
      black = [...blackCircles, moveCoords, ...changes];
      white = whiteCircles.filter((item) => !changes.includes(item));
    }

    setWhiteCircles(white);
    setBlackCircles(black);
    setPossibleMoves([]);

    // isWhiteTurn represents the move that already happened, so !isWhiteTurn represents the next move that is about to happen
    let moves;
    if (state === Player.USER) {
      const result = await getBotMove(
        !isWhiteTurn ? white : black,
        !isWhiteTurn ? black : white,
        props.width,
        props.height
      );
      moves = result.possibleMoves;
      setBotMove(result.botMove);
      setChanges(result.changes);
    } else {
      const result = await getPossibleMoves(
        !isWhiteTurn ? white : black,
        !isWhiteTurn ? black : white,
        props.width,
        props.height
      );
      moves = result.possibleMoves;
      setChanges(result.changes);
      setBotMove(null);
    }

    setPossibleMoves(moves);
    setIsWhiteTurn(!isWhiteTurn);

    setState(isFirstPlayerTurn ? props.secondPlayer : props.firstPlayer);
    setIsFirstPlayerTurn(!isFirstPlayerTurn);
  };

  return (
    <div className="container">
      <div className="main">
        <h1>Реверсі</h1>
        <div className="scores">
          <div>
            <p>{firstPlayerName}</p>
            <p>{blackCircles.length}</p>
          </div>
          <div>
            <p>{secondPlayerName}</p>
            <p>{whiteCircles.length}</p>
          </div>
        </div>
        <h3>Ходить {isFirstPlayerTurn ? firstPlayerName : secondPlayerName}</h3>
        <Board
          width={props.width}
          height={props.height}
          holes={props.holes}
          gameMode={GameMode.PLAYING}
          highlightPossibleMoves={true}
          userTurn={state === Player.USER}
          userPlayed={userPlayed}
          whiteCircles={whiteCircles}
          blackCircles={blackCircles}
          possibleMoves={possibleMoves}
        />
        <div
          style={{
            display:
              props.firstPlayer === Player.USER &&
              props.secondPlayer === Player.USER
                ? "none"
                : "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5em",
          }}
        >
          {showAlert && <p id="alert">Зробіть хід</p>}
          <button type="button" id="next-button" onClick={gameFlow}>
            Далі
          </button>
        </div>
        <button
          type="button"
          className="new-game-button"
          onClick={() => props.restart()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon icon-tabler icons-tabler-outline icon-tabler-rotate"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M19.95 11a8 8 0 1 0 -.5 4m.5 5v-5h-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
