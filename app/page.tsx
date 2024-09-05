import AuthButton from "@/_components/authButton";
import Game from "@/components/game";
import styles from "@/components/Game.module.css"
import "./globals.css"


export default function Home() {
  return (
    <main>
      <header className={styles.header}>
        <h1 className={styles.title}>Highway To Dev</h1>
        <AuthButton />
      </header>
      <Game />
    </main>
  );
}
