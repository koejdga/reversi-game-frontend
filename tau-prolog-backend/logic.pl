:- use_module(library(lists)).
:- consult('possible_moves.pl'). /* У Tau-Prolog це не обовʼязково, головне consult у JavaScript */
:- consult('minimax.pl').


/* choose_bot_move(+BotDots, +AnotherDots, +Width, +Height, -BestMove, -PossibleMoves, -Win) */
choose_bot_move(BotDots, AnotherDots, Width, Height, Holes, _, [], Win) :-
    check_lengths(BotDots, AnotherDots, Width, Height, Holes, Win).

/* choose_bot_move(BotDots, AnotherDots, Width, Height, Holes, BestMove, PossibleMoves, _) :-
    get_possible_moves(BotDots, AnotherDots, Width, Height, Holes, PossibleMoves),
    findall(Score, (
        member(Move, PossibleMoves),
        add_changes(Move, BotDots, AnotherDots, NewBotDots, NewAnotherDots),
        minimax(NewAnotherDots, NewBotDots, Width, Height, Holes, minimizing, 1, Score)
    ), Scores),
    get_move_w_best_score(PossibleMoves, Scores, maximizing, BestMove). */



choose_bot_move(BotDots, AnotherDots, Width, Height, Holes, Move, PossibleMoves, _) :-
    get_possible_moves(BotDots, AnotherDots, Width, Height, Holes, PossibleMoves),
    longest_move(PossibleMoves, Move).


get_possible_moves_for_player(MyDots, AnotherDots, Width, Height, Holes, [], Win) :-
    check_lengths(MyDots, AnotherDots, Width, Height, Holes, Win).

get_possible_moves_for_player(MyDots, AnotherDots, Width, Height, Holes, PossibleMoves, _) :-
    get_possible_moves(MyDots, AnotherDots, Width, Height, Holes, PossibleMoves).



check_lengths(MyDots, AnotherDots, Width, Height, Holes, Win) :-
    length(MyDots, MyDotsLen),
    length(AnotherDots, AnotherDotsLen),
    length(Holes, HolesLen),
    Width * Height - HolesLen =:= MyDotsLen + AnotherDotsLen,
    who_won(MyDots, AnotherDots, Win).




who_won(MyDots, AnotherDots, this) :-
    length(MyDots, MyDotsLen),
    length(AnotherDots, AnotherDotsLen),
    MyDotsLen > AnotherDotsLen, !.

who_won(MyDots, AnotherDots, not_this) :-
    length(MyDots, MyDotsLen),
    length(AnotherDots, AnotherDotsLen),
    MyDotsLen < AnotherDotsLen, !.

who_won(_, _, tie) :- !.



/* longest_move(+Moves, -LongestMove) */
longest_move([move(Dot, Array) | Moves], LongestMove) :-
    longest_move(Moves, move(_, LongestArray)),
    length(Array, Length),
    length(LongestArray, LongestLength),
    Length > LongestLength,
    LongestMove = move(Dot, Array), !.
longest_move([_ | Moves], LongestMove) :-
    longest_move(Moves, LongestMove), !.
longest_move([], move(_, [])).


/* get_move_w_best_score(+Moves, +Scores, +Maximizing, -BestMove) */
get_move_w_best_score([], [], _, _) :- !.
get_move_w_best_score([Move | Moves], [Score | Scores], Maximizing, BestMove) :-
    get_move_w_best_score_helping(Moves, Scores, Move, Score, Maximizing, BestMove), !.

/* get_move_w_best_score_helping(+Moves, +Scores, +CurrentBestMove, +CurrentBestScore, +Maximizing, -BestMove) */
get_move_w_best_score_helping([], [], CurrentBestMove, _, _, CurrentBestMove) :- !.

get_move_w_best_score_helping([Move | Moves], [Score | Scores], _, CurrentBestScore, maximizing, BestMove) :-
    Score > CurrentBestScore,
    get_move_w_best_score_helping(Moves, Scores, Move, Score, maximizing, BestMove), !.

get_move_w_best_score_helping([Move | Moves], [Score | Scores], _, CurrentBestScore, minimizing, BestMove) :-
    Score < CurrentBestScore,
    get_move_w_best_score_helping(Moves, Scores, Move, Score, minimizing, BestMove), !.

get_move_w_best_score_helping([_ | Moves], [_ | Scores], CurrentBestMove, CurrentBestScore, Maximizing, BestMove) :-
    get_move_w_best_score_helping(Moves, Scores, CurrentBestMove, CurrentBestScore, Maximizing, BestMove), !.

