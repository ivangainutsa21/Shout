// import and configure firebase
import * as firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyBD9Y10YgrjShbygJlcwg2PK2ugDoPJ-YA",
    authDomain: "schedulesystem-b8d09.firebaseapp.com",
    databaseURL: "https://schedulesystem-b8d09.firebaseio.com",
    projectId: "schedulesystem-b8d09",
    storageBucket: "schedulesystem-b8d09.appspot.com",
    messagingSenderId: "37242890036"
}
export const firebaseApp = firebase.initializeApp(firebaseConfig)