import AuthButton from "@/_components/authButton";
import Game from "@/components/game";
import styles from "@/components/Game.module.css"
import "./globals.css"


export default function Home() {
  return (
    <main>
      <h1 className={styles.top}> <span className={styles.title}>Highway To Dev</span> </h1>
      <AuthButton />
      <Game />
    </main>
  );
}
