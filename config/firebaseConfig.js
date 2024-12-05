// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

const {initializeApp} = require('firebase/app');

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD4CYkz-ljL7GR1XqXntv0XSog_iXls32Q",
  authDomain: "student-list-php.firebaseapp.com",
  projectId: "student-list-php",
  storageBucket: "student-list-php.firebasestorage.app",
  messagingSenderId: "818605897939",
  appId: "1:818605897939:web:616973616f8fd328ce7c26",
  measurementId: "G-0W3KWJVSTG"
};

// Initialize Firebase
// export const firebaseApp = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(firebaseApp);
const firebaseApp = initializeApp(firebaseConfig);
module.exports = firebaseApp;