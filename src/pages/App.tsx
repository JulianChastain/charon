import React, {useEffect, useReducer, useState} from 'react';
import {Chess, Move, Square, validateFen} from 'chess.js';
import {LinearMoveSequence, MoveHandler, MoveSequence, Mv, Puzzle} from '../utils/classesAndTypes';
import {GameBoard} from "../components/GameBoard";
import {FeedbackBox} from "../components/FeedbackBox";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';
import {GameState} from "../components/GameState";
import {NewState, Reducer, State} from "../utils/reducer";


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

    function QuizPuzzle(puz: Puzzle): void {
        const currentPosition = puz.moves[Symbol.iterator]();
        SetGameFen(puz.startPos);
        game.turn() === 'w' ? setFeedback('White to move') : setFeedback('Black to move');
        const puzzleHandler: MoveHandler = (startSquare: Square, endSquare: Square): boolean => {
            let nextMove = currentPosition.next();
            if (nextMove.done) {
                setFeedback("You solved the puzzle!");
                return false;
            }
            if (nextMove.value.from !== startSquare || nextMove.value.to !== endSquare) {
                setFeedback("That's not right!");
                return false;
            }
            const nextMoves = puz.moves.Children({from: startSquare, to: endSquare});
            if (nextMoves === "Out of sequence error" || nextMoves.Move === "Out of sequence error") {
                setFeedback("That's not right!");
                return false;
            }
            const move = GameMove(nextMoves.Move);
            if (move === null) {
                setFeedback("This puzzle contained an incorrect move!");
                return false;
            }
            setFeedback(game.turn() === 'w' ? 'White to move' : 'Black to move');
            return true;
        }
        setHandler(() => puzzleHandler)
    }


    function handleMove(startSquare: Square, endSquare: Square): boolean {
        console.log('Handling move ' + startSquare + endSquare)
        try {
            if (startSquare === undefined || endSquare === undefined) {
                if (game === undefined)
                    setFeedback('Enter a valid fen');
                else
                    setFeedback(game.turn() === 'w' ? 'White to move' : 'Black to move');
                console.log('Handled move, exited early')
                return false;
            }
            let [moveResult,gm] = GameMove({from: startSquare, to: endSquare});
            setFen(gm.fen());
            if (moveResult === null) {
                setFeedback('Invalid move!');
                console.log('Handled move, encountered null move')
                return false
            } else {
                setFeedback(moveResult.san);
                console.log('Handled move, should have given SAN in feedback')
                return true
            }

        } catch (e) {
            setFeedback('Invalid move!');
            console.log(fen)
            console.log('caught error(s):')
            console.log(e)
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
                    <GameBoard boardFen={fen} handler={handleMove}/>
                </div>
                <div
                    className="col-3"
                    style={{backgroundColor: '#2e3440'}}>
                    <div className="row">
                        <FeedbackBox>{feedback}</FeedbackBox>
                    </div>
                    <div className="row">
                        <ControlPanel game={game} fen={fen}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
