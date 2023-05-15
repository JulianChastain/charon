import React, {useReducer, useState} from 'react';
import {Chess, Square, validateFen} from 'chess.js';
import {MoveHandler} from '../utils/classesAndTypes';
import {GameBoard} from "../components/GameBoard";
import {FeedbackBox} from "../components/FeedbackBox";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';
import {GameState} from "../components/GameState";
import {Action, NewState, Reducer, State} from "../utils/reducer";
import {Chessboard} from "react-chessboard";


function App(): JSX.Element {
    //Use reducer to manage all board related state
    const [state, dispatch] = useReducer(Reducer, NewState());
    const [handler, setHandler] = useState<MoveHandler>(handleMove);


    function AddPuzzle({startFen, setHandler}: { startFen: string, setHandler: (handler: MoveHandler) => void }) {
        // @ts-ignore
        dispatch({Feedback: "Only linear puzzles are supported right now"})
        // @ts-ignore
        dispatch({PuzzleMode: true});
        const handler = (startSquare: Square, endSquare: Square): boolean => {
            if (startSquare == undefined || endSquare == undefined) {
                console.log("rejected move because start or end square was undefined")
                return false;
            }
            const move = state.Game.move({from: startSquare, to: endSquare});
            if (move == null) {
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

    function ControlPanel({game, fen}: { game: Chess, fen: string }): JSX.Element {
        return (
            <div className={'rowItem row'}>
                <input
                    type="text"
                    value={fen}
                    onChange={(e) => {
                        if (!validateFen(e.target.value)) {
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
                        // @ts-ignore
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

    function DevControlPanel({state, dispatch, setHandler}: {
        state: State,
        dispatch: React.Dispatch<Action>,
        setHandler: React.Dispatch<React.SetStateAction<MoveHandler>>
    }): JSX.Element {
        return (
            <div className={'rowItem row'}>
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                    <div className="w-full max-w-md p-4 bg-white rounded-md shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-700">Control</h2>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium text-gray-600" htmlFor="username">Text
                                Input</label>
                            <input
                                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 focus:border-indigo-300"
                                type="text" name="username" id="username"/>
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                className="px-4 py-1 text-sm font-medium text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50">Button
                                1
                            </button>
                            <button
                                className="px-4 py-1 text-sm font-medium text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50">Button
                                2
                            </button>
                            <button
                                className="px-4 py-1 text-sm font-medium text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50">Button
                                3
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        )
    }

    function QuizPuzzle(): void {
        let puz = state.CurPuzzle
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
                if (state.Game === undefined)
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

    let appLayout = (<div
            className="container"
            style={{
                height: '100vmin',
                width: '70%',
            }}
        >
            <div className="row">
                <div className="col-9">
                    <GameBoard boardFen={state.Fen} handler={handleMove}/>
                </div>
                <div
                    className="col-3"
                    style={{backgroundColor: '#2e3440'}}>
                    <div className="row">
                        <FeedbackBox>{state.Feedback}</FeedbackBox>
                    </div>
                    <div className="row">
                        {/* <ControlPanel game={state.Game} fen={state.Fen}/> */}
                        <DevControlPanel state={state} dispatch={dispatch} setHandler={setHandler}/>
                    </div>
                </div>
            </div>
        </div>)

    return (
        <Bing boardFen={state.Fen} moveHandler={handleMove}/>
    );
}

export default App;
