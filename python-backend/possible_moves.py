from constants import directions


def get_possible_moves(my_dots, another_dots, width, height):
    result = {}
    for row in range(height):
        for col in range(width):
            if (row, col) not in my_dots and (row, col) not in another_dots:
                dirs = check_possible_directions(
                    row, col, my_dots, another_dots, width, height
                )
                if dirs:
                    result[(row, col)] = dirs

    return result


def check_possible_directions(row, col, my_dots, another_dots, width, height):
    result_changes = []
    for direction in directions:
        changes = go_in_direction(
            direction, row, col, my_dots, another_dots, width, height
        )
        if changes:
            result_changes.extend(changes)

    return result_changes


def go_in_direction(direction, row, col, my_dots, another_dots, width, height):
    newRow = row + direction[0]
    newCol = col + direction[1]

    if newRow < 0 or newRow >= height or newCol < 0 or newCol >= width:
        return None

    if (newRow, newCol) in another_dots:

        result = go_in_direction(
            direction, newRow, newCol, my_dots, another_dots, width, height
        )
        if result != None:
            result.append((newRow, newCol))
        return result

    if (newRow, newCol) in my_dots:
        return []

    else:
        return None


def get_starting_positions(width, height):
    if width % 2 != 0 or height % 2 != 0:
        return None

    black_dots = [(height / 2 - 1, width / 2), (height / 2, width / 2 - 1)]
    white_dots = [(height / 2 - 1, width / 2 - 1), (height / 2, width / 2)]
    possible_moves = get_possible_moves(black_dots, white_dots, width, height)

    return black_dots, white_dots, possible_moves
