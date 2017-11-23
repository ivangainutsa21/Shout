import React, { Component } from 'react';
import PushNotification from 'react-native-push-notification';

import { firebaseApp } from './firebase'

export default class PushController extends Component {

    componentDidMount() {
        PushNotification.configure({
            onNotification: function(notification) {
                firebaseApp.auth().onAuthStateChanged(function(user) {
                if (user) {
                    //Actions.userPage();
                } else {
                // No user is signed in.
                }
            });
                console.log( 'NOTIFICATION:', notification );
            },
        });
    }
    render() {
        return null; 
    }
}