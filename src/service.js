import {
  convertCoordListToSend,
  convertDotsToCoordsList,
  convertDotToCoords,
  convertChangesToCoords,
} from "./utils";
import axios from "axios";

const serverLink = process.env.REACT_APP_GAME_LOGIC_SERVER;

export const getPossibleMoves = async (myDots, anotherDots, width, height) => {
  const startTime = performance.now();

  try {
    const requestBody = {
      myDots: convertCoordListToSend(myDots),
      anotherDots: convertCoordListToSend(anotherDots),
      width: width,
      height: height,
    };
    const response = await axios.post(
      serverLink + "/possible_moves",
      requestBody
    );

    if (response.data.answer === "false") {
      return;
    }

    const possibleMoves = convertDotsToCoordsList(response.data.answer);
    const changes = response.data.answer.map((move) =>
      convertChangesToCoords(move)
    );
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    console.log("getPossibleMoves");
    console.log(`Execution time: ${executionTime} milliseconds`);
    return { possibleMoves: possibleMoves, changes: changes };
  } catch (error) {
    console.error(error);
  }
};

export const getBotMove = async (botDots, anotherDots, width, height) => {
  const startTime = performance.now();

  try {
    const requestBody = {
      botDots: convertCoordListToSend(botDots),
      anotherDots: convertCoordListToSend(anotherDots),
      width: width,
      height: height,
    };

    const response = await axios.post(serverLink + "/bot_move", requestBody);

    if (response.data.answer === "false") {
      return;
    }

    const botMove = convertDotToCoords(response.data.answer);
    const changes = convertDotsToCoordsList(response.data.answer.changes);
    const possibleMoves = convertDotsToCoordsList(
      response.data.answer.possibleMoves
    );
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    console.log("getBotMove");
    console.log(`Execution time: ${executionTime} milliseconds`);
    return { botMove: botMove, changes: changes, possibleMoves: possibleMoves };
  } catch (error) {
    console.log(error);
  }
};

export const getStartingPositions = async (width, height) => {
  const startTime = performance.now();

  try {
    const requestBody = { width: width, height: height };
    const response = await axios.post(
      serverLink + "/starting_positions",
      requestBody
    );
    if (response.data.answer === "false") {
      return;
    }

    const result = {
      blackDots: convertDotsToCoordsList(response.data.answer.blackDots),
      whiteDots: convertDotsToCoordsList(response.data.answer.whiteDots),
      possibleMoves: convertDotsToCoordsList(
        response.data.answer.possibleMoves
      ),
      changes: response.data.answer.possibleMoves.map((move) =>
        convertChangesToCoords(move)
      ),
    };
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    console.log("getStartingPositions");
    console.log(`Execution time: ${executionTime} milliseconds`);
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const getChanges = async (move, myDots, anotherDots, width, height) => {
  const startTime = performance.now();

  try {
    const requestBody = {
      move: move,
      myDots: myDots,
      anotherDots: anotherDots,
      width: width,
      height: height,
    };
    const response = await axios.post(serverLink + "/changes", requestBody);
    if (response.data.answer === "false") {
      return;
    }

    const result = convertDotsToCoordsList(response.data.answer);
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    console.log("getChanges");
    console.log(`Execution time: ${executionTime} milliseconds`);
    return result;
  } catch (error) {
    console.log(error);
  }
};
