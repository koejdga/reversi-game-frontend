const express = require("express");
const app = express();
var cors = require("cors");
const port = 8080;

const pl = require("tau-prolog");
require("tau-prolog/modules/lists")(pl);

app.use(express.json());
app.use(cors());

const RESULT_VAR_NAME = "Res";

const session = pl.create();
files_to_consult = [
  "logic.pl",
  "possible_moves.pl",
  "evaluate_functions.pl",
  "minimax.pl",
];

const consultFiles = async (files) => {
  for (const file of files) {
    await new Promise((resolve, reject) => {
      session.consult(file, {
        success: function () {
          console.log(`${file} consulted successfully`);
          resolve();
        },
        error: function (err) {
          console.log(`Error consulting ${file} file`);
          console.log(session.format_error(err));
          reject(err);
        },
      });
    });
  }
};

consultFiles(files_to_consult)
  .then(() => {
    console.log("All files consulted successfully");
  })
  .catch((error) => {
    console.error("Error consulting files:", error);
  });

function handlePrologQuery(query, convert, res) {
  session.query(query, {
    success: function () {
      // console.log(query);
      session.answer({
        success: function (answer) {
          const result = convert(answer);
          res.json({ answer: result == undefined ? "false" : result });
        },
        fail: function () {
          console.log("false");
          res.json({ answer: "false" });
        },
        error: function (err) {
          console.log("Error while returning answer");
          console.log(session.format_error(err));
        },
        limit: function () {
          console.log("Limit exceeded");
        },
      });
    },
  });
}

function fromPrologToList(xs) {
  var arr = [];
  while (pl.type.is_term(xs) && xs.indicator === "./2") {
    arr.push(xs.args[0]);
    xs = xs.args[1];
  }
  if (pl.type.is_term(xs) && xs.indicator === "[]/0") return arr;
  return null;
}

function convertToPrologDot(arr) {
  if (arr.dot == undefined || arr.dot.length !== 2) {
    console.log("ERROR: invalid object provided to create a dot");
    return;
  }
  return `dot(${arr.dot[0]}.0, ${arr.dot[1]}.0)`;
}

function convertToPrologDots(list) {
  return "[" + list.map((x) => convertToPrologDot(x)).join(", ") + "]";
}

function convertDotToSend(prologDot) {
  const coords = prologDot.args.map((number) => number.value);
  return { dot: coords };
}

function convertDotsToSend(list) {
  // WHAT IS DOT? Example: dot(1,3)
  return list.map((prologDot) => convertDotToSend(prologDot));
}

function convertMoveToSend(prologMove) {
  const dotObj = convertDotToSend(prologMove.args[0]);
  const changesList = convertDotsToSend(fromPrologToList(prologMove.args[1]));
  return { dot: dotObj.dot, changes: changesList };
}

function convertMovesToSend(list) {
  // WHAT IS MOVE? Example: move(dot(3,1),[dot(2,1)])
  return list.map((item) => convertMoveToSend(item));
}

app.post("/possible_moves", (req, res) => {
  const { myDots, anotherDots, width, height, holes } = req.body;
  const myDotsConverted = convertToPrologDots(myDots);
  const anotherDotsConverted = convertToPrologDots(anotherDots);
  const holesConverted = convertToPrologDots(holes);

  const query = `get_possible_moves_for_player(${myDotsConverted}, ${anotherDotsConverted}, ${width}, ${height}, ${holesConverted}, PossibleMoves, Win).`;
  const convert = (prologResult) => {
    const list = fromPrologToList(prologResult.lookup("PossibleMoves"));

    let result = { possibleMoves: convertMovesToSend(list) };
    if (list.length === 0) {
      const win = prologResult.lookup("Win");
      if (["tie", "this", "not_this"].includes(win.id)) {
        result["winner"] = win.id;
      }
    }
    return result;
  };
  handlePrologQuery(query, convert, res);
});

app.post("/bot_move", (req, res) => {
  const { botDots, anotherDots, width, height, holes } = req.body;
  const botDotsConverted = convertToPrologDots(botDots);
  const anotherDotsConverted = convertToPrologDots(anotherDots);
  const holesConverted = convertToPrologDots(holes);

  const query = `choose_bot_move(${botDotsConverted}, ${anotherDotsConverted}, ${width}, ${height}, ${holesConverted}, Move, PossibleMoves, Win).`;
  const convert = (prologResult) => {
    let move;
    if (prologResult.lookup("Move").ground) {
      move = convertMoveToSend(prologResult.lookup("Move"));
    } else {
      move = { dot: null, changes: [] };
    }
    const possibleMoves = convertMovesToSend(
      fromPrologToList(prologResult.lookup("PossibleMoves"))
    );

    let result = {
      dot: move.dot,
      changes: move.changes,
      possibleMoves: possibleMoves,
    };

    if (prologResult.lookup("Win").ground) {
      result["winner"] = prologResult.lookup("Win").id;
    }

    return result;
  };

  handlePrologQuery(query, convert, res);
});

app.post("/starting_positions", (req, res) => {
  const { width, height, holes } = req.body;
  const holesConverted = convertToPrologDots(holes);

  const query = `get_starting_positions(${width}, ${height}, ${holesConverted}, BlackDots, WhiteDots, PossibleBlackMoves).`;
  const convert = (prologResult) => {
    const blackDots = convertDotsToSend(
      fromPrologToList(prologResult.lookup("BlackDots"))
    );
    const whiteDots = convertDotsToSend(
      fromPrologToList(prologResult.lookup("WhiteDots"))
    );
    const possibleBlackMoves = convertMovesToSend(
      fromPrologToList(prologResult.lookup("PossibleBlackMoves"))
    );
    return {
      blackDots: blackDots,
      whiteDots: whiteDots,
      possibleMoves: possibleBlackMoves,
    };
  };
  handlePrologQuery(query, convert, res);
});

app.post("/who_won", (req, res) => {
  const { myDots, anotherDots } = req.body;

  const myDotsConverted = convertToPrologDots(myDots);
  const anotherDotsConverted = convertToPrologDots(anotherDots);

  const query = `who_won(${myDotsConverted}, ${anotherDotsConverted}, ${RESULT_VAR_NAME}).`;
  const convert = (prologResult) => {
    const result = prologResult.lookup(`${RESULT_VAR_NAME}`);
    return result.id;
  };
  handlePrologQuery(query, convert, res);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
