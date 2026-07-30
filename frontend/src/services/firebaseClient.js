import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  projectId: 'cap-decision-ft',
  appId: '1:151527769596:web:a0f1f59465d21b5dd81e79',
  storageBucket: 'cap-decision-ft.firebasestorage.app',
  apiKey: 'AIzaSyDzBSe43sQNKAuVd5vBf79V1ZP8B5Rtfuc',
  authDomain: 'cap-decision-ft.web.app',
  messagingSenderId: '151527769596',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
