import {Chess, DEFAULT_POSITION, Move, Square} from "chess.js";

export type OutOfSequenceError = "Out of sequence error";
export type MoveHandler = (startSquare: Square, endSquare: Square) => boolean;
export type MoveSorter = (old: BiMoveIterNode[]) => BiMoveIterNode[];
const DUMMY_MOVE: Move = (new Chess()).moves({verbose: true})[0];

//Type containing a square and ending square
class Mv {
    from: Square;
    to: Square;

    constructor(from: Square, to: Square) {
        this.from = from;
        this.to = to;
    }

    fullMove(game: Chess): Move | false {
        const trueMove: Move = game
            .moves({verbose: true})
            .filter(({from, to}) => from === this.from && to === this.to)
            .reduce((m1: Move, m2: Move) => m2, DUMMY_MOVE)
        return trueMove == DUMMY_MOVE ? false : trueMove;
    }

    san(game: Chess): string {
        const t = this.fullMove(game)
        return t ? t.san : "Inv"
    }

    validFor(game: Chess) {
        return this.fullMove(game)
    }

    equals(other: Mv): boolean {
        return this.from === other.from && this.to === other.to;
    }
}

//this is an underlying interface that represents a list of moves
//Or a DAG of moves. They both need to be able to be used through the same api
//They need to support standard typescript iteration constructs, and operate as a
//Map<Move,Map> for both cases
export interface MoveSequence extends Iterable<Mv> {
    Move: BiMoveIterNode;
    Linear: boolean;
    Sort: MoveSorter;
    Children: (ChosenMove: Mv) => MoveSequence;
    Parents: (ChosenMove?: Mv) => MoveSequence;
    Add: (Move: Mv) => MoveSequence | OutOfSequenceError;
    //Returns pgn
    toString: () => string;
    setStrategy: (strategy: MoveSorter) => void;
}

type BiMoveIterNode = {
    //Might want to add a first() and last() method
    Move?: Mv;
    //Call these multiple times to get different branches
    Next?: () => BiMoveIterNode;
    Prev?: () => BiMoveIterNode;
    addNext: (Move: Mv) => void;
    //Doesn't really make sense to add a previous move
    //As it would make it easy to break the DAG constraints
}

class LMS implements MoveSequence {
    Moves: Mv[];
    CurrentMove: number;
    Move: BiMoveIterNode;
    Linear: boolean = true;
    Sort: MoveSorter = (old: BiMoveIterNode[]) => old;
    setStrategy: (strategy: MoveSorter) => void = (s) => {
    };

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

    Children(ChosenMove: Mv): MoveSequence {
        if (this.Moves[this.CurrentMove].equals(ChosenMove))
            this.CurrentMove++;
        return this;
    }

    Parents(ChosenMove?: Mv): MoveSequence {
        if (this.CurrentMove === 0)
            return this;
        if (ChosenMove && !this.Moves[this.CurrentMove - 1].equals(ChosenMove))
            return this;
        this.CurrentMove--;
        return this;
    }

    constructor(moves: Mv[]) {
        this.Moves = moves
        this.CurrentMove = 0;
        if (this.Moves.length > 0)
            this.Move = new LBMIN(this.Moves[0], this.Moves);
        else
            this.Move = new LBMIN(undefined, this.Moves);
    }

    toString(): string {
        return this.Moves.map((mv) => mv.toString()).join(",");
    }
}

class LBMIN implements BiMoveIterNode {
    Move?: Mv;
    Index: number;
    Container: Mv[];

    constructor(Move: Mv | undefined, Container: Mv[], idx: number = 0) {
        this.Move = Move;
        this.Container = Container;
        this.Index = idx
    }

    Next(): BiMoveIterNode {
        if (this.Index >= this.Container.length)
            return new LBMIN(undefined, this.Container, this.Index);
        return new LBMIN(this.Container[++this.Index], this.Container, this.Index)
    }

    Prev(): BiMoveIterNode {
        if (this.Index <= 0)
            return new LBMIN(undefined, this.Container, this.Index);
        return new LBMIN(this.Container[--this.Index], this.Container, this.Index)
    }

    addNext(Move: Mv): void {
        this.Next = () => new LBMIN(Move, this.Container);
    }
}


class GeneralMoveSequence implements MoveSequence {
    Move: BiMoveIterNode;
    Linear: boolean = false;
    Strategy: MoveSorter;

    [Symbol.iterator](): Iterator<Mv> {
        return {
            next: (): IteratorResult<Mv> => {
                // @ts-ignore
                if (this.Move && this.Move.Move && this.Move.Next()) {
                    return {done: false, value: new Mv(this.Move.Move.from, this.Move.Move.to)};
                }
                return {done: true, value: undefined};
            }
        }
    }

    Add(Move: Mv): MoveSequence | OutOfSequenceError {
        if (this.Move.Move.equals(Move))
            return this.Moves.get(Move);
        const newSeq = new GeneralMoveSequence();
        this.Moves.set(Move, newSeq);
        return newSeq;
    }

    Children(ChosenMove: Mv): MoveSequence | OutOfSequenceError {
        if (this.Move.Move ?? this.Move.Move.equals(ChosenMove))
            return this.Moves.get(ChosenMove);
        return "Out of sequence error";
    }

    constructor() {
        this.Moves = new Map<Mv, MoveSequence>();
        this.Move = {};
        this.Strategy = (old) => old;
    }

    toString(): string {
        return "Not implemented";
    }

    addNext(Move: Mv): void {
        const newSeq = new GeneralMoveSequence();
        this.Moves.set(Move, newSeq);
    }

    setStrategy(strategy: MoveSorter): void {
        this.Strategy = strategy;
    }

}


class LinearMoveSequence implements MoveSequence {
    Moves: Mv[];
    CurrentMove: number;
    Move: BiMoveIterNode;
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
            this.Move.Move = moves[moveIdx];
        else
            this.Move = "Out of sequence error";
    }

    toString(): string {
        return this.Moves.map((mv) => mv.from + mv.to).join(" ");
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


