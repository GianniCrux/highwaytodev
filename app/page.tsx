import Game from "@/components/game";
import styles from "@/components/Game.module.css"


export default function Home() {
  return (
    <main className="">
      <h1> <span className={styles.title}>Highway To Dev</span> </h1>
      <Game />
    </main>
  );
}
