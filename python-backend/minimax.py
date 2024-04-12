from evaluate_func_lists import evaluate_function
from constants import white, black, width, height
from possible_moves import get_possible_moves


def minimax(my_dots, another_dots, width, height, maximizing, depth):
    if depth == 0:
        return evaluate_function(my_dots, another_dots, width, height)

    possible_moves = get_possible_moves(my_dots, another_dots, width, height)

    if maximizing:
        best_score = float("-inf")
        for move, changes in possible_moves.items():
            add_changes(move, changes, my_dots, another_dots)
            print("here")

            score = minimax(
                another_dots,
                my_dots,
                width,
                height,
                maximizing=False,
                depth=depth - 1,
            )
            best_score = max(score, best_score)

            undo_changes(move, changes, my_dots, another_dots)

    else:
        best_score = float("inf")
        for move, changes in possible_moves.items():
            add_changes(move, changes, my_dots, another_dots)

            score = minimax(
                another_dots,
                my_dots,
                width,
                height,
                maximizing=True,
                depth=depth - 1,
            )
            best_score = min(score, best_score)

            undo_changes(move, changes, my_dots, another_dots)

    return best_score


def add_changes(move, changes, my_dots, another_dots):
    for change in changes:
        my_dots.append(change)
        another_dots.remove(change)
    my_dots.append(move)


def undo_changes(move, changes, my_dots, another_dots):
    for change in changes:
        my_dots.remove(change)
        another_dots.append(change)
    my_dots.remove(move)


def get_bot_move(bot_dots, another_dots, width, height):
    possible_moves = get_possible_moves(bot_dots, another_dots, width, height)
    best_move = None
    best_move_changes = None
    best_score = float("-inf")
    for move, changes in possible_moves.items():
        add_changes(move, changes, bot_dots, another_dots)

        score = minimax(
            another_dots, bot_dots, width, height, maximizing=False, depth=1
        )
        if best_score < score:
            best_score = score
            best_move = move
            best_move_changes = changes

        undo_changes(move, changes, bot_dots, another_dots)

    return best_move, best_move_changes, possible_moves.keys()
