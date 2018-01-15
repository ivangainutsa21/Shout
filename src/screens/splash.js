import React, { Component } from 'react';
import Dimensions from 'Dimensions';
import {
	View, Text,
} from 'react-native';
import { connect } from "react-redux";
import { NavigationActions } from 'react-navigation'
import Spinner from 'react-native-loading-spinner-overlay';

import { firebaseApp } from '../firebase'
import { getFullName, getGroup, } from '../actions'

const resetLogin = NavigationActions.reset({
	index: 0,
	actions: [
	  NavigationActions.navigate({ routeName: 'login'})
	]
})

const resetHome = NavigationActions.reset({
	index: 0,
	actions: [
	  NavigationActions.navigate({ routeName: 'homeGroup'})
	]
})

class Splash extends Component {
	
	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
		}
	}

	static navigationOptions = {
		header: null
	};
	
	componentDidMount() {
		
		firebaseApp.auth().onAuthStateChanged((user) => {
			if (user) {
				var userId = firebaseApp.auth().currentUser.uid;
				firebaseApp.database().ref('/users/').child(userId).child('FullName').once('value')
				.then((snapshot) => {

					this.setState({
						isLoading: false,
					})
					this.props.dispatch(getFullName(snapshot.val()));
					
					if(this.props.nf_payload != undefined && this.props.nf_payload.nfType ==  'nf_gotoPost') {
						let resetPost = NavigationActions.reset({
							index: 2,
							actions: [
							  NavigationActions.navigate({ routeName: 'homeGroup'}),
							  NavigationActions.navigate({ 
									routeName: 'home', 
									params:{
										  groupName: this.props.nf_payload.groupName, 
										  groupKey: this.props.nf_payload.groupKey,
										  groupCreator: this.props.nf_payload.groupCreator,
									  }
								  }),
							  NavigationActions.navigate({ 
									routeName: 'comment', 
									params:{
										postName:  this.props.nf_payload.postName, 
										downloadUrl: this.props.nf_payload.downloadUrl, 
										shoutTitle: this.props.nf_payload.shoutTitle, 
										userName: this.props.nf_payload.userName, 
										date: this.props.nf_payload.date, 
										voiceTitle: this.props.nf_payload.voiceTitle,
										groupName: this.props.nf_payload.groupName, 
										groupKey: this.props.nf_payload.groupKey,
										groupCreator: this.props.nf_payload.groupCreator,
									}
								}),
							]
						})
						this.props.navigation.dispatch(resetPost);
					} else if(this.props.nf_payload != undefined && this.props.nf_payload.nfType ==  'nf_invitation'){
						let resetNotification = NavigationActions.reset({
							index: 1,
							actions: [
							  NavigationActions.navigate({ routeName: 'homeGroup'}),
							  NavigationActions.navigate({ 
									routeName: 'notifications',
								}),
							]
						})
						this.props.navigation.dispatch(resetNotification);
					} else {
						this.props.navigation.dispatch(resetHome);
					}
				})
				.catch((error) => {                                                                                                                                                                                                                                                    
					this.setState({
						isLoading: false,
					})
					console.log(error);
				})
				
			} else {
				this.setState({
					isLoading: false,
				})
        		this.props.navigation.dispatch(resetLogin);
			}
		});
	}

	render() {
		return (
			<View>
				<Spinner visible={this.state.isLoading} textContent={"Loading..."} textStyle={{color: '#FFF'}} />
			</View>
		);
	}
} 

function mapStateToProps(state) {
	return {
        nf_payload: state.getAppInfo.nf_payload,
	};
}
export default connect(mapStateToProps)(Splash)