import { signOut } from "firebase/auth";
import { auth } from "@/firebase";


export const logout = async () => {
  try {
    await signOut(auth);
    console.log("Utente disconnesso");
  } catch (error) {
    console.error("Errore durante il logout:", error);
  }
};
