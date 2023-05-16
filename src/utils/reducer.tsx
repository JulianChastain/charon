import {Chess} from "chess.js";
import {LinearMoveSequence, Mv, Puzzle} from "./classesAndTypes";

export type State = {
    Game: Chess;
    Orientation: boolean;
    CurPuzzle: Puzzle;
    Puzzles: Puzzle[];
    PuzzleMode: boolean;
    Feedback: string;
    Input: string;
}

export type Action = {
    Fen: string;
    PuzzleMode: boolean;
    Move: Mv;
    Feedback: string;
    Puzzles: Puzzle[];
    PuzzleIdx: number;
    Orientation: boolean;
    Input: string;
}

function dispatchBoardState(old: State, {Fen}: Action) {
    try {
        const game = new Chess(Fen)
        console.log("FEN is valid")
        if (old.PuzzleMode) {
            // @ts-ignore
            old = dispatchAddPuzzle(old, {Puzzles: [old.CurPuzzle]})
            old = {...old, CurPuzzle: new Puzzle(new LinearMoveSequence([]), Fen)}
        }
        return {...old, Game: game}
    } catch (e) {
        // @ts-ignore
        return dispatchFeedback(old, {Feedback: error})
    }
}

function dispatchPuzzleMode(old: State, {PuzzleMode}: Action) {
    if (PuzzleMode && !old.PuzzleMode) {
        old = {...old, CurPuzzle: new Puzzle(new LinearMoveSequence([]), old.Game.fen())}
    }
    return {...old, PuzzleMove: PuzzleMode}
}

function dispatchMove(old: State, {Move}: Action) {
    if (Move.validFor(old.Game))
        try {
            old.Game.move(Move);
            console.log('Verified move, new state is ' + old.Game.fen())
            return {...old, Game: old.Game, Fen: old.Game.fen()}
        } catch (e) {
            console.log("Couldn't make the move " + Move.from + Move.to + " in state " + old.Game.fen())
            return old
        }
    else {
        console.log("Couldn't find the move " + Move.from + Move.to + " in state " + old.Game.fen())
        return old
    }

}

function dispatchFeedback(old: State, {Feedback}: Action) {
    return {...old, Feedback: Feedback}
}

function dispatchAddPuzzle(old: State, {Puzzles}: Action) {
    //TODO not idempotent, check duplicate doesn't exist first
    return {...old, Puzzles: [...old.Puzzles, ...Puzzles]}
}

function dispatchRemovePuzzle(old: State, {PuzzleIdx}: Action) {
    return {...old, Puzzles: old.Puzzles.filter((_, idx) => idx !== PuzzleIdx)}
}

function dispatchOrientation(old: State, {Orientation}: Action) {
    return {...old, Orientation: Orientation}
}

function dispatchInput(old: State, {Input}: Action) {
    return {...old, Input: Input}
}


export function Reducer(old: State, action: Action): State {
    console.log("Dispatching action: ", action)
    console.log("On state: ", old)
    if (action.Fen !== undefined) {
        return dispatchBoardState(old, action);
    } else if (action.PuzzleMode !== undefined) {
        return dispatchPuzzleMode(old, action);
    } else if (action.Move !== undefined) {
        return dispatchMove(old, action);
    } else if (action.Feedback !== undefined) {
        return dispatchFeedback(old, action);
    } else if (action.Puzzles !== undefined) {
        return dispatchAddPuzzle(old, action);
    } else if (action.PuzzleIdx !== undefined) {
        return dispatchRemovePuzzle(old, action);
    } else if (action.Orientation !== undefined) {
        return dispatchOrientation(old, action);
    } else if (action.Input !== undefined) {
        return dispatchInput(old, action);
    } else {
        return old;
    }
}

export function NewState(): State {
    return {
        Game: new Chess(),
        Orientation: true,
        CurPuzzle: new Puzzle(new LinearMoveSequence([])),
        Puzzles: [],
        PuzzleMode: false,
        Feedback: 'White to move',
        Input: ''
    }
}
