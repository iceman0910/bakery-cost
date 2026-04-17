// src/lib/firebase.js
// 請將下方設定換成你的 Firebase 專案資訊
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBdohEN4PBAj3-Wcmsae4pwZNUrCyuQw04",
  authDomain: "bakery-cost.firebaseapp.com",
  projectId: "bakery-cost",
  storageBucket: "bakery-cost.firebasestorage.app",
  messagingSenderId: "32199948544",
  appId: "1:32199948544:web:65776afccbd4b30a045be5"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
