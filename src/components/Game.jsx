import {
  GameMode,
  Player,
  Winner,
  WinnerForApi,
  defaultBlackDots,
  defaultWhiteDots,
} from "../common";
import Board from "./Board";
import { useEffect, useState } from "react";
import {
  getBotMove,
  getPossibleMoves,
  getWhoWon,
  gatherStatistics,
} from "../service";
import "./Game.css";
import { getPlayerNames } from "../utils";

export default function Game(props) {
  const [whiteCircles, setWhiteCircles] = useState(
    props.whiteDots || defaultWhiteDots
  );
  const [blackCircles, setBlackCircles] = useState(
    props.blackDots || defaultBlackDots
  );
  const [holes, setHoles] = useState(props.blackDots || []);
  const [possibleMoves, setPossibleMoves] = useState(null);

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
    const firstPossibleMoves = async () => {
      if (state === Player.USER) {
        const result = await getPossibleMoves(
          blackCircles,
          whiteCircles,
          props.width,
          props.height
        );

        setPossibleMoves(result.possibleMoves);
        setChanges(result.changes);
      } else {
        const result = await getBotMove(
          blackCircles,
          whiteCircles,
          props.width,
          props.height
        );

        setBotMove(result.botMove);
        setPossibleMoves(result.possibleMoves);
        setChanges(result.changes);
      }
    };
    firstPossibleMoves();
  }, []);

  const userPlayed = async (userMoveCoords) => {
    if (possibleMoves.includes(userMoveCoords)) {
      const index = possibleMoves.indexOf(userMoveCoords);
      changeDots(userMoveCoords, changes[index]);
    } else {
      console.log("ERROR: Invalid user move");
    }
  };

  const gameFlow = async () => {
    if (noMoves) {
      setNoMoves(false);
      changeDots(null, null);
    } else if (state === Player.BOT) {
      changeDots(botMove, changes);
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

      setBotMove(result.botMove);
      moves = result.possibleMoves;
      setChanges(result.changes);
    } else {
      result = await getPossibleMoves(
        !isWhiteTurn ? white : black,
        !isWhiteTurn ? black : white,
        props.width,
        props.height
      );

      setBotMove(null);
      moves = result.possibleMoves;
      setChanges(result.changes);
    }

    if (result.winner !== undefined) {
      console.log("looking for winner");
      switch (result.winner) {
        case WinnerForApi.THIS:
          setWinner(!isWhiteTurn ? Winner.WHITE : Winner.BLACK);
          break;
        case WinnerForApi.NOT_THIS:
          setWinner(!isWhiteTurn ? Winner.BLACK : Winner.WHITE);
          break;
        case WinnerForApi.TIE:
          console.log("set tie in changeDots");

          setWinner(Winner.TIE);
          break;
        default:
          break;
      }
      setThinking(false);
      return;
    }

    setIsWhiteTurn(!isWhiteTurn);
    setState(isFirstPlayerTurn ? props.secondPlayer : props.firstPlayer);
    setIsFirstPlayerTurn(!isFirstPlayerTurn);

    setPossibleMoves(moves);
    setThinking(false);
  };

  const endGame = async () => {
    const winner = await getWhoWon(blackCircles, whiteCircles);

    if (winner === "tie") {
      console.log("set tie in endGame");
      setWinner(Winner.TIE);
    } else if (winner === "this") {
      setWinner(Winner.BLACK);
    } else if (winner === "not_this") {
      setWinner(Winner.WHITE);
    }

    if (gatherStats) {
      gatherStatistics(props.width, props.height);
    }

    console.log("END GAME ENDED");
  };

  useEffect(() => {
    // not the end of the game, but we need to pass turn to another player
    if (
      possibleMoves &&
      possibleMoves.length === 0 &&
      !thinking &&
      playersWithoutMoves < 2
    ) {
      setPlayersWithoutMoves(playersWithoutMoves + 1);
      setNoMoves(true);
    }
  }, [possibleMoves, thinking, playersWithoutMoves]);

  useEffect(() => {
    if (playersWithoutMoves === 2) {
      endGame();
    }
  }, [playersWithoutMoves]);

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

        {possibleMoves &&
          possibleMoves.length === 0 &&
          !thinking &&
          !winner && <h4>Немає доступних ходів</h4>}

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
            disabled={winner || thinking}
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
