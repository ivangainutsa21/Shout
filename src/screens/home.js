import React, { Component } from 'react';
import {
	StyleSheet, View,TouchableOpacity, Text, ImageBackground, Image, ListView,
} from 'react-native';
import { connect } from "react-redux";
import OneSignal 	from 'react-native-onesignal';
import Sound 		from 'react-native-sound';

import { firebaseApp } 		from '../firebase'

class Home extends Component {
	constructor(props) {
		super(props);
		const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
		
		this.state = {
			dataSource: ds.cloneWithRows(['row 1', 'row 2']),

			playing: false,
			playingRow: undefined,
		};

		this.renderRow = this.renderRow.bind(this);
	}

	static navigationOptions = {
		header: null
	};

	componentDidMount() {
		firebaseApp.database().ref('playerIds/').child(this.props.playerIds).set({
			fullName: this.props.fullName,
		})
		firebaseApp.database().ref().child('posts').child(this.props.navigation.state.params.groupName).on('value', (snap) => {
            var workshops = [];
            snap.forEach((child) => {
                workshops.push({
					downloadUrl: child.val().downloadUrl,
					userName: child.val().userName,
					shoutTitle: child.val().shoutTitle,
					comments: child.val().comments,
					likes: child.val().likes,
					date: child.val().date,
					voiceTitle: child.val().voiceTitle,
					postName: child.key,
                });
			});
			workshops.reverse();
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(workshops)
			});
		});
	}
	renderRow(item, sectionId, rowId){
        return(
			<View style={{backgroundColor: 'whitesmoke', paddingBottom: 20}}>
				<TouchableOpacity style={{flex: 1, }} activeOpacity={1}
					onPress = {() => {
						if(item.postName != null){
							this.props.navigation.navigate('comment', {postName: item.postName, downloadUrl: item.downloadUrl, shoutTitle: item.shoutTitle, userName: item.userName, date: item.date, voiceTitle: item.voiceTitle, groupName: this.props.navigation.state.params.groupName});
						}
					}}>
					<View style = {{shadowOffset:{ height: 1,  },shadowColor: 'black', shadowOpacity: 1.0,}}>
						<View style={{backgroundColor: 'black', height: 250, borderWidth: 3, borderColor: 'black'}}>
							<Image source={{uri: item.downloadUrl}} style={{flex: 1, }}/>
						</View>
					</View>
				</TouchableOpacity>
				<View style={{alignItems: 'center', justifyContent: 'center', backgroundColor: 'whitesmoke'}}>
					<View style={{height: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 38}}>
							<Text numberOfLines={1} style={{fontSize: 18,}}>{item.shoutTitle}</Text>
							<Image source={require('../images/comment.png')} style={{width: 18, height: 18, marginLeft: 10}}/>
							<Text style={{fontSize: 12, color: 'darkgray',}}>{item.comments}</Text>
							<Image source={require('../images/like.png')} style={{width: 18, height: 18, marginLeft: 10}}/>
							<Text style={{fontSize: 12, color: 'darkgray',}}>{item.likes}</Text>
							{
								item.voiceTitle != undefined ?
								<TouchableOpacity style={{marginLeft: 10}} 
									onPress = {() => {
										if(currentSound != null)
										{
											currentSound.stop();
											currentSound.release();
										}
										if(rowId == this.state.playingRow && this.state.playing == true)
										{
											this.setState({
												playing: false,
											})
											return;
										}
										const sound = new Sound(item.voiceTitle, '', error => callback(error, sound));
										this.setState({
											playing: true,
										})
										
										this.setState({
											playingRow: rowId,
										})

										const callback = (error, sound) => {
											if (error || this.state.playing == false) {
												return;
											}
											currentSound = sound;
											sound.play(() => {
												this.setState({
													playing: false,
												})
												sound.release();
											});
										};
								}}>
								{
								rowId == this.state.playingRow ?
									<Image source={this.state.playing == false ? require('../images/play-button.png') : require('../images/stop-button.png')} style={{height: 18, width: 18}}/>	
									:
									<Image source={require('../images/play-button.png')} style={{height: 18, width: 18}}/>	
								}
								</TouchableOpacity>
								:
								null
							}
					</View>
						<Text style={{fontSize: 12,}}>{item.userName}, {item.date}</Text>
					
				</View>
			</View>
        );
    }

	render() {
		const { navigate } = this.props.navigation;
		return (
			<View style={[styles.container, style = {marginHorizontal: 5,}]}>
				<View style={{height: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems:'center', marginTop: 5, marginHorizontal: 20}} >
					<TouchableOpacity style={{}} 
						onPress = {() => {
							this.props.navigation.goBack();
					}}>
						<Image source={require('../images/backbtn.png')} style={{height: 40, width: 40}}/>	
					</TouchableOpacity>
					<Text style = {{fontSize: 32, backgroundColor: 'transparent', color: 'black', }}>{this.props.navigation.state.params.groupName}</Text>
				</View>
				<View style = {{flex: 1, backgroundColor: 'aliceblue'}}>
					<ListView
						dataSource={this.state.dataSource}
						renderRow={this.renderRow}
						enableEmptySections={true}
					/>
	
				</View>
				<View style = {{backgroundColor:'transparent', flexDirection: 'row', justifyContent:'space-between', paddingHorizontal: 50, alignItems: 'center' , height:40, borderWidth: 1, borderColor: 'black', marginTop: 1}}>
					<TouchableOpacity
						style = {{}}
						onPress = {() => {
							navigate('userProfile');
						}}>
						<Image source={require('../images/home_user.png')} style={{width: 32, height: 32,}}/>
					</TouchableOpacity>
					<TouchableOpacity
						style = {{}}
						onPress = {() => {
							navigate('post', {groupName: this.props.navigation.state.params.groupName, groupKey: this.props.navigation.state.params.groupKey});
						}}>
						<Image source={require('../images/home_plus.png')} style={{width: 32, height: 32,}}/>
					</TouchableOpacity>
					<TouchableOpacity
						style = {{}}
						onPress = {() => {
							//navigate('homeGroup');
						}}>
						<Image source={require('../images/home_notification.png')} style={{width: 32, height: 32,}}/>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}

const currentSound = null;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'aliceblue',
	},
});

function mapStateToProps(state) {
	return {
	  playerIds: state.getUserInfo.playerIds,
	  fullName: state.getUserInfo.fullName,
	};
}

export default connect(mapStateToProps)(Home);