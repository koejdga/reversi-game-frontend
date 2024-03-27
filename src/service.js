import {
  convertCoordListToSend,
  convertDotsToCoordsList,
  convertDotToCoords,
  convertChangesToCoords,
} from "./utils";
import axios from "axios";

const serverLink = process.env.REACT_APP_GAME_LOGIC_SERVER;

const times_for_requests = [];

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

    const possibleMoves = convertDotsToCoordsList(
      response.data.answer.possibleMoves
    );

    if (possibleMoves.length === 0) {
      if (response.data.answer.win !== undefined) {
        const winner = response.data.answer.win;
        console.log("winner: " + winner);
        return { winner: winner };
      } else {
        console.log("no winner");
        // return signal to send request for another player
      }
    }

    const changes = response.data.answer.possibleMoves.map((move) =>
      convertChangesToCoords(move)
    );

    const endTime = performance.now();
    const executionTime = endTime - startTime;
    // console.log("getPossibleMoves");
    // console.log(`Execution time: ${executionTime} milliseconds`);
    times_for_requests.push({ getPossibleMoves: executionTime });

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

    const botMove =
      response.data.answer.dot != null
        ? convertDotToCoords(response.data.answer)
        : null;
    const changes = convertDotsToCoordsList(response.data.answer.changes);
    const possibleMoves = convertDotsToCoordsList(
      response.data.answer.possibleMoves
    );
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    // console.log("getBotMove");
    // console.log(`Execution time: ${executionTime} milliseconds`);
    times_for_requests.push({ getBotMove: executionTime });

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
    // console.log("getStartingPositions");
    // console.log(`Execution time: ${executionTime} milliseconds`);
    times_for_requests.push({ getStartingPositions: executionTime });

    return result;
  } catch (error) {
    console.log(error);
  }
};

// possible responses: "this", "not_this", "tie"
export const getWhoWon = async (myDots, anotherDots) => {
  const startTime = performance.now();

  try {
    const requestBody = {
      myDots: convertCoordListToSend(myDots),
      anotherDots: convertCoordListToSend(anotherDots),
    };
    const response = await axios.post(serverLink + "/who_won", requestBody);

    if (response.data.answer === "false") {
      console.log("ERROR: getWhoWon returned false");
      return;
    }

    const result = response.data.answer;

    const endTime = performance.now();
    const executionTime = endTime - startTime;
    // console.log("getWhoWon");
    // console.log(`Execution time: ${executionTime} milliseconds`);
    times_for_requests.push({ getWhoWon: executionTime });

    return result;
  } catch (error) {
    console.log(error);
  }
};

export const gatherStatistics = () => {
  console.log("gather_statistics");
  console.log(times_for_requests);
  const objList = [{ value1: 10, value2: 20 }, { value1: 30 }, { value3: 40 }];

  calculateAverageAndWriteJSON(objList, "output.json");
};

function calculateAverageAndWriteJSON(objList, filename) {
  let total = 0;
  let count = 0;

  for (let obj of objList) {
    for (let key in obj) {
      if (typeof obj[key] === "number") {
        total += obj[key];
        count++;
        break;
      } else {
        console.log("ERROR: not numeric value found in statistics list values");
      }
    }
  }

  const average = count > 0 ? total / count : 0;

  const data = {
    average: average,
    list: objList,
  };

  const jsonString = JSON.stringify(data, null, 2);

  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
