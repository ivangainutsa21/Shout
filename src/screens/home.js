import React, { Component } from 'react';
import {
	StyleSheet, View,TouchableOpacity, Text, ImageBackground, Image, ListView,
} from 'react-native';
import OneSignal from 'react-native-onesignal';

import { firebaseApp } 		from '../firebase'
import srcLoginBackground 	from '../images/postbackground.png';
import srcAddPost 			from '../images/addpost.png';

export default class Home extends Component {
	constructor(props) {
		super(props);
		const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
		
		this.state = {
			dataSource: ds.cloneWithRows(['row 1', 'row 2']),
		};

		this.renderRow = this.renderRow.bind(this);
	}

	componentDidMount() {
		firebaseApp.database().ref().child('posts').on('value', (snap) => {
            var workshops = [];
            snap.forEach((child) => {
                workshops.push({
					downloadUrl: child.val().downloadUrl,
					userName: child.val().userName,
					shoutTitle: child.val().shoutTitle,
					views: child.val().views,
					comments: child.val().comments,
					likes: child.val().likes,
					date: child.val().date,
					postName: child.key,
                });
			});
			workshops.reverse();
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(workshops)
			});
		});
	}
	renderRow(item){
        return(
			<TouchableOpacity style={{flex: 1, paddingBottom: 20, }} activeOpacity={1}
				onPress = {() => {
					if(item.postName != null){
						this.props.navigation.navigate('comment', {postName: item.postName, downloadUrl: item.downloadUrl, shoutTitle: item.shoutTitle, userName: item.userName, date: item.date});
					}
				}}>
				<View style = {{shadowOffset:{ height: 1,  },shadowColor: 'black', shadowOpacity: 1.0,}}>
					<View style={{backgroundColor: 'black', height: 300, borderWidth: 3, borderColor: 'black'}}>
						<Image source={{uri: item.downloadUrl}} style={{flex: 1, }}/>
					</View>
					<View style={{backgroundColor: 'whitesmoke', height: 65, alignItems: 'center', }}>
						<Text numberOfLines={1} style={{fontSize: 18,}}>{item.shoutTitle}</Text>
						<Text style={{fontSize: 12, color: 'darkgray'}}>{item.userName}, {item.date}</Text>
						<View style={{flexDirection: 'row',}}>
							<Image source={require('../images/eye_black.png')} style={{width: 18, height: 18}}/>
							<Text style={{fontSize: 12, color: 'darkgray',}}>{item.views}</Text>
							<Image source={require('../images/comment.png')} style={{width: 18, height: 18, marginLeft: 30}}/>
							<Text style={{fontSize: 12, color: 'darkgray',}}>{item.comments}</Text>
							<Image source={require('../images/like.png')} style={{width: 18, height: 18, marginLeft: 30}}/>
							<Text style={{fontSize: 12, color: 'darkgray',}}>{item.likes}</Text>
						</View>
					</View>
				</View>
			</TouchableOpacity>
        );
    }

	render() {
		const { navigate } = this.props.navigation;
		return (
			<ImageBackground style={styles.container} source={srcLoginBackground}>
				<View style={{flex: 0.7, }} >
					<View style={{alignItems: 'flex-start', }} >
							<TouchableOpacity style={{marginLeft: 30, marginTop: 20}} 
								onPress = {() => {
									navigate('DrawerOpen');
								}}>
								<Image source={require('../images/menu.png')} style={{height: 40, width: 40}}/>	
							</TouchableOpacity>
					</View>
					<View style={{justifyContent: 'flex-start', alignItems: 'flex-end'}} >
						<Text style = {{fontSize: 40, backgroundColor: 'transparent', color: 'black', marginRight: 20}}>Shouts</Text>
					</View>
				</View>
				<View style = {{flex: 2.5, paddingHorizontal: 20,}}>
					<ListView
						dataSource={this.state.dataSource}
						renderRow={this.renderRow}
						enableEmptySections={true}
					/>
	
				</View>
				<View style = {{backgroundColor:'transparent', height:60, alignItems:'center', paddingRight: 20}}>
					<TouchableOpacity
						style = {{}}
						onPress = {() => {
							navigate('post');
						}}>
						<Image source={srcAddPost} style={{width: 60, height: 60,}}/>
					</TouchableOpacity>
				</View>
			</ImageBackground>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: null,
		backgroundColor: 'white',
	},
});
