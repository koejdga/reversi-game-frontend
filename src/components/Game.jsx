import { GameMode, Player, Winner, WinnerForApi } from "../common";
import Board from "./Board";
import { useEffect, useState } from "react";
import {
  getBotMove,
  getPossibleMoves,
  getStartingPositions,
  getWhoWon,
  gatherStatistics,
} from "../service";
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
  const [winner, setWinner] = useState(null);
  const [gatherStats, setGatherStats] = useState(false);

  const [thinking, setThinking] = useState(false);
  const [playersWithoutMoves, setPlayersWithoutMoves] = useState(0);
  const [noMoves, setNoMoves] = useState(false);

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
    } else if (noMoves) {
      setNoMoves(false);
      changeDots(null, null);
    } else {
      setShowAlert(true);
    }
  };

  const changeDots = async (moveCoords, changes) => {
    setThinking(true);
    setShowAlert(false);

    let white = whiteCircles;
    let black = blackCircles;
    if (moveCoords === null && changes === null) {
      console.log("change dots pass turn");
      console.log("isWhiteTurn");
      console.log(isWhiteTurn);
      return;
    } else {
      // update white and black circles after the move
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
    }

    // isWhiteTurn represents the move that already happened, so !isWhiteTurn represents the next move that is about to happen
    let moves;
    let result;
    if (state === Player.USER) {
      result = await getBotMove(
        !isWhiteTurn ? white : black,
        !isWhiteTurn ? black : white,
        props.width,
        props.height
      );
      moves = result.possibleMoves;
      setBotMove(result.botMove);
      setChanges(result.changes);
    } else {
      result = await getPossibleMoves(
        !isWhiteTurn ? white : black,
        !isWhiteTurn ? black : white,
        props.width,
        props.height
      );

      if (result.winner !== undefined) {
        switch (result.winner) {
          case WinnerForApi.THIS:
            setWinner(!isWhiteTurn ? Winner.WHITE : Winner.BLACK);
            break;
          case WinnerForApi.NOT_THIS:
            setWinner(!isWhiteTurn ? Winner.BLACK : Winner.WHITE);
            break;
          case WinnerForApi.TIE:
            setWinner(Winner.TIE);
            break;
          default:
            break;
        }
        setThinking(false);
        return;
      }

      moves = result.possibleMoves;
      setChanges(result.changes);
      setBotMove(null);
    }

    setIsWhiteTurn(!isWhiteTurn);
    setState(isFirstPlayerTurn ? props.secondPlayer : props.firstPlayer);
    setIsFirstPlayerTurn(!isFirstPlayerTurn);

    setPossibleMoves(moves);
    setThinking(false);
  };

  useEffect(() => {
    // not the end of the game, but we need to pass turn to another player
    if (possibleMoves.length === 0 && !thinking) {
      setPlayersWithoutMoves(playersWithoutMoves + 1);
      setNoMoves(true);
      // setTimeout(() => changeDots(null, null), 3000);
    }
  }, [possibleMoves, thinking]);

  useEffect(() => {
    if (playersWithoutMoves === 2) {
      console.log("both players are without moves");
    } else {
      console.log("playersWithoutMoves = " + playersWithoutMoves);
    }
  }, [playersWithoutMoves]);

  const endGame = async () => {
    const winner = await getWhoWon(blackCircles, whiteCircles);
    console.log("End game");

    if (winner === "tie") {
      setWinner(Winner.TIE);
    } else if (winner === "this") {
      setWinner(Winner.BLACK);
    } else if (winner === "not_this") {
      setWinner(Winner.WHITE);
    }

    console.log(gatherStats);
    if (gatherStats) {
      gatherStatistics();
    }
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
        {!winner && (
          <h3 style={{ padding: "0.5rem" }}>
            Ходить {isFirstPlayerTurn ? firstPlayerName : secondPlayerName}
          </h3>
        )}
        {winner && (
          <h3
            style={{
              backgroundColor: "lightgreen",
              padding: "0.5rem",
              width: "15rem",
              textAlign: "center",
            }}
          >
            {winner === "tie"
              ? "Нічия"
              : winner === "black"
              ? `Перемагає ${firstPlayerName}`
              : `Перемагає ${secondPlayerName}`}
          </h3>
        )}

        {possibleMoves.length === 0 && !thinking && !winner && (
          <h4>Немає доступних ходів</h4>
        )}

        <Board
          width={props.width}
          height={props.height}
          holes={props.holes}
          gameMode={winner ? GameMode.ENDED : GameMode.PLAYING}
          highlightPossibleMoves={!winner}
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
          <button
            type="button"
            id="next-button"
            onClick={gameFlow}
            disabled={winner}
          >
            Далі
          </button>

          <button
            style={{ marginTop: "1rem" }}
            type="button"
            id="next-button"
            onClick={endGame}
          >
            Завершити
          </button>
          <div>
            <input
              type="checkbox"
              name="gather-stats"
              id="gather-stats"
              value={gatherStats}
              onChange={() => setGatherStats(!gatherStats)}
              style={{ marginRight: "0.5rem" }}
            />
            <label htmlFor="gather-stats">Зберегти статистику</label>
          </div>
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
