from constants import directions, white, black, width, height
from possible_moves import get_possible_moves


def evaluate_function(my_dots, another_dots, width, height):
    return positional_strategy(my_dots, another_dots, width, height)


def is_interior_disc(row, col, my_dots, another_dots, width, height):
    neighbours = [
        (row + direction[0], col + direction[1]) not in my_dots
        and (row + direction[0], col + direction[1]) not in another_dots
        and not out_of_board((row + direction[0], col + direction[1]), width, height)
        for direction in directions
    ]
    return True not in neighbours


def maximize_interior(my_dots, another_dots, width, height):
    my_interior_dots = len(
        list(
            filter(
                lambda x: x,
                [
                    is_interior_disc(
                        dot[0], dot[1], my_dots, another_dots, width, height
                    )
                    for dot in my_dots
                ],
            )
        )
    )
    another_interior_dots = len(
        list(
            filter(
                lambda x: x,
                [
                    is_interior_disc(
                        dot[0], dot[1], my_dots, another_dots, width, height
                    )
                    for dot in another_dots
                ],
            )
        )
    )

    return (
        (
            100
            * (my_interior_dots - another_interior_dots)
            / (my_interior_dots + another_interior_dots)
        )
        if my_interior_dots != 0 or another_interior_dots != 0
        else 0
    )


def out_of_board(dot, width, height):
    return dot[0] < 0 or dot[1] < 0 or dot[0] >= height or dot[1] >= width


def maximize_mobility(my_dots, another_dots, width, height):
    my_moves = len(get_possible_moves(my_dots, another_dots, width, height))
    another_moves = len(get_possible_moves(another_dots, my_dots, width, height))

    print(my_moves)
    print(another_moves)

    return (
        100 * (my_moves - another_moves) / (my_moves + another_moves)
        if my_moves != 0 or another_moves != 0
        else 0
    )


def corners(my_dots, another_dots, width, height):
    corners_coords = [(0, 0), (0, width - 1), (height - 1, 0), (height - 1, width - 1)]

    my_corners = 0
    another_corners = 0
    for coord in corners_coords:
        if coord in my_dots:
            my_corners += 1
        elif coord in another_dots:
            another_corners += 1

    return (
        100 * (my_corners - another_corners) / (my_corners + another_corners)
        if my_corners != 0 or another_corners != 0
        else 0
    )


def positional_strategy(my_dots, another_dots, width, height):
    position_scores = {
        99: (0, 0),
        -8: (0, 1),
        8: (0, 2),
        6: (0, 3),
        -24: (1, 1),
        -4: (1, 2),
        -3: (1, 3),
        7: (2, 2),
        4: (2, 3),
    }
    starts = [(0, 0), (height - 1, 0), (0, width - 1), (height - 1, width - 1)]

    result = 0
    for score in position_scores:
        offset = position_scores[score]
        for start in starts:
            sign_for_col = "+"
            sign_for_row = "+"

            if start[0] == height - 1:
                sign_for_row = "-"
            if start[1] == width - 1:
                sign_for_col = "-"

            dot = (
                start[0] + offset[0] if sign_for_row == "+" else start[0] - offset[0],
                start[1] + offset[1] if sign_for_col == "+" else start[1] - offset[1],
            )

            if dot in my_dots:
                result += score
            elif dot in another_dots:
                result -= score

            if offset[0] != offset[1]:
                dot = (
                    (
                        start[0] + offset[1]
                        if sign_for_row == "+"
                        else start[0] - offset[1]
                    ),
                    (
                        start[1] + offset[0]
                        if sign_for_col == "+"
                        else start[1] - offset[0]
                    ),
                )

                if dot in my_dots:
                    result += score
                elif dot in another_dots:
                    result -= score

    return result


if __name__ == "__main__":
    result = evaluate_function(white, black, width, height)
    print(result)
