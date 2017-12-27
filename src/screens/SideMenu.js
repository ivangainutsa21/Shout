import React, { Component } from 'react';
import Dimensions from 'Dimensions';
import {
	StyleSheet, View,TouchableOpacity, Text, ImageBackground, Image
} from 'react-native';

import { NavigationActions } from 'react-navigation'
import { firebaseApp } from '../firebase'
import srcLoginBackground from '../images/LoginBackground.png';
import store from '../store'

export default class SideMenu extends Component {

	constructor(props) {
		super(props);
		this.state = {
			fullName: '',
			email: '',
			avatar: ''
		};
	}

	componentDidMount() {
		/*
		var userId = firebaseApp.auth().currentUser.uid;
		var userName;
		firebaseApp.database().ref('/users/').child(userId).child('FullName').once('value')
		.then((snapshot) => {
			this.setState({
				fullName: snapshot.val(),
			})
		})
		.catch((error) => {
		})
		*/
		var user = firebaseApp.auth().currentUser;
		firebaseApp.database().ref('/users/').child(user.uid).child('FullName').once('value').then((snapshot) => {
			this.setState({
				fullName: snapshot.val(),
			})
		}).catch((error) => {
		})

		this.setState({
			avatar: user.photoURL,
			email: firebaseApp.auth().currentUser.email,
			fullName: store.getState().getUserInfo.fullName,
		})
	}
	render() {
        const { navigate } = this.props.navigation;
		return (
			<View style={styles.container}>
				<View style={{flex: 3, alignItems: 'center', justifyContent:'center', borderBottomColor: 'lightgrey', borderBottomWidth: 1}}>
					{
						this.state.avatar ?
							<Image source={{uri: this.state.avatar}} style={{height: 150, width: 150, borderRadius: 75, marginTop: 30}}/>
							:
							<View style={{height: 150, width: 150, borderRadius: 75, backgroundColor:'black', marginTop: 30}}/>
					}
                    <Text style={{backgroundColor: 'transparent', marginTop: 20}}>Hello, {this.state.fullName}</Text>
                </View>
                <View style={{flex: 1, justifyContent:'space-between', alignItems: 'center', paddingTop: 30}}>
                    <TouchableOpacity 
                        onPress = {() => {
                            this.props.navigation.navigate('DrawerClose');
                            setTimeout(() => {
                                navigate('userProfile');
                            }, 200);
                        }}>
                        <Text style = {{fontSize : 32, fontWeight: 'bold'}}>My Profile</Text>
                    </TouchableOpacity>
					{/*
                    <TouchableOpacity
                        onPress = {() => {
                            this.props.navigation.navigate('DrawerClose');
                            setTimeout(() => {
                                //navigate('settings');
                            }, 200);
                        }}>
                        <Text style = {{fontSize : 32, fontWeight: 'bold'}}>Settings</Text>
                    </TouchableOpacity>
					*/}
					<TouchableOpacity
                        onPress = {() => {
                            this.props.navigation.navigate('DrawerClose');
                            setTimeout(() => {
								//navigate('settings');
								firebaseApp.auth().signOut().then(function() {
									this.props.navigation.dispatch(resetLogin);
								}).catch(function(error) {
									// An error happened.
								});
                            }, 200);
                        }}>
                        <Text style = {{fontSize : 32, fontWeight: 'bold'}}>Logout</Text>
                    </TouchableOpacity>
                </View>
                <View style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
                    <Text>Powered By Talents Essence</Text>
                </View>
			</View>
		);
	}
}

const resetLogin = NavigationActions.reset({
	index: 0,
	actions: [
	  NavigationActions.navigate({ routeName: 'login'})
	]
})

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: null,
		backgroundColor: 'white',
	},
});
