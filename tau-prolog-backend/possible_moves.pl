:- use_module(library(lists)).

get_starting_positions(Width, Height, Holes, BlackDots, WhiteDots, PossibleBlackMoves) :-
    Width mod 2 =:= 0,
    Height mod 2 =:= 0, 
    X1 is Width / 2 - 1,
    X2 is Width / 2,
    Y1 is Height / 2 - 1,
    Y2 is Height / 2,
    check_holes(dot(X1, Y1), dot(X2, Y2), dot(X2, Y1), dot(X1, Y2), Holes, Height, 
        [dot(NewX1, NewY1), dot(NewX2, NewY2)], [dot(NewX2, NewY1), dot(NewX1, NewY2)]),
    NewX1 >= 0, NewX2 < Width,
    NewY1 >= 0, NewY2 < Height,
    WhiteDots = [dot(NewX1, NewY1), dot(NewX2, NewY2)],
    BlackDots = [dot(NewX2, NewY1), dot(NewX1, NewY2)],
    get_possible_moves(BlackDots, WhiteDots, Width, Height, Holes, PossibleBlackMoves), !.


/* check_holes(+WhiteDot1, +WhiteDot2, +BlackDot1, +BlackDot2, +Holes, +Height, -NewWhiteDots, -NewBlackDots) */
check_holes(dot(X1, Y1), dot(X2, Y2), dot(X2, Y1), dot(X1, Y2), 
            Holes, Height, WhiteDots, BlackDots) :-
    member(dot(X1, Y1), Holes),
    NewY1 is Y1 + 1,
    NewY2 is Y2 + 1, 
    check_holes(dot(X1, NewY1), dot(X2, NewY2), dot(X2, NewY1), dot(X1, NewY2), Holes, Height, WhiteDots, BlackDots), !.


check_holes(dot(X1, Y1), dot(X2, Y2), dot(X2, Y1), dot(X1, Y2), 
            Holes, Height, WhiteDots, BlackDots) :-
    member(dot(X1, Y2), Holes),
    NewY1 is Y1 - 1,
    NewY2 is Y2 - 1, 
    check_holes(dot(X1, NewY1), dot(X2, NewY2), dot(X2, NewY1), dot(X1, NewY2), Holes, Height, WhiteDots, BlackDots), !.

check_holes(dot(X1, Y1), dot(X2, Y2), dot(X2, Y1), dot(X1, Y2), 
            Holes, Height, WhiteDots, BlackDots) :-
    ( member(dot(X2, Y1), Holes) ; member(dot(X2, Y2), Holes) ),
    NewX1 is X1 - 1,
    NewX2 is X2 - 1,
    check_holes(dot(NewX1, Y1), dot(NewX2, Y2), dot(NewX2, Y1), dot(NewX1, Y2), Holes, Height, WhiteDots, BlackDots), !.

check_holes(Dot1, Dot2, Dot3, Dot4, _, _, [Dot1, Dot2], [Dot3, Dot4]) :- !.


/* get_possible_moves(+MyDots, +AnotherDots, +Width, +Height, +Holes, -Result) */
get_possible_moves(MyDots, AnotherDots, Width, Height, Holes, Result) :-
    get_possible_moves_helping(MyDots, MyDots, AnotherDots, Width, Height, Holes, Result1),
    remove_by_condition(is_empty, Result1, Result2),
    remove_behind_field(Width, Height, Result2, Result3),
    merge_duplicates(Result3, Result), !.

/* merge_duplicates(+MovesList, -MergedMovesList) */
merge_duplicates([], []).
merge_duplicates([Move|Rest], [MergedMove|Result]) :-
    Move = move(Start, EndPoints),
    merge_moves_with_start(Rest, Start, EndPoints, MergedEndPoints, NewRest),
    MergedMove = move(Start, MergedEndPoints),
    merge_duplicates(NewRest, Result), !.

/* merge_moves_with_start(+MovesList, +MoveStart, +MoveCurrentEndPoints, -MergedEndPoints, -NewRest) */
merge_moves_with_start([], _, MergedEndPoints, MergedEndPoints, []) :- !.
merge_moves_with_start([move(Start, EndPoints)|Rest], Start, CurrentEndPoints, MergedEndPoints, NewRest) :-
    append(EndPoints, CurrentEndPoints, Merged),
    merge_moves_with_start(Rest, Start, Merged, MergedEndPoints, NewRest), !.
merge_moves_with_start([Move|Rest], Start, CurrentEndPoints, MergedEndPoints, [Move|NewRest]) :-
    Move = move(OtherStart, _),
    OtherStart \= Start,
    merge_moves_with_start(Rest, Start, CurrentEndPoints, MergedEndPoints, NewRest).


/* get_possible_moves_helping(+MyDots, +MyDotsConst, +AnotherDots, +Width, +Height, +Holes, -Result) */
get_possible_moves_helping([MyDot | MyDots], MyDotsConst, AnotherDots, Width, Height, Holes, Result) :-
    get_possible_moves(MyDot, MyDotsConst, AnotherDots, Width, Height, Holes, Result1),
    get_possible_moves_helping(MyDots, MyDotsConst, AnotherDots, Width, Height, Holes, Result2),
    append(Result1, Result2, Result).
get_possible_moves_helping([], _, _, _, _, _, []) :- !.


is_empty(move(null, _)) :- !.
is_empty(move(_, [])) :- !.

remove_by_condition(_, [], []) :- !.
remove_by_condition(Condition, [Head | Tail], Filtered) :-
    call(Condition, Head),
    remove_by_condition(Condition, Tail, Filtered), !.
remove_by_condition(Condition, [Head | Tail], [Head | FilteredTail]) :-
    remove_by_condition(Condition, Tail, FilteredTail), !.

remove_behind_field(_, _, [], []) :- !.
remove_behind_field(Width, Height, [move(dot(X, Y), Changes) | Tail], [move(dot(X, Y), Changes) | FilteredTail]) :-
    X < Width, Y < Height, X >= 0, Y >= 0, !,
    remove_behind_field(Width, Height, Tail, FilteredTail), !.
remove_behind_field(Width, Height, [ _ | Tail], Filtered) :-
    remove_behind_field(Width, Height, Tail, Filtered), !.


/* get_possible_moves(+MyDot, +MyDots, +AnotherDots, +Width, +Height, +Holes, -Result) */
get_possible_moves(MyDot, MyDots, AnotherDots, Width, Height, Holes, Result) :-
    search_hor(MyDot, MyDots, AnotherDots, Height, Holes, Result1),
    search_ver(MyDot, MyDots, AnotherDots, Width, Holes, Result2),
    search_diag(MyDot, MyDots, AnotherDots, Width, Height, Holes, Result3),
    append(Result1, Result2, Result12),
    append(Result12, Result3, Result).


search_diag(dot(X, Y), MyDots, AnotherDots, Width, Height, Holes, [Result1, Result2, Result3, Result4]) :-
    (   X >= 2, Y >= 2
    ->  NewX1 is X - 1,
        NewY1 is Y - 1,
        search_diag_up_left(dot(NewX1, NewY1), MyDots, AnotherDots, Holes, Result1)
    ;   Result1 = move(null, _)
    ),
    (   X < Height - 2, Y < Width - 2
    ->  NewX2 is X + 1,
        NewY2 is Y + 1,
        search_diag_down_right(dot(NewX2, NewY2), MyDots, AnotherDots, Width, Height, Holes, Result2)
    ;   Result2 = move(null, _)),
	(   X < Height - 2, Y >= 2
    ->  NewX3 is X + 1,
        NewY3 is Y - 1,
        search_diag_down_left(dot(NewX3, NewY3), MyDots, AnotherDots, Width, Height, Holes, Result3)
    ;   Result3 = move(null, _)),
    (   X >= 2, Y < Width - 2
    ->  NewX4 is X - 1,
        NewY4 is Y + 1,
        search_diag_up_right(dot(NewX4, NewY4), MyDots, AnotherDots, Width, Height, Holes, Result4)
    ;   Result4 = move(null, _)).

search_diag_up_left(dot(X, Y), MyDots, AnotherDots, Holes, move(ResultDot, [dot(X, Y) | ResultChanges])) :-
    member(dot(X, Y), AnotherDots),
    NewX is X - 1,
    NewY is Y - 1,
    search_diag_up_left(dot(NewX, NewY), MyDots, AnotherDots, Holes, move(ResultDot, ResultChanges)), !.
search_diag_up_left(dot(X, Y), MyDots, _, Holes, move(null, _)) :-
    (   member(dot(X, Y), MyDots) ; member(dot(X, Y), Holes)   ), !.
search_diag_up_left(dot(X, Y), _, _, _, move(dot(X, Y), [])) :- !.


search_diag_down_right(dot(X, Y), MyDots, AnotherDots, Width, Height, Holes, move(ResultDot, [dot(X, Y) | ResultChanges])) :-
    member(dot(X, Y), AnotherDots),
    NewX is X + 1,
    NewY is Y + 1,
    search_diag_down_right(dot(NewX, NewY), MyDots, AnotherDots, Width, Height, Holes, move(ResultDot, ResultChanges)), !.
search_diag_down_right(dot(X, Y), MyDots, _, _, _, Holes, move(null, _)) :-
   (   member(dot(X, Y), MyDots) ; member(dot(X, Y), Holes)   ), !.
search_diag_down_right(dot(X, Y), _, _, _, _, _, move(dot(X, Y), [])) :- !.

search_diag_down_left(dot(X, Y), MyDots, AnotherDots, Width, Height, Holes, move(ResultDot, [dot(X, Y) | ResultChanges])) :-
    member(dot(X, Y), AnotherDots),
    NewX is X + 1,
    NewY is Y - 1,
    search_diag_down_left(dot(NewX, NewY), MyDots, AnotherDots, Width, Height, Holes, move(ResultDot, ResultChanges)), !.
search_diag_down_left(dot(X, Y), MyDots, _, _, _, Holes, move(null, _)) :-
    (   member(dot(X, Y), MyDots) ; member(dot(X, Y), Holes)   ), !.
search_diag_down_left(dot(X, Y), _, _, _, _, _, move(dot(X, Y), [])) :- !.

search_diag_up_right(dot(X, Y), MyDots, AnotherDots, Width, Height, Holes, move(ResultDot, [dot(X, Y) | ResultChanges])) :-
    member(dot(X, Y), AnotherDots),
    NewX is X - 1,
    NewY is Y + 1,
    search_diag_up_right(dot(NewX, NewY), MyDots, AnotherDots, Width, Height, Holes, move(ResultDot, ResultChanges)), !.
search_diag_up_right(dot(X, Y), MyDots, _, _, _, Holes, move(null, _)) :-
    (   member(dot(X, Y), MyDots) ; member(dot(X, Y), Holes)   ), !.
search_diag_up_right(dot(X, Y), _, _, _, _, _, move(dot(X, Y), [])) :- !.


/* search_ver(+MyDot, +MyDots, +AnotherDots, +Width, +Holes, -Result) */
search_ver(dot(X, Y), MyDots, AnotherDots, Width, Holes, [Result1, Result2]) :-
    (  Y >= 2
    -> NewY1 is Y - 1,
       search_ver_left(dot(X, NewY1), MyDots, AnotherDots, Holes, Result1)
    ;  Result1 = move(null, _)
    ),
    (  Y < Width - 2
    -> NewY2 is Y + 1,
       search_ver_right(dot(X, NewY2), MyDots, AnotherDots, Width, Holes, Result2)
    ;  Result2 = move(null, _)
    ).


/* search_ver_right(+MyDot, +MyDots, +AnotherDots, +Height, +Holes, -Move) */
search_ver_right(dot(X, Y), MyDots, AnotherDots, Height, Holes, move(ResultDot, [dot(X, Y) | ResultChanges])) :-
    member(dot(X, Y), AnotherDots),
    NewY is Y + 1,
    search_ver_right(dot(X, NewY), MyDots, AnotherDots, Height, Holes, move(ResultDot , ResultChanges)), !.
search_ver_right(dot(X, Y), MyDots, _, _, Holes, move(null, _)) :-
    (   member(dot(X, Y), MyDots) ; member(dot(X, Y), Holes)   ), !.
search_ver_right(dot(X, Y), _, _, _, _, move(dot(X, Y), [])) :- !.

/* search_ver_right(+MyDot, +MyDots, +AnotherDots, +Holes, -Move) */
search_ver_left(dot(X, Y), MyDots, AnotherDots, Holes, move(ResultDot, [dot(X, Y) | ResultChanges])) :-
    member(dot(X, Y), AnotherDots),
    NewY is Y - 1,
    search_ver_left(dot(X, NewY), MyDots, AnotherDots, Holes, move(ResultDot, ResultChanges)), !.
search_ver_left(dot(X, Y), MyDots, _, Holes, move(null, _)) :-
    (   member(dot(X, Y), MyDots) ; member(dot(X, Y), Holes)   ), !.
search_ver_left(dot(X, Y), _, _, _, move(dot(X, Y), [])) :- !.



search_hor(dot(X, Y), MyDots, AnotherDots, Height, Holes, [Result1, Result2]) :-
    (  X >= 2
    -> NewX1 is X - 1,
       search_hor_up(dot(NewX1, Y), MyDots, AnotherDots, Holes, Result1)
    ;  Result1 = move(null, _)
    ),
    (  X < Height - 2
    -> NewX2 is X + 1,
       search_hor_down(dot(NewX2, Y), MyDots, AnotherDots, Height, Holes, Result2)
    ;  Result2 = move(null, _)
    ).

search_hor_down(dot(X, Y), MyDots, AnotherDots, Height, Holes, move(ResultDot, [dot(X, Y) | ResultChanges])) :-
    member(dot(X, Y), AnotherDots),
    NewX is X + 1,
    search_hor_down(dot(NewX, Y), MyDots, AnotherDots, Height, Holes, move(ResultDot, ResultChanges)), !.
search_hor_down(dot(X, Y), MyDots, _, _, Holes, move(null, _)) :-
    (   member(dot(X, Y), MyDots) ; member(dot(X, Y), Holes)   ), !.
search_hor_down(dot(X, Y), _, _, _, _, move(dot(X, Y), [])) :- !.

search_hor_up(dot(X, Y), MyDots, AnotherDots, Holes, move(ResultDot, [dot(X, Y) | ResultChanges])) :-
    member(dot(X, Y), AnotherDots),
    NewX is X - 1,
    search_hor_up(dot(NewX, Y), MyDots, AnotherDots, Holes, move(ResultDot, ResultChanges)), !.
search_hor_up(dot(X, Y), MyDots, _, Holes, move(null, _)) :-
   (   member(dot(X, Y), MyDots) ; member(dot(X, Y), Holes)   ), !.
search_hor_up(dot(X, Y), _, _, _, move(dot(X, Y), [])) :- !.
