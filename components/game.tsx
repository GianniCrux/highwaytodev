"use client";

import React, { useState, useEffect, useCallback } from 'react';
import styles from './Game.module.css'
import trees from '@/public/trees.jpg'
import Image from 'next/image';


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
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 60;
const OBSTACLE_WIDTH = 30;
const OBSTACLE_HEIGHT = 60;
const MARKING_HEIGHT = 40;
const MARKING_WIDTH = 10;
const MARKING_GAP = 30;
const INITIAL_SPAWN_INTERVAL = 1500; // Initial time between obstacle spawns (ms)
const MIN_SPAWN_INTERVAL = 500; // Minimum time between obstacle spawns (ms)
const INITIAL_SPAWN_CHANCE = 0.2; // Initial chance of spawning an obstacle
const MAX_SPAWN_CHANCE = 0.5; // Maximum chance of spawning an obstacle
const INITIAL_MIN_DISTANCE = 150; // Initial minimum distance between obstacles
const MIN_DISTANCE = 80; // Minimum distance between obstacles at highest difficulty
const DIFFICULTY_INCREASE_INTERVAL = 10; // Score at which difficulty increases

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
    const [lastObstacleTime, setLastObstacleTime] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [previousLane, setPreviousLane] = useState<number | null>(null); //Keep track of the last lane used
    const [topScores, setTopScores] = useState<number[]>([]);

    const restartGame = useCallback(() => {
        setPlayerPosition({ x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2, y: GAME_HEIGHT - PLAYER_HEIGHT - 20 });
        setObstacles([]);
        setGameOver(false);
        setScore(0);
        setLastObstacleTime(0);
        setIsPlaying(true);
        setPreviousLane(null);
    }, []);

    const calculateSpeed = (score: number) => {
        const baseSpeed = 9;
        return baseSpeed + Math.floor(score / 100);
    }

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            setPlayerPosition(prev => ({...prev, x: Math.max(0, prev.x - 100)})); //change those for testing        
        } else if (e.key === 'ArrowRight') {
            setPlayerPosition(prev => ({...prev, x: Math.min(380, prev.x + 100)}));
        } else if (e.key === 'r') {
            restartGame();
        }
    }, [restartGame]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        const storedScores = localStorage.getItem('topScores');
        if (storedScores) {
            setTopScores(JSON.parse(storedScores));
        }
    }, []);

    const updateTopScores = useCallback((newScore: number) => {
        setTopScores(prevScores => {
            const updatedScores = [...prevScores, newScore].sort((a, b) => b - a).slice(0, 5);
            localStorage.setItem('topScores', JSON.stringify(updatedScores));
            return updatedScores;
        });
    }, []);

    useEffect(() => {

        const gameLoop = setInterval(() => {
            if (!isPlaying) return;

            const currentTime = Date.now(); //to check if enough time is passed to generate a new obstacle
            const currentSpeed = calculateSpeed(score);


        // Calculate current difficulty based on score
        const difficultyLevel = Math.floor(score / DIFFICULTY_INCREASE_INTERVAL);
        const currentSpawnInterval = Math.max(INITIAL_SPAWN_INTERVAL - difficultyLevel * 50, MIN_SPAWN_INTERVAL);
        const currentSpawnChance = Math.min(INITIAL_SPAWN_CHANCE + difficultyLevel * 0.1, MAX_SPAWN_CHANCE);
        const currentMinDistance = Math.max(INITIAL_MIN_DISTANCE - difficultyLevel * 10, MIN_DISTANCE);            

            setObstacles(prev => {
                // Move existing obstacles down
                const movedObstacles = prev.map(obs => ({ ...obs, y: obs.y + currentSpeed }))
                    .filter(obs => obs.y < GAME_HEIGHT);
                
            // Generate new obstacle with minimum time gap and distance
            if (currentTime - lastObstacleTime > currentSpawnInterval && Math.random() < currentSpawnChance) {
                let lane: number;
                do { //This loop ensures that a new lane is selected if it's the same as the previous one
                    lane = Math.floor(Math.random() * 3);
                } while (lane === previousLane); 

                const newObstacleY = -OBSTACLE_HEIGHT;
                
                // Check if there's enough distance from the last obstacle
                if (!movedObstacles.some(obs => obs.y < currentMinDistance)) {
                    movedObstacles.push({ 
                        x: lane * LANE_WIDTH + (LANE_WIDTH - OBSTACLE_WIDTH) / 2, 
                        y: newObstacleY, 
                        lane 
                    });
                    setLastObstacleTime(currentTime);
                    setPreviousLane(lane); //After spawning a new obstacle update the 'previousLane' state with the current lane.
                }
            }

                return movedObstacles;
            });


            setRoadMarkings(prev => {
                const movedMarkings = prev.map(mark => ({ ...mark, y: mark.y + currentSpeed }));
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
                    setIsPlaying(false);
                    updateTopScores(score);
                    return prev;
                }
                return prev;
            });
            setScore(prev => prev + 1);

        }, 50);

        return () => clearInterval(gameLoop);
    }, [obstacles, lastObstacleTime, isPlaying, score, gameOver, previousLane, updateTopScores]); 


    return (
        <div className={styles.mainContainer}>
        <div className={styles.gameContainer} style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
            {gameOver ? (
                <div className={styles.gameOver}>
                    GameOver! Score: {score}
                    <br />
                    Press &apos;R&apos;  to restart the game.
                </div>
            ) : (
                <div className={styles.score}> Score: {score}</div>
            )}
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
        <div className={styles.scoreBoard}>
        <h3>Top Scores</h3>
        {topScores.map((topScore, index) => (
          <div key={index} className={styles.scoreItem}>
            {index + 1}. {topScore}
          </div>
        ))}
      </div>
        <div className={styles.treesContainer}>
            <Image src={trees} className={styles.leftTree} alt='trees'/>
            <Image src={trees} className={styles.rightTree} alt='trees'/>
        </div>
       </div>
    );
};

export default Game;