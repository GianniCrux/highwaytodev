"use client";

import React, { useState, useEffect, useCallback } from 'react';
import styles from './Game.module.css'

interface Position {
    x: number;
    y: number;
}

const Game: React.FC = () => {
    const [playerPositon, setPlayerPosition] = useState<Position>({ x: 200, y: 500 });
    const [obstacles, setObstacles] = useState<Position[]>([]);
    const [gameOver, setGameOver] = useState<boolean>(false);

    const movePlayer = useCallback((e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            setPlayerPosition(prev => ({...prev, x: Math.max(0, prev.x - 10)}));
        } else if (e.key === 'ArrowRight') {
            setPlayerPosition(prev => ({...prev, x: Math.min(380, prev.x + 10)}));
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', movePlayer);
        return () => window.removeEventListener('keydown', movePlayer);
    }, [movePlayer]);

    useEffect(() => {
        const gameLoop = setInterval(() => {
            setObstacles(prev => {
                // Move existing obstacles down
                const movedObstacles = prev.map(obs => ({ ...obs, y: obs.y + 5 }))
                    .filter(obs => obs.y < 600);
                
                // Randomly generate new obstacle
                if (Math.random() < 0.1) {  // Increased probability for testing
                    movedObstacles.push({ x: Math.random() * 350, y: 0 });
                }

                return movedObstacles;
            });

            setPlayerPosition(prev => {
                // Check for collisions
                if (obstacles.some(obs => 
                    obs.x < prev.x + 20 &&
                    obs.x + 50 > prev.x &&
                    obs.y < prev.y + 30 &&
                    obs.y + 30 > prev.y
                )) { 
                    setGameOver(true);
                    clearInterval(gameLoop);
                }
                return prev;
            });

        }, 50);

        return () => clearInterval(gameLoop);
    }, [obstacles]); 

    return (
        <div>
            {gameOver && <div className={styles.gameOver}> Game Over! </div>}
            <div className={styles.player} style={{ left: playerPositon.x, top: playerPositon.y}} />
            {obstacles.map((obs, index) => (
                <div key={index} className={styles.obstacle} style={{left: obs.x, top: obs.y}}/>
            ))}
        </div>
    );
};

export default Game;