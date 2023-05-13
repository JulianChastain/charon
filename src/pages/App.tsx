import React, {useReducer, useState} from 'react';
import {Chess, Square, validateFen} from 'chess.js';
import {MoveHandler} from '../utils/classesAndTypes';
import {GameBoard} from "../components/GameBoard";
import {FeedbackBox} from "../components/FeedbackBox";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';
import {GameState} from "../components/GameState";
import {NewState, Reducer} from "../utils/reducer";


function App(): JSX.Element {
    //Use reducer to manage all board related state
    const [{Game, Fen, Orientation, CurPuzzle, Puzzles, PuzzleMode, Feedback} , dispatch] = useReducer(Reducer, NewState());
    const [handler, setHandler] = useState<MoveHandler>(handleMove);

    function AddPuzzle({startFen}: {startFen:string}){
        // @ts-ignore
        dispatch({Feedback: "Only linear puzzles are supported right now"})
        // @ts-ignore
        dispatch({PuzzleMode: true});
        const handler = (startSquare: Square, endSquare: Square): boolean => {
            if (startSquare == undefined || endSquare == undefined){
                console.log("rejected move because start or end square was undefined")
                return false;
            }
            const move = Game.move({from: startSquare, to: endSquare});
            if (move == null){
                console.log("rejected move because move was null")
                return false;
            }
            // @ts-ignore
            dispatch({Move: move});
            return true;
        }
        setHandler(handler);
        return null
    }

    function ControlPanel({game, fen}: {game: Chess, fen: string}): JSX.Element {
        return (
            <div className={'rowItem row'}>
                <input
                    type="text"
                    value={fen}
                    onChange={(e) => {
                        if(!validateFen(e.target.value)) {
                            // @ts-ignore
                            dispatch({Feedback: "Invalid FEN"});
                        } else {
                            // @ts-ignore
                            dispatch({Fen: e.target.value});
                            // @ts-ignore
                            dispatch({Feedback: game.turn() === 'w' ? 'White to move' : 'Black to move'})
                        }
                    }}
                />
                <button
                    onClick={() => {
                        console.log("Setting fen to " + fen)
                        AddPuzzle({startFen: fen});
                    }}
                >Enter Puzzle Creation Mode
                </button>
                <button>Finish Puzzle</button>
                <button>Load Puzzle</button>
                <GameState game={game} boardFen={fen}></GameState>
            </div>
        );
    }

    function QuizPuzzle(): void {
        let puz = CurPuzzle
        const currentPosition = puz.moves[Symbol.iterator]();
        // @ts-ignore
        dispatch({PuzzleMode: false})
        // @ts-ignore
        dispatch({Fen: puz.startPos})
        // @ts-ignore
        dispatch({Feedback: game.turn() === 'w' ? 'White to move' : 'Black to move'})
        const puzzleHandler: MoveHandler = (startSquare: Square, endSquare: Square): boolean => {
            let nextMove = currentPosition.next();
            if (nextMove.done) {
                // @ts-ignore
                dispatch({Feedback: "Puzzle complete!"});
                return false;
            }
            if (nextMove.value.from !== startSquare || nextMove.value.to !== endSquare) {
                // @ts-ignore
                dispatch({Feedback: "Incorrect"});
                return false;
            }
            const nextMoves = puz.moves.Children({from: startSquare, to: endSquare});
            if (nextMoves === "Out of sequence error" || nextMoves.Move === "Out of sequence error") {
                // @ts-ignore
                dispatch({Feedback: "Incorrect"});
                return false;
            }
            // @ts-ignore
            dispatch({Move: nextMoves.Move});
            // @ts-ignore
            dispatch({Feedback: nextMoves.san})
            return true;
        }
        setHandler(puzzleHandler)
    }


    function handleMove(startSquare: Square, endSquare: Square): boolean {
        console.log('Handling move ' + startSquare + endSquare)
        try {
            if (startSquare === undefined || endSquare === undefined) {
                if (Game === undefined)
                    // @ts-ignore
                    dispatch({Feedback: 'Enter a valid fen'});
                else
                    // @ts-ignore
                    dispatch({Feedback: game.turn() === 'w' ? 'White to move' : 'Black to move'});
                return false;
            }
            // @ts-ignore
            dispatch({Feedback: game.turn() === 'w' ? 'White to move' : 'Black to move'});
            return true;

        } catch (e) {
            // @ts-ignore
            dispatch({Feedback: 'Invalid move'});
            return false;
        }
    }

    return (
        <div
            className="container"
            style={{
                height: '100vmin',
                width: '70%',
            }}
        >
            <div className="row">
                <div className="col-9">
                    <GameBoard boardFen={Fen} handler={handleMove}/>
                </div>
                <div
                    className="col-3"
                    style={{backgroundColor: '#2e3440'}}>
                    <div className="row">
                        <FeedbackBox>{Feedback}</FeedbackBox>
                    </div>
                    <div className="row">
                        <ControlPanel game={Game} fen={Fen}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
