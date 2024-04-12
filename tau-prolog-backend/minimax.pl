:- consult('possible_moves.pl').
:- consult('evaluate_functions.pl').

/* minimax(+MyDots, +AnotherDots, +Width, +Height, +Maximizing, +Depth, -BestScore) */
minimax(MyDots, AnotherDots, Width, Height, _, Maximizing, 0, BestScore) :- 
    evaluate_function(MyDots, AnotherDots, Width, Height, Maximizing, BestScore), !.

minimax(MyDots, AnotherDots, Width, Height, Holes, maximizing, Depth, BestScore) :- 
    NewDepth is Depth - 1,
    get_possible_moves(AnotherDots, MyDots, Width, Height, Holes, Moves),
    findall(Score, (member(Move, Moves), add_changes(Move, MyDots, AnotherDots, NewMyDots, NewAnotherDots), 
                   minimax(NewAnotherDots, NewMyDots, Width, Height, Holes, minimizing, NewDepth, Score)), Scores),
    (   Scores = []
    ->  get_possible_moves(MyDots, AnotherDots, Width, Height, Holes, Moves2),
        findall(Score, (member(Move, Moves2), add_changes(Move, MyDots, AnotherDots, NewMyDots, NewAnotherDots), 
                   minimax(NewMyDots, NewAnotherDots, Width, Height, Holes, maximizing, NewDepth, Score)), Scores2),
        (   Scores2 = []
        ->  
            who_won(MyDots, AnotherDots, maximizing, BestScore)
        ;   max_list(Scores, BestScore)
        )
    ;   max_list(Scores, BestScore1),
        BestScore is BestScore1 + 100 % add bonus because opponent had no moves
    ) 
    , !.

minimax(MyDots, AnotherDots, Width, Height, Holes, minimizing, Depth, BestScore) :- 
    NewDepth is Depth - 1,
    get_possible_moves(AnotherDots, MyDots, Width, Height, Holes, Moves),
    findall(Score, (member(Move, Moves), add_changes(Move, MyDots, AnotherDots, NewMyDots, NewAnotherDots), 
                   minimax(NewAnotherDots, NewMyDots, Width, Height, Holes, maximizing, NewDepth, Score)), Scores),
    (   Scores = []
    ->  get_possible_moves(MyDots, AnotherDots, Width, Height, Holes, Moves2),
        findall(Score, (member(Move, Moves2), add_changes(Move, MyDots, AnotherDots, NewMyDots, NewAnotherDots), 
            minimax(NewMyDots, NewAnotherDots, Width, Height, Holes, minimizing, NewDepth, Score)), Scores2),
        (   Scores2 = []
        ->  who_won(MyDots, AnotherDots, minimizing, BestScore)
        ;   min_list(Scores, BestScore)
        )
    ;   min_list(Scores, BestScore1),
        BestScore is BestScore1 - 100 % add bonus because opponent had no moves
    )
    , !.

/* add_changes(+Move, +MyDots, +AnotherDots, -NewMyDots, -NewAnotherDots) */
add_changes(move(Move, Changes), MyDots, AnotherDots, NewMyDots, NewAnotherDots) :-
    append(Changes, [Move | MyDots], NewMyDots),
    substract_list(AnotherDots, Changes, NewAnotherDots), !.
    

/* substract_list(+List1, +List2, -Result) */
substract_list([], _, []) :- !.
substract_list([Head | List1], List2, Result) :- 
    member(Head, List2),
    substract_list(List1, List2, Result), !.

substract_list([Head1 | List1], List2, [Head1 | Result]) :- 
    substract_list(List1, List2, Result), !.