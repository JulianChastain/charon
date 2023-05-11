import React, {useEffect, useState} from 'react';
import {Chessboard} from 'react-chessboard';
import {Chess, DEFAULT_POSITION, Move, Square, validateFen} from 'chess.js';
import {MoveSequence, LinearMoveSequence, MoveHandler, Puzzle} from '../utils/classesAndTypes';
import {GameState} from "../components/GameState";
import {GameBoard} from "../components/GameBoard";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';





function App(): JSX.Element {
    const [[game, boardFen], setGameAndFen] = useState([new Chess(), 'start']);
    const [feedback, setFeedback] = useState('White to move');
    const [handler, setHandler] = useState<MoveHandler>(() => handleMove);
    const [[startPos, moves], setPuzzle] = useState<[string, MoveSequence]>(["", new LinearMoveSequence([])]);
    const gameRef = React.useRef(game);
    useEffect(() => {
        gameRef.current = game;
    }, [game]);



    function AddPuzzle(): MoveHandler {
        setFeedback("only linear puzzle supported currently")
        const startPos = gameRef.current.fen();
        return (startSquare: Square, endSquare: Square): boolean => {
            if (startSquare == undefined || endSquare == undefined)
                return false;
            try {
                const move: Move = gameRef.current.move({from: startSquare, to: endSquare});
                if (move === null) {
                    return false;
                }
                setFeedback((feedback) => (feedback[0] === 'o'?move.san:feedback + ', ' + move.san));
                setGameAndFen([gameRef.current, gameRef.current.fen()]);
                setPuzzle(([startPos, moves]) => {
                    moves.Add({from: startSquare, to: endSquare});
                    return [startPos, moves];
                })
                return true;
            } catch (e) {
                return false;
            }
        }
    }

    function QuizPuzzle(puz: Puzzle): void {
        const currentPosition = puz.moves[Symbol.iterator]();
        setGameAndFen([new Chess(puz.startPos), puz.startPos]);
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
            if (nextMoves === "Out of sequence error") {
                setFeedback("That's not right!");
                return false;
            }
            const move: Move = game.move(nextMoves.Move);
            if (move === null) {
                setFeedback("This puzzle contained an incorrect move!");
                return false;
            }
            setGameAndFen([game, game.fen()]);
            setFeedback(game.turn() === 'w' ? 'White to move' : 'Black to move');
            return true;
        }
        setHandler(puzzleHandler)
    }


    function FenInput({game, boardFen}: {game: Chess, boardFen: string}): JSX.Element {
        return (
            <div className={'rowItem row'}>
                <input
                    type="text"
                    value={boardFen}
                    onChange={(e) => {
                        if (validateFen(e.target.value)) {
                            setGameAndFen([new Chess(e.target.value), e.target.value]);
                            setFeedback(game.turn() === 'w' ? 'White to move' : 'Black to move');
                        }

                    }}
                />
                <button
                    onClick={() => {
                        console.log("Setting fen to " + boardFen)
                        setGameAndFen([new Chess(boardFen), boardFen]);
                        setFeedback(game.turn() === 'w' ? 'White to move' : 'Black to move');
                        setHandler(AddPuzzle())
                    }}
                >Enter Puzzle Creation Mode
                </button>
                <button>Finish Puzzle</button>
                <button>Load Puzzle</button>
                <GameState game={game} boardFen={boardFen}></GameState>
            </div>
        );
    }

    function FeedbackBox({
                             children
                         }
                             :
                             {
                                 children: string
                             }
    ):
        JSX.Element {
        return (
            <div
                className={'rowItem'}
                style={{
                    borderStyle: 'solid',
                }}
            >
                {children}
            </div>
        );
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
            const moveResult: Move = gameRef.current.move({from: startSquare, to: endSquare})
            if (moveResult === null) {
                setFeedback('Invalid move!');
                console.log('Handled move, encountered null move')
                return false
            } else {
                setGameAndFen([gameRef.current, gameRef.current.fen()]);
                setFeedback(moveResult.san);
                console.log('Handled move, should have given SAN')
                return true
            }

        } catch (e) {
            setFeedback('Invalid move!');
            console.log(gameRef.current.fen())
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
                    <GameBoard boardFen={boardFen} handler={handler}/>
                </div>
                <div
                    className="col-3"
                    style={{backgroundColor: '#2e3440'}}>
                    <div className="row">
                        <FeedbackBox>{feedback}</FeedbackBox>
                    </div>
                    <div className="row">
                        <FenInput boardFen={boardFen} game={game}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
