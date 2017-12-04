import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dimensions from 'Dimensions';
import {
	StyleSheet,
	ImageBackground,KeyboardAvoidingView
} from 'react-native';
import bgSrc from '../images/wallpaper.png';

export default class Wallpaper extends Component {
	render() {
		return (	
			<ImageBackground style={styles.picture} source={bgSrc}>
				<KeyboardAvoidingView behavior='padding' style={{flex: 1,}}>		
					{this.props.children}
				</KeyboardAvoidingView>	
			</ImageBackground>
		);
	}
}

const styles = StyleSheet.create({
	picture: {
		flex: 1,
		width: null,
		height: null,
	},
});
