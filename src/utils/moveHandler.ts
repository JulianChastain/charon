import {NewState, State} from "./reducer";
import {MoveHandler, Mv} from "./classesAndTypes";
import {Move, Square} from "chess.js";

export function defaultHandler(state: State, dispatch: (action: any) => any): MoveHandler {
    return (sourceSquare: Square, targetSquare: Square): boolean => {
        if (state.Game
            .moves({verbose: true})
            .filter(({from, to}) =>
                from === sourceSquare &&
                to === targetSquare).map((move: Move) => {
                dispatch(state.PuzzleMode ?
                    {Feedback: state.Feedback[0] === 'E' ? move.san : state.Feedback + "," + move.san} :
                    {Feedback: move.san}
                )
            }).some(() => true)) {
            console.log("Move is legal");
            dispatch({Move: new Mv(sourceSquare, targetSquare)});
            return true;
        }
        return false;
    }
}
type FilterFn = ({from, to}: {from: Square, to: Square}) => boolean
type FilterFactory = (s: State) => FilterFn
type MoveSucc = (m: Move, d: (a: any) => any, s: State) => void
type MoveFail = (m: Mv, d: (a: any) => any, s: State) => void

const defaultSuccess: MoveSucc = (m, d, s) => {
    if (s.PuzzleMode) {
        d({Feedback: s.Feedback[0] === 'E' ? m.san : s.Feedback + "," + m.san})
    } else {
        d({Feedback: m.san})
    }
}

const defaultHandlerMaker: FilterFactory = (s) => {
    return ({from, to}) => {
        const m = new Mv(from, to);
        return !!m.validFor(s.Game);
    }
}

class MoveHandlerBuilder {
    private OnSuccess: MoveSucc = defaultSuccess;
    private OnFailure: MoveFail = () => {};
    private Filter: FilterFn;
    private Dispatch: (action: any) => any
    private State: State;

    constructor(dispatch: (action: any) => any, state: State, filterMaker: FilterFactory = defaultHandlerMaker){
        this.Dispatch = dispatch;
        this.State = state;
        this.Filter = filterMaker(this.State);
    }

    success(reaction: MoveSucc): MoveHandlerBuilder {
        this.OnSuccess = reaction;
        return this;
    }

    failure(reaction: MoveFail): MoveHandlerBuilder {
        this.OnFailure = reaction;
        return this;
    }

    filter(filter: FilterFn): MoveHandlerBuilder {
        this.Filter = filter;
        return this;
    }

    handler: MoveHandler = (sourceSquare: Square, targetSquare: Square): boolean => {
        const mv = new Mv(sourceSquare, targetSquare);
        const move = mv.validFor(this.State.Game)
        if (move) {
            this.OnSuccess(move, this.Dispatch, this.State);
            //There may be slightly more decoupling if we actually dispatch the move within the success callback
            this.Dispatch({Move: move})
            return true;
        }
        this.OnFailure(mv, this.Dispatch, this.State);
        return false;
    }

}
