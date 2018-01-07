
import React, { Component } from 'react'
import { 
    AppRegistry 
} from 'react-native';

import { Provider } from 'react-redux'
import { MenuProvider } from 'react-native-popup-menu';

import store    from './src/store'
import App      from './App';

export default class ReduxApp extends Component {
    render(){
        return(
            <Provider store={store}>
            
            <MenuProvider>
                <App />
  </MenuProvider>
            </Provider>
        );
    }
}

AppRegistry.registerComponent('SocialCommunityApp', () => ReduxApp);