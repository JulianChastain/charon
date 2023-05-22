import {Chess} from "chess.js";
import {LMS, Mv, Puzzle} from "./classesAndTypes";

export enum Mode {
    Sandbox = "Sandbox",
    EnterPuzzle = "Enter Puzzle",
    AttemptPuzzle = "Attempt Puzzle",
}

export type State = {
    Game: Chess;
    Orientation: boolean;
    CurPuzzle: Puzzle;
    Puzzles: Puzzle[];
    //TODO implement this as an enum
    PuzzleMode: Mode;
    Feedback: string;
    Input: string;
}

export type Action = {
    Fen: string;
    PuzzleMode: Mode;
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
        if (old.PuzzleMode === Mode.EnterPuzzle) {
            // @ts-ignore
            old = dispatchAddPuzzle(old, {Puzzles: [old.CurPuzzle]})
            old = {...old, CurPuzzle: new Puzzle(new LMS([]), Fen)}
        }
        return {...old, Game: game}
    } catch (e) {
        // @ts-ignore
        return dispatchFeedback(old, {Feedback: e})
    }
}

function dispatchPuzzleMode(old: State, {PuzzleMode}: Action) {
    if (PuzzleMode === Mode.EnterPuzzle && old.PuzzleMode !== Mode.EnterPuzzle) {
        // @ts-ignore
        old = dispatchFeedback(old, {Feedback: 'Enter new puzzle starting from position ' + old.Game.fen()})
        old = {...old, CurPuzzle: new Puzzle(new LMS([]), old.Game.fen())}
    }
    //Both should be a Mode enum
    return {...old, PuzzleMode: PuzzleMode}
}

function dispatchMove(old: State, {Move}: Action) {
    if (Move.validFor(old.Game))
        try {
            old.Game.move(Move);
            console.log('Verified move, new state is ' + old.Game.fen())
            if (old.PuzzleMode === Mode.EnterPuzzle) {
                old.CurPuzzle.moves.Add(Move)
                return {...old, Game: old.Game, Fen: old.Game.fen(), CurPuzzle: old.CurPuzzle}
            } else
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
    //TODO add specializer functions or types so I can call this with type safety
    console.log("Dispatching action: ", action)
    console.log("On state: ", old)
    if (action.Fen !== undefined) {
        old = dispatchBoardState(old, action);
    }
    if (action.PuzzleMode !== undefined) {
        old = dispatchPuzzleMode(old, action);
    }
    if (action.Move !== undefined) {
        old = dispatchMove(old, action);
    }
    if (action.Feedback !== undefined) {
        old = dispatchFeedback(old, action);
    }
    if (action.Puzzles !== undefined) {
        old = dispatchAddPuzzle(old, action);
    }
    if (action.PuzzleIdx !== undefined) {
        old = dispatchRemovePuzzle(old, action);
    }
    if (action.Orientation !== undefined) {
        old = dispatchOrientation(old, action);
    }
    if (action.Input !== undefined) {
        old = dispatchInput(old, action);
    }
    return old;
}

export function NewState(): State {
    return {
        Game: new Chess(),
        Orientation: true,
        CurPuzzle: new Puzzle(new LMS([])),
        Puzzles: [],
        PuzzleMode: Mode.Sandbox,
        Feedback: 'White to move',
        Input: ''
    }
}

export function LastMove(s: State) {
    return s.Game.history()[s.Game.history().length - 1]
}

export function LastPuzzleMove(s: State) {
    return s.CurPuzzle.moves[s.CurPuzzle.moves.length - 1]
}
