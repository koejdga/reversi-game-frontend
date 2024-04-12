board = [
    ["", "", "", ""],
    ["", "w", "b", ""],
    ["", "w", "w", ""],
    ["b", "w", "", ""],
    ["", "", "", ""],
]


directions = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def opposite(player):
    if player == "w":
        return "b"
    if player == "b":
        return "w"
    else:
        print("ERROR: invalid player provided in opposite function")
        return None


def get_possible_moves(player, board):
    result = {}
    for row in range(len(board)):
        for col in range(len(board[0])):
            if board[row][col] == "":
                dirs = check_possible_directions(row, col, player, board)
                if dirs:
                    result[(row, col)] = dirs

    return result


def check_possible_directions(row, col, player, board):
    result_changes = []
    for direction in directions:
        changes = go_in_direction(direction, row, col, player, board)
        if changes:
            result_changes.extend(changes)

    return result_changes


def go_in_direction(direction, row, col, player, board):
    newRow = row + direction[0]
    newCol = col + direction[1]

    if newRow < 0 or newRow >= len(board) or newCol < 0 or newCol >= len(board[0]):
        return None

    if board[newRow][newCol] == opposite(player):

        result = go_in_direction(direction, newRow, newCol, player, board)
        if result != None:
            result.append((newRow, newCol))
        return result

    if board[newRow][newCol] == player:
        return []

    else:
        return None


def minimax(player, board, maximizing, depth):
    if depth == 0:
        return evaluate_function(player, board)

    possible_moves = get_possible_moves(player, board)

    if maximizing:
        best_score = float("-inf")
        for move, changes in possible_moves.items():
            add_changes(move, changes, player, board)

            score = minimax(opposite(player), board, maximizing=False, depth=depth - 1)
            best_score = max(score, best_score)

            undo_changes(move, changes, player, board)

    else:
        best_score = float("inf")
        for move, changes in possible_moves.items():
            add_changes(move, changes, player, board)

            score = minimax(opposite(player), board, maximizing=True, depth=depth - 1)
            best_score = min(score, best_score)

            undo_changes(move, changes, player, board)

    return best_score


def add_changes(move, changes, player, board):
    changes.append(move)

    for change in changes:
        board[change[0]][change[1]] = player


def undo_changes(move, changes, player, board):
    for change in changes:
        board[change[0]][change[1]] = opposite(player)
    board[move[0]][move[1]] = ""


def evaluate_function(player, board):
    return 1


def get_bot_move(player, board):
    possible_moves = get_possible_moves(player, board)
    best_move = None
    best_score = float("-inf")
    for move, changes in possible_moves.items():
        add_changes(move, changes, player, board)

        score = minimax(opposite(player), board, maximizing=False, depth=1)
        if best_score < score:
            best_score = score
            best_move = move

        undo_changes(move, changes, player, board)

    return best_move


result = get_bot_move("b", board)
print("result: " + str(result))
