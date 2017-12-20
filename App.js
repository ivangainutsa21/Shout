import React, { Component } from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text,
} from 'react-native';
import { connect } from "react-redux";
import OneSignal from 'react-native-onesignal';

import { firebaseApp } from './src/firebase';
import RootNavigator from './src/screens/router';

import { registerPlayerIds } from './src/actions'

class App extends Component<{}> {

	constructor(props) {
		super(props);
		
		this.onIds = this.onIds.bind(this);
	}
	
	componentWillMount() {
        OneSignal.addEventListener('ids', this.onIds);
  }

    componentWillUnmount() {
        OneSignal.removeEventListener('ids', this.onIds);
    }

    onIds(device) {
      this.props.dispatch(registerPlayerIds(device.userId));
    }
  render() {
    return (
      <View style={styles.container}>
		    <RootNavigator />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
});

export default connect()(App);