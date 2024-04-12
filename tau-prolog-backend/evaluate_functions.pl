:- consult('possible_moves.pl').

/* evaluate_function(+MyDots, +AnotherDots, +Width, +Height, +Maximizing, -Score) */
evaluate_function(MyDots, AnotherDots, Width, Height, Maximizing, Score) :- 
    get_possible_moves(MyDots, AnotherDots, Width, Height, Holes, MyMoves),
    get_possible_moves(AnotherDots, MyDots, Width, Height, Holes, AnotherMoves),
    length(MyMoves, MyMovesLen),
    length(AnotherMoves, AnotherMovesLen),
    (   MyMovesLen =:= 0, AnotherMovesLen =:= 0
    ->  who_won(MyDots, AnotherDots, Maximizing, Score)
    ;   (  Maximizing = maximixing
        -> MaximizingDots = MyDots,
           MinimizingDots = AnotherDots
        ;  MaximizingDots = AnotherDots,
           MinimizingDots = MyDots
        ),
        maximize_mobility(MaximizingDots, MinimizingDots, Width, Height, Holes, Score)
    )
    , !.


/* corners(+MaximizingDots, +MinimizingDots, +Width, +Height, -Score) */
corners(MaximizingDots, MinimizingDots, Width, Height, Score) :- 
    MaxWidth is Width - 1,
    MaxHeight is Height - 1,
    Corners = [dot(0,0), dot(MaxHeight, 0), dot(0, MaxWidth), dot(MaxHeight, MaxWidth)], 
    findall(MyCorner, (member(MyCorner, Corners), member(MyCorner, MaximizingDots)), MaximizingCorners),
    findall(AnotherCorner, (member(AnotherCorner, Corners), member(AnotherCorner, MinimizingDots)), MinimizingCorners), 
    length(MaximizingCorners, MaximixingLen),
    length(MinimizingCorners, MinimizingLen),
    (   MaximixingLen =:= 0, MinimizingLen =:= 0 ->
        Score = 0
    ;   Score is 100 * (MaximixingLen - MinimizingLen) / (MaximixingLen + MinimizingLen)
    ), !.


/* maximize_mobility(+MaximizingDots, +MinimizingDots, +Width, +Height, +Holes, -Score) */
maximize_mobility(MaximizingDots, MinimizingDots, Width, Height, Holes, Score) :-
    get_possible_moves(MaximizingDots, MinimizingDots, Width, Height, Holes, MaxMoves),
    get_possible_moves(MinimizingDots, MaximizingDots, Width, Height, Holes, MinMoves),
    length(MaxMoves, MaxMovesLen),
    length(MinMoves, MinMovesLen),
    (   MaxMovesLen =:= 0, MinMovesLen =:= 0 ->
        Score = 0
    ;   Score is 100 * (MaxMovesLen - MinMovesLen) / (MaxMovesLen + MinMovesLen)
    ), !.


/* who_won(+MyDots, +AnotherDots, +Maximizing, -Score) */
who_won(MyDots, AnotherDots, Maximizing, Score) :-
    length(MyDots, MyDotsLen),
    length(AnotherDots, AnotherDotsLen),
    MyDotsLen > AnotherDotsLen, 
    (   Maximizing = maximixing
    ->  Score = 10000
    ;   Score = -10000
    ), !.

who_won(MyDots, AnotherDots, Maximizing, Score) :-
    length(MyDots, MyDotsLen),
    length(AnotherDots, AnotherDotsLen),
    MyDotsLen < AnotherDotsLen, 
    (   Maximizing = maximixing
    ->  Score = -10000
    ;   Score = 10000
    ), !.


who_won(_, _, _, 0) :- !.



