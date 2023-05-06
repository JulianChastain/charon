import React, {useState} from 'react';
import {Chessboard} from 'react-chessboard';
import {Chess, Square} from 'chess.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App(): JSX.Element {
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState('start');
    const [feedback, setFeedback] = useState('White to move');
    function FeedbackBox({children}: { children: string }): JSX.Element {
        return (
            <div
                style={{
                    backgroundColor: '#3b4252',
                    borderColor: '#d8dee9',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    padding: '16px',
                    margin: '16px',
                    color: '#d8dee9',
                    position: 'absolute',
                    top: '50%',
                }}
            >
                {children}
            </div>
        );
    }
    const handleMove = (startSquare: Square, endSquare: Square): boolean => {
        try {
            const moveResult= game.move({from: startSquare, to: endSquare})
            if (moveResult === null) {
                setFeedback('Invalid move.');
                return false
            } else {
                setFen(game.fen());
                setFeedback('Correct move!');
                return true
            }
        } catch (err) {
            setFeedback('That move is not legal!');
            return false
        }
    };
    return (
        <div
            className="container"
            style={{
                height: '100vh',
                width: '100vw',
                }}
        >
            <div className="row">
                <div className="col">
                    <Chessboard
                        position={fen}
                        onPieceDrop={handleMove}/>
                </div>
                <div
                    className="col"
                    style={{backgroundColor: '#2e3440', height: '100vh'}}>
                    <FeedbackBox>{feedback}</FeedbackBox>
                </div>
            </div>
        </div>
    );
}

export default App;
