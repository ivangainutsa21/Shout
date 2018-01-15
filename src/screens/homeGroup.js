import React, { Component } from 'react';
import {
	StyleSheet, View,TouchableOpacity, Text, TextInput, Image, ImageBackground, ScrollView, 
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import OneSignal 	from 'react-native-onesignal';

import { connect } from "react-redux";
import { firebaseApp } 		from '../firebase'
import store from '../store'
import GridComponent from '../components/GridComponent'

const group = store.getState().getUserInfo.group;
const groupCount = store.getState().getUserInfo.group.length;

class HomeGroup extends Component {
	constructor(props) {
        super(props);
        
        this.state = {
            dataSource: [],
            allGroups: [],
            privateGroups: [],
            publicGroups: [],
            domainGroups: [],
            groupImage: [],
            showGroupFilter: false,
            groupTitle: 'Groups',
            domain: '',
        }
	}

	static navigationOptions = {
		header: null
    };
    
	componentWillMount() {
        var userId = firebaseApp.auth().currentUser.uid;
        this.setState({
            domain: firebaseApp.auth().currentUser.email.slice(firebaseApp.auth().currentUser.email.indexOf('@')),
        })
		firebaseApp.database().ref('playerIds/').child(this.props.playerIds).set({
            fullName: this.props.fullName,
            userId: userId,
        })
        
		firebaseApp.database().ref('users/').child(userId).update({
            playerIds: this.props.playerIds,
        })
        firebaseApp.database().ref().child('groups').on('value', (snap) => {
            var allGroups = [];
            var publicGroups = [];
            var privateGroups = [];
            var domainsGroups = [];
            var promises = [];
            promises.push(new Promise((resolve, reject) => {
                snap.forEach((child) => {
                    let isMyPrivateGroup = false;
                    firebaseApp.database().ref().child('groups').child(child.key).child('privacy').on('value', (snap) => {
                        snap.forEach((child) => {
                            if(child.val().userId == userId)
                                isMyPrivateGroup = true;
                        })
                    })
                    
                    if(child.val().privacy == undefined) {
                        allGroups.push({
                            lastModified: child.val().lastModified,
                            groupKey: child.key,
                            groupName: child.val().groupName,
                            thumbLink: child.val().thumbLink,
                            groupCreator: child.val().groupCreator,
                        });
                        publicGroups.push({
                            lastModified: child.val().lastModified,
                            groupKey: child.key,
                            groupName: child.val().groupName,
                            thumbLink: child.val().thumbLink,
                            groupCreator: child.val().groupCreator,
                        });
                    }
                    if(isMyPrivateGroup == true) {
                        allGroups.push({
                            lastModified: child.val().lastModified,
                            groupKey: child.key,
                            groupName: child.val().groupName,
                            thumbLink: child.val().thumbLink,
                            groupCreator: child.val().groupCreator,
                        });

                        if(child.val().domain == undefined) {
                            privateGroups.push({
                                lastModified: child.val().lastModified,
                                groupKey: child.key,
                                groupName: child.val().groupName,
                                thumbLink: child.val().thumbLink,
                                groupCreator: child.val().groupCreator,
                            });
                        }else {
                            domainsGroups.push({
                                lastModified: child.val().lastModified,
                                groupKey: child.key,
                                groupName: child.val().groupName,
                                thumbLink: child.val().thumbLink,
                                groupCreator: child.val().groupCreator,
                            });
                        }
                    }
                    resolve();
                })
            }))
            Promise.all(promises).then(() => {
                allGroups.sort(function(a, b){
                    if(a.lastModified != undefined && b.lastModified == undefined) return -1;
                    if(a.lastModified == undefined && b.lastModified != undefined) return 1;
                    if(a.lastModified == undefined && b.lastModified == undefined) return 0;
                    if(a.lastModified < b.lastModified) return 1;
                    if(a.lastModified > b.lastModified) return -1;
                    return 0;
                });
                privateGroups.sort(function(a, b){
                    if(a.lastModified != undefined && b.lastModified == undefined) return -1;
                    if(a.lastModified == undefined && b.lastModified != undefined) return 1;
                    if(a.lastModified == undefined && b.lastModified == undefined) return 0;
                    if(a.lastModified < b.lastModified) return 1;
                    if(a.lastModified > b.lastModified) return -1;
                    return 0;
                });

                publicGroups.sort(function(a, b){
                    if(a.lastModified != undefined && b.lastModified == undefined) return -1;
                    if(a.lastModified == undefined && b.lastModified != undefined) return 1;
                    if(a.lastModified == undefined && b.lastModified == undefined) return 0;
                    if(a.lastModified < b.lastModified) return 1;
                    if(a.lastModified > b.lastModified) return -1;
                    return 0;
                });

                domainsGroups.sort(function(a, b){
                    if(a.lastModified != undefined && b.lastModified == undefined) return -1;
                    if(a.lastModified == undefined && b.lastModified != undefined) return 1;
                    if(a.lastModified == undefined && b.lastModified == undefined) return 0;
                    if(a.lastModified < b.lastModified) return 1;
                    if(a.lastModified > b.lastModified) return -1;
                    return 0;
                });

                this.setState({
                    allGroups: allGroups,
                    publicGroups: publicGroups,
                    privateGroups: privateGroups,
                    domainGroups: domainsGroups,
                })
                this.setState({
                    dataSource: this.state.allGroups,
                });
            })
        })
    }

    onPressGridCell = (item) => {
        this.props.navigation.navigate('home', {groupName: item.groupName, groupKey: item.groupKey, groupCreator: item.groupCreator, refresh: item.refresh});
    }

	render() {
        const { navigate } = this.props.navigation;
        
		return (
			<View style={styles.container}>
				<View style={{height: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems:'center', marginTop: 5, marginHorizontal: 20}} >
                    <View style={{flexDirection: 'row', alignItems:'center',}} >
                        <TouchableOpacity
                            onPress = {() => {
                                navigate('DrawerOpen');
                            }}>
                            <Image source={require('../images/menu.png')} style={{height: 20, width: 30}}/>	
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{flexDirection:'row', alignItems: 'center', marginLeft: 20}}
                            onPress = {() => {
                                this.setState({
                                    showGroupFilter: !this.state.showGroupFilter
                                })
                            }}>
                            <Text style={{fontSize: 18,}}>{this.state.groupTitle}</Text>
                            <Image source={require('../images/groups.png')} style={{marginLeft: 10, height: 16, width: 16}}/>	
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection: 'row', alignItems:'center',}} >
                        <TouchableOpacity
                            onPress = {() => {
                                this.props.navigation.navigate('notifications');
                            }}>
                            <Image source={require('../images/home_notification.png')} style={{ height: 25, width: 25}}/>	
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress = {() => {
                                const resetHome = NavigationActions.reset({
                                    index: 0,
                                    actions: [
                                      NavigationActions.navigate({ routeName: 'homeGroup'})
                                    ]
                                })
                                this.props.navigation.dispatch(resetHome);
                            }}>
                            <Image source={require('../images/update.png')} style={{marginLeft: 10, height: 25, width: 25}}/>	
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress = {() => {
                                this.props.navigation.navigate('newGroup', {title: 'Adding New Group', groupName: undefined, privacy: 'public', isEdit: false,});
                            }}>
                            <Image source={require('../images/addgroup.png')} style={{ height: 25, width: 25, marginLeft: 10}}/>	
                        </TouchableOpacity>
                    </View>
				</View>
                
					
                <View style={{flex: 1, }}>
                    <View style={{backgroundColor: 'whitesmoke', height: 210, width: 220, paddingHorizontal: 10, marginBottom: -210, marginLeft: 50, zIndex: 10, display: this.state.showGroupFilter == false ? 'none' : null, paddingVertical: 5}}>
                        <TouchableOpacity style={{width: 200, height: 50, borderBottomColor: 'black', alignItems: 'center', justifyContent:'center', borderBottomWidth: 1}}
							onPress = {() => {
                                this.setState({
                                    dataSource: this.state.allGroups,
                                });
                                this.setState({
                                    groupTitle: 'All Groups'
                                })
                                this.setState({
                                    showGroupFilter: false
                                })
							}}>
							<Text style={{fontSize: 18}}>All Groups</Text>
						</TouchableOpacity>

						<TouchableOpacity style={{width: 200, height: 50, borderBottomColor: 'black', alignItems: 'center', justifyContent:'center', borderBottomWidth: 1}}
							onPress = {() => {
                                this.setState({
                                    dataSource: this.state.publicGroups,
                                });
                                this.setState({
                                    groupTitle: 'Public Groups'
                                })
                                this.setState({
                                    showGroupFilter: false
                                })
							}}>
							<Text style={{fontSize: 18}}>Public Groups</Text>
						</TouchableOpacity>

                        <TouchableOpacity style={{width: 200, height: 50, alignItems: 'center', justifyContent:'center', borderBottomColor: 'black', borderBottomWidth: 1}}
                            onPress = {() => {
                                this.setState({
                                    dataSource: this.state.privateGroups,
                                });

                                this.setState({
                                    groupTitle: 'Private Groups'
                                })
                                this.setState({
                                    showGroupFilter: false
                                })
                        }}>
                            <Text style={{fontSize: 18}}>Private Groups</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{width: 200, height: 50, alignItems: 'center', justifyContent:'center', }}
                            onPress = {() => {
                                this.setState({
                                    dataSource: this.state.domainGroups,
                                });

                                this.setState({
                                    groupTitle: 'Domain Groups'
                                })
                                this.setState({
                                    showGroupFilter: false
                                })
                        }}>
                            <Text style={{fontSize: 18}}>({this.state.domain})</Text>
                        </TouchableOpacity>
					</View>
                    <View style={{height: 30, backgroundColor: 'darkgrey', paddingHorizontal: 10, flexDirection: 'row', justifyContent:'space-between', alignItems: 'center'}}>
                        <Text style={{marginLeft: 10, display:'none'}}>All categories</Text>
                        <TouchableOpacity 
                                style={{flexDirection: 'row', alignItems: 'center', justifyContent:'center', display: 'none'}}
                                onPress = {() => {
                                    //this.props.navigation.navigate('newGroup', {title: 'Edit Group', groupName: this.props.navigation.state.params.groupName, privacy: 'private', isEdit: true, groupKey: this.props.navigation.state.params.groupKey});
                            }}>
                            <ImageBackground source={require('../images/category.png')} style={{ height: 18, width: 18}}/>
                        </TouchableOpacity>
                    </View>
                    <GridComponent data={this.state.dataSource} onPress={this.onPressGridCell}>
                    </GridComponent>
                </View>
			</View>
		);
	}
}



const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'aliceblue',
	},
	input: {
        flex: 1,
        padding: 0,
        paddingVertical: 5,
        paddingLeft: 10,
        paddingRight: 40,
		fontSize: 18,
		color: 'black',
        borderRadius: 5,
        borderColor: 'black',
        borderWidth: 1,
    },
    text: {
        fontSize: 24, 
        backgroundColor: 'transparent', 
        color: 'black',
        marginTop: 20,
        marginHorizontal: 20,
        borderBottomWidth: 1,
    }
});


function mapStateToProps(state) {
	return {
	    playerIds: state.getUserInfo.playerIds,
        fullName: state.getUserInfo.fullName,
	};
}

export default connect(mapStateToProps)(HomeGroup);