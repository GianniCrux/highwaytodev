import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWoH3yCVq8dAxJxwQz7PkmmVadz2YNZeY",
  authDomain: "highwaytodevs.firebaseapp.com",
  databaseURL: "https://highwaytodevs-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "highwaytodevs",
  storageBucket: "highwaytodevs.appspot.com",
  messagingSenderId: "72562560223",
  appId: "1:72562560223:web:96c6f4f6a6e4e055326d6a",
  measurementId: "G-GX3VXSFTC9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const database = getDatabase(app)

export { database }