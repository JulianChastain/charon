import {DEFAULT_POSITION, Square} from "chess.js";

export type OutOfSequenceError = "Out of sequence error";
export type MoveHandler = (startSquare: Square, endSquare: Square) => boolean;

//Type containing a square and ending square
class Mv {
    from: Square;
    to: Square;

    constructor(from: Square, to: Square) {
        this.from = from;
        this.to = to;
    }
}

//this is an underlying interface that represents a list of moves
//Or a DAG of moves. They both need to be able to be used through the same api
//They need to support standard typescript iteration constructs, and operate as a
//Map<Move,Map> for both cases
export interface MoveSequence extends Iterable<Mv> {
    Move: Mv | OutOfSequenceError;
    Linear: boolean;
    Children: (ChosenMove: Mv) => MoveSequence | OutOfSequenceError;
    Add: (Move: Mv) => MoveSequence | OutOfSequenceError;
}

class LinearMoveSequence implements MoveSequence {
    Moves: Mv[];
    CurrentMove: number;
    Move: Mv | OutOfSequenceError;
    Linear: boolean = true;

    [Symbol.iterator](): Iterator<Mv> {
        return {
            next: (): IteratorResult<Mv> => {
                if (this.CurrentMove >= this.Moves.length)
                    return {done: true, value: undefined};
                return {done: false, value: this.Moves[this.CurrentMove++]};
            }
        }
    }

    Add(Move: Mv): MoveSequence | OutOfSequenceError {
        if (this.Moves.length !== this.CurrentMove)
            return "Out of sequence error";
        this.Moves.push(Move);
        this.CurrentMove++;
        return this;
    }

    Children(ChosenMove: Mv): MoveSequence | OutOfSequenceError {
        if (this.Moves.length <= this.CurrentMove + 1)
            return "Out of sequence error";
        if (this.Moves[this.CurrentMove] === ChosenMove)
            return new LinearMoveSequence(this.Moves, this.CurrentMove + 1);
        return "Out of sequence error";
    }

    constructor(moves: Mv[], moveIdx: number = 0) {
        this.Moves = moves;
        this.CurrentMove = moveIdx;
        if (moves.length > moveIdx)
            this.Move = moves[moveIdx];
        else
            this.Move = "Out of sequence error";
    }

}

class Puzzle {
    startPos: string;
    moves: MoveSequence;
    opponentMovesFirst: boolean;

    constructor(moves: MoveSequence, startPos ?: string, opponentMovesFirst?: boolean) {
        this.moves = moves;
        this.startPos = startPos ? startPos : DEFAULT_POSITION;
        this.opponentMovesFirst = opponentMovesFirst ? opponentMovesFirst : false;
    }
}

export {LinearMoveSequence, Mv, Puzzle};
