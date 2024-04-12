
:- begin_tests(addition).
:- consult('first_approach.pl').
:- consult('possible_moves.pl').


test(get_starting_positions_correct) :-
    get_starting_positions(8, 8, [dot(4, 3), dot(3, 4)], [dot(3, 3), dot(4, 4)], 
        [move(dot(2,3),[dot(3,3)]), move(dot(4,5),[dot(4,4)]), move(dot(5,4),[dot(4,4)]), move(dot(3,2),[dot(3,3)])]).

test(not_even_width, [fail]) :-
    get_starting_positions(7, 8, _, _, _).

test(not_even_height, [fail]) :-
    get_starting_positions(8, 7, _, _, _).

:- end_tests(addition).


/* 
check_holes(dot(3,3), dot(4,4), dot(4,3), dot(3,4), [], 8, [dot(4,3), dot(3,4)], [dot(3,3), dot(4,4)]) 
check_holes(dot(3,3), dot(4,4), dot(4,3), dot(3,4), [dot(3,3)], 8, [dot(4,4), dot(3,5)], [dot(3,4), dot(4,5)])
check_holes(dot(3,3), dot(4,4), dot(4,3), dot(3,4), [dot(3,4)], 8, [dot(4,2), dot(3,3)], [dot(3,2), dot(4,3)])
check_holes(dot(3,3), dot(4,4), dot(4,3), dot(3,4), [dot(4,3)], 8, [dot(3,3), dot(2,4)], [dot(2,3), dot(3,4)])
check_holes(dot(3,3), dot(4,4), dot(4,3), dot(3,4), [dot(4,4)], 8, [dot(3,3), dot(2,4)], [dot(2,3), dot(3,4)])
check_holes(dot(1,1), dot(2,2), dot(2,1), dot(1,2), [dot(1,1), dot(2,2)], 4, [dot(1,2), dot(0,3)], [dot(0,2), dot(1,3)])
get_starting_positions(4, 6, [dot(1,1), dot(1,2), dot(1, 3), dot(1,4), dot(1,5)], WhiteDots, BlackDots, PosMoves) fail
*/