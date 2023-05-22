import {Chess, DEFAULT_POSITION, Move, Square} from "chess.js";

export type OutOfSequenceError = "Out of sequence error";
export type MoveHandler = (startSquare: Square, endSquare: Square) => boolean;
export type MoveSorter = (old: BiMoveIterNode[]) => BiMoveIterNode[];
const DUMMY_MOVE: Move = (new Chess()).moves({verbose: true})[0];

//Type containing a square and ending square
class Mv {
    //TODO convert class to type
    from: Square;
    to: Square;

    constructor(from: Square, to: Square) {
        this.from = from;
        this.to = to;
    }

    //TODO change all of these from methods to functions
    fullMove(game: Chess): Move | false {
        const trueMove: Move = game
            .moves({verbose: true})
            .filter(({from, to}) => from === this.from && to === this.to)
            .reduce((m1: Move, m2: Move) => m2, DUMMY_MOVE)
        return trueMove === DUMMY_MOVE ? false : trueMove;
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
export interface MoveSequence extends Array<Mv> {
    //I don't know if supporting the iterable protocol means I can index in and get .length
    Move: BiMoveIterNode;
    Linear: boolean;
    Sort: MoveSorter;
    Children: (ChosenMove: Mv) => MoveSequence;
    Parents: (ChosenMove?: Mv) => MoveSequence;
    //Might want to add a first() and last() BiMoveIterNode method that returns the root or a leaf
    //Add may not be needed up here as it duplicates the responsibility from BMIN
    Add: (Move: Mv) => MoveSequence | OutOfSequenceError;
    //Returns pgn
    toString: () => string;
    setStrategy: (strategy: MoveSorter) => void;
}

type BiMoveIterNode = {
    //Might want to add a first() and last() bool method
    Move?: Mv;
    //Call these multiple times to get different branches
    Next?: () => BiMoveIterNode;
    Prev?: () => BiMoveIterNode;
    addNext: (Move: Mv) => void;
    //Doesn't really make sense to add a previous move
    //As it would make it easy to break the DAG constraints
}

class LMS extends Array<Mv> implements MoveSequence {
    CurrentMove: number;
    Move: BiMoveIterNode;

    //These three aren't used
    Linear: boolean = true;
    Sort: MoveSorter = (old: BiMoveIterNode[]) => old;
    setStrategy: (strategy: MoveSorter) => void = (s) => undefined;

    Add(Move: Mv): MoveSequence | OutOfSequenceError {
        if (this.length !== this.CurrentMove)
            return "Out of sequence error";
        this.push(Move);
        this.CurrentMove++;
        return this;
    }

    Children(ChosenMove: Mv): MoveSequence {
        if (this[this.CurrentMove].equals(ChosenMove))
            this.CurrentMove++;
        return this;
    }

    Parents(ChosenMove?: Mv): MoveSequence {
        if (this.CurrentMove === 0)
            return this;
        if (ChosenMove && !this[this.CurrentMove - 1].equals(ChosenMove))
            return this;
        this.CurrentMove--;
        return this;
    }

    constructor(movesParam: Mv[] | number) {
        if (typeof movesParam === 'number') {
            // @ts-ignore
            super(movesParam)
        } else {
            // @ts-ignore
            super(...movesParam);
        }
        this.CurrentMove = 0;
        if (this.length > 0)
            this.Move = new LBMIN(this[0], this);
        else
            this.Move = new LBMIN(undefined, this);
    }

    toString(): string {
        return this.map((mv) => mv.toString()).join(",");
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

export type Turn = {
    White?: Mv;
    Black?: Mv;
}

export function getTurns(p: Puzzle) {
    const game = new Chess(p.startPos);
    const turns: {White: string, Black: string}[] = []
    if (game.turn() === 'b') {
        turns.push({White: "", Black: ""});
    }
    for (const move of p.moves) {
        let san = game.move(move).san;
        if(game.turn() === 'w'){
            turns[turns.length - 1].Black = san;
        } else {
            turns.push({White: san, Black: ""});
        }
    }
    return turns
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

export {LMS, LBMIN, Mv, Puzzle};


