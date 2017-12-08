import React from 'react';
import { StackNavigator } from 'react-navigation';
import { DrawerNavigator } from 'react-navigation';

import Login 			from './login';
import Signup 			from './signup';
import Home				from './home';
import Post 			from './post';
import SideMenu 		from './sideMenu';
import UserProfile 		from './userProfile';
import Settings 		from './settings';
import Comment 			from './comment';
import Splash 			from './splash';
import HomeGroup 		from './homeGroup';
import NewGroup 		from './newGroup';

const homeDrawer = DrawerNavigator({
		homeGroup: {screen: HomeGroup,},
	},
	{	
		drawerWidth: 250,
		contentComponent: props => <SideMenu {...props} />,
	}
)

homeDrawer.navigationOptions = {
	header: null,
}

const RootNavigator = StackNavigator({
	splash: {
		screen: Splash,
	},
	login: {
		screen: Login,
	},
	signup: {
		screen: Signup, 
	},
	post: {
		screen: Post, 
	},
	home: {
		screen: Home,
	},
	userProfile: {
		screen: UserProfile,
	},
	settings: {
		screen: Settings,
	},
	comment: {
		screen: Comment,
	},
	homeGroup: {
		screen: homeDrawer,
	},
	newGroup: {
		screen: NewGroup,
	},
});

export default RootNavigator;