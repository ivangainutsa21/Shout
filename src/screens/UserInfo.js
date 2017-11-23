var userId = firebaseApp.auth().currentUser.uid;
var name;
firebaseApp.database().ref('/users/').child(userId).once('value')
.then((snapshot) => {
    alert(snapshot.val().FullName);
})
.catch((error) => {
    alert(error);
})