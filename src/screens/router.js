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
import Notifications 	from './notifications';

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

const RootNavigator = StackNavigator(
	{
		splash: {
			screen: Splash,
		},
		login: {
			screen: Login,
		},
		signup: {
			screen: Signup, 
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
		post: {
			screen: Post, 
		},
		newGroup: {
			screen: NewGroup,
		},
		notifications: {
			screen: Notifications,
		},
	},
	{
		initialRouteName: 'splash'
	}
);

export default RootNavigator;