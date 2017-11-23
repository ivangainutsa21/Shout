import React from 'react';
import { StackNavigator } from 'react-navigation';
import { DrawerNavigator } from 'react-navigation';

import LoginScreen 		from './LoginScreen';
import SignupScreen 	from './SignupScreen';
import HomeScreen		from './HomeScreen';
import PostScreen 		from './PostScreen';
import SideMenu 		from './SideMenu';
import MyProfile 		from './MyProfile';
import Settings 		from './Settings';
import CommentScreen 	from './CommentScreen';
import SplashScreen 	from './SplashScreen';

const HomeDrawer = DrawerNavigator({
	
		Home: {screen: HomeScreen,},
	},
	{	
		drawerWidth: 250,
		contentComponent: props => <SideMenu {...props} />,
	})

HomeDrawer.navigationOptions = {
	header: null,
}
const Main = StackNavigator({
	Splash: {
		screen: SplashScreen,
	},
	Login: {
		screen: LoginScreen,
	},
	Post: {
		screen: PostScreen, 
	},
	Signup: {
		screen: SignupScreen, 
	},
	Home: {
		screen: HomeDrawer,
	},
	MyProfile: {
		screen: MyProfile,
	},
	Settings: {
		screen: Settings,
	},
	Comment: {
		screen: CommentScreen,
	}
});

export default Main;