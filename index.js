
import React, { Component } from 'react'
import { 
    AppRegistry 
} from 'react-native';

import { Provider } from 'react-redux'

import store    from './src/store'
import App      from './App';

export default class ReduxApp extends Component {
    render(){
        return(
            <Provider store={store}>
                <App />
            </Provider>
        );
    }
}

AppRegistry.registerComponent('SocialCommunityApp', () => ReduxApp);