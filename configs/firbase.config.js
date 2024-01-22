// import admin from "firebase-admin"
// import dotenv from "dotenv"
// import fs from "fs"
// import { dirname } from "path"
// import { fileURLToPath } from "url"
// import { getStorage } from "firebase/storage"

// dotenv.config()

// // import googleStorage from "@google-cloud/firestore"
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)

// const filePath = `${__dirname}/../serviceAccountKey.json`
// const serviceAccount = JSON.parse(fs.readFileSync(filePath))

// const firebaseApp = admin.initializeApp({
// 	credential: admin.credential.cert(serviceAccount),
// 	storageBucket: process.env.FIREBASE_STORAGE_URL,
// })

// const storage = getStorage(firebaseApp)

// export default storage

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyDGfFsYIISEPAMS5G5rK6WtQcyf6cFxvAs",
	authDomain: "instax-aab1d.firebaseapp.com",
	projectId: "instax-aab1d",
	storageBucket: "instax-aab1d.appspot.com",
	messagingSenderId: "127667571370",
	appId: "1:127667571370:web:9f4ae79cf58cc7ba5aded3",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const storage = getStorage(app)
export default storage
