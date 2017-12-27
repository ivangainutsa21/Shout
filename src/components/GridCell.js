import React, {Component} from 'react';
import { View, Text, Dimensions, TouchableOpacity, Image } from 'react-native'
import { firebaseApp } 		from '../firebase';

const width = Dimensions.get('screen').width / 3;
  
export default class GridCell extends Component {

  constructor(props) {
    super(props);
    this.state = {
      shoutCount: 0,
    }
  }
  componentDidMount() {
    firebaseApp.database().ref('posts').child(this.props.item.groupName).on('value', (snap) => {
      var shoutCount = 0;
      snap.forEach((child) => {
        shoutCount ++;
      });
      this.setState({shoutCount: shoutCount});
    })
  }
  render() {
    console.log('GridCell', this.props.item);
    return (
      <TouchableOpacity style={{ backgroundColor: 'black' }} onPress={() => {this.props.onPress(this.props.item)}}>
        <Image style={{ width: '100%', height: '100%', position: 'absolute' }} source={{uri: this.props.item.thumbLink}}/>
        <View style={{ width: width, height: width, justifyContent: 'flex-start', alignItems: 'flex-end', position: 'absolute' }}>
          <Image style={{ width: 32, height: 32, position: 'absolute' }} source={require('../images/redshape.png')}/>
          <Text style={{color: 'white'}}>{this.state.shoutCount}</Text>
        </View>
        <View style={{ width: width, height: width, justifyContent: 'flex-end', alignItems: 'flex-start', padding: 5, }}>
          <Text style={{ color: 'white' }}>{this.props.item.groupName}</Text>
        </View>
      </TouchableOpacity>
    )
  }
}