from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from possible_moves import get_starting_positions, get_possible_moves
from minimax import get_bot_move

app = Flask(__name__)
cors = CORS(app)
# flask --app server run

not_json_error_response = {
    "answer": "false",
    "message": "Request body must be in JSON format",
}


@app.post("/possible_moves")
@cross_origin()
def possible_moves_endpoint():
    if request.is_json:
        data = request.get_json()
        try:
            my_dots = list(map(convert_dot_to_python, data["myDots"]))
            another_dots = list(map(convert_dot_to_python, data["anotherDots"]))
            possible_moves = get_possible_moves(
                my_dots, another_dots, data["width"], data["height"]
            )

        except:
            print("ERROR: Wrong request body format")
            return {
                "answer": "false",
                "message": "Provided request body is in wrong format, expected: { 'myDots': *array of dots*, 'anotherDots': *array of dots*, 'width': *int*, 'height': *int* }",
            }

        result = []
        for move, changes in possible_moves.items():
            result.append(
                {
                    "dot": convert_dot_to_send(move)["dot"],
                    "changes": list(map(convert_dot_to_send, changes)),
                }
            )

        return {"answer": result}

    else:
        return not_json_error_response


@app.post("/bot_move")
@cross_origin()
def bot_move_endpoint():
    if request.is_json:
        data = request.get_json()
        try:
            bot_dots = list(map(convert_dot_to_python, data["botDots"]))
            another_dots = list(map(convert_dot_to_python, data["anotherDots"]))

            bot_move, changes, possible_moves = get_bot_move(
                bot_dots, another_dots, data["width"], data["height"]
            )

            bot_move_to_send = convert_dot_to_send(bot_move)
            changes_to_send = list(map(convert_dot_to_send, changes))
            possible_moves_to_send = list(map(convert_dot_to_send, possible_moves))

            return {
                "answer": {
                    "dot": bot_move_to_send["dot"],
                    "changes": changes_to_send,
                    "possibleMoves": possible_moves_to_send,
                }
            }
        except:
            return {
                "answer": "false",
                "message": "Provided request body is in wrong format, expected: { 'botDots': *array of dots*, 'anotherDots': *array of dots*, 'width': *int*, 'height': *int* }",
            }
    else:
        return not_json_error_response


@app.post("/starting_positions")
@cross_origin()
def starting_positions_endpoint():

    if request.is_json:
        data = request.get_json()
        result = get_starting_positions(data["width"], data["height"])
        if result != None:
            black_dots, white_dots, possible_moves = result
            black_dots = list(map(convert_dot_to_send, black_dots))
            white_dots = list(map(convert_dot_to_send, white_dots))

            possible_moves_to_send = list(
                map(convert_dot_to_send, possible_moves.keys())
            )
            changes = [
                list(map(convert_dot_to_send, changes_list))
                for changes_list in possible_moves.values()
            ]

            for i in range(len(possible_moves_to_send)):
                possible_moves_to_send[i]["changes"] = changes[i]

            return jsonify(
                {
                    "answer": {
                        "blackDots": black_dots,
                        "whiteDots": white_dots,
                        "possibleMoves": possible_moves_to_send,
                    }
                }
            )
        else:
            return {
                "answer": "false",
                "message": "Width and height must be even numbers",
            }

    else:
        return not_json_error_response


def convert_dot_to_send(dot_tuple):
    if len(dot_tuple) != 2:
        print("ERROR: Wrong tuple provided to create a dot")
    else:
        return {"dot": [dot_tuple[0], dot_tuple[1]]}


def convert_dot_to_python(dot_obj):
    if dot_obj and "dot" in dot_obj and len(dot_obj["dot"]) != 2:
        print(
            "ERROR: Wrong dot object provided to create dot tuple, expected: {'dot': [*int*, *int*]}"
        )
        return

    return tuple(dot_obj["dot"])
