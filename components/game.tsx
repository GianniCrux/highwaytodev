"use client";

import React, { useState, useEffect, useCallback } from 'react';
import styles from './Game.module.css'

interface Position {
    x: number;
    y: number;
}

interface Obstacle extends Position {
    lane: number;
}

interface RoadMarking {
    y: number;
}

const GAME_WIDTH = 300;
const GAME_HEIGHT = 600;
const LANE_WIDTH = GAME_WIDTH / 3;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 60;
const OBSTACLE_WIDTH = 40;
const OBSTACLE_HEIGHT = 60;
const MARKING_HEIGHT = 60;
const MARKING_WIDTH = 10;
const MARKING_GAP = 30;
const SPEED = 5;

const Game: React.FC = () => {

    const initializeRoadMarkings = (): RoadMarking[] => {
        const markings: RoadMarking[] = [];
        for (let y = -MARKING_HEIGHT; y < GAME_HEIGHT; y += MARKING_HEIGHT + MARKING_GAP) {
            markings.push({ y });
        }
        return markings;
    };

    const [playerPosition, setPlayerPosition] = useState<Position>({ x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2, y: GAME_HEIGHT - PLAYER_HEIGHT - 20 });
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const [roadMarkings, setRoadMarkings] = useState<RoadMarking[]>(initializeRoadMarkings());
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
                    .filter(obs => obs.y < GAME_HEIGHT);
                
                // Randomly generate new obstacle
                if (Math.random() < 0.5) {  // Increased probability for testing
                    const lane = Math.floor(Math.random() * 3);
                    movedObstacles.push({ x: lane * LANE_WIDTH + (LANE_WIDTH - OBSTACLE_WIDTH) / 2, y: -OBSTACLE_HEIGHT, lane });
                }

                return movedObstacles;
            });

            setRoadMarkings(prev => {
                const movedMarkings = prev.map(mark => ({ ...mark, y: mark.y + SPEED }));
                const visibleMarkings = movedMarkings.filter(mark => mark.y < GAME_HEIGHT);
                
                while (visibleMarkings[0].y > 0) {
                    visibleMarkings.unshift({ y: visibleMarkings[0].y - MARKING_HEIGHT - MARKING_GAP });
                }
                return visibleMarkings;
            });

            setPlayerPosition(prev => {
                // Check for collisions
                if (obstacles.some(obs => 
                    obs.x < prev.x + PLAYER_WIDTH &&
                    obs.x + OBSTACLE_WIDTH > prev.x &&
                    obs.y < prev.y + PLAYER_HEIGHT &&
                    obs.y + OBSTACLE_HEIGHT > prev.y
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
        <div className={styles.gameContainer} style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
            {gameOver && <div className={styles.gameOver}> Game Over! </div>}
            <div className={styles.player} style={{ left: playerPosition.x, top: playerPosition.y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT }} />
            {obstacles.map((obs, index) => (
                <div key={index} className={styles.obstacle} style={{left: obs.x, top: obs.y, width: OBSTACLE_WIDTH, height: OBSTACLE_HEIGHT}}/>
            ))}
        {roadMarkings.map((mark, index) => (
            <React.Fragment key={index}>
                <div className={styles.roadMarking} style={{
                    left: LANE_WIDTH - MARKING_WIDTH / 2, 
                    top: mark.y, 
                    width: MARKING_WIDTH,
                    height: MARKING_HEIGHT
                }}/>
                <div className={styles.roadMarking} style={{
                    left: LANE_WIDTH * 2 - MARKING_WIDTH / 2, 
                    top: mark.y, 
                    width: MARKING_WIDTH,
                    height: MARKING_HEIGHT
                }}/>
            </React.Fragment>
        ))}
        </div>
    );
};

export default Game;