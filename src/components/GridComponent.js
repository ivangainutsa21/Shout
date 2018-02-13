import React, { Component } from 'react';
import { View, Text, StyleSheet, ListView, } from 'react-native';
import GridCell from './GridCell';

class GridComponent extends Component {
  constructor(props) {
    super(props);
    
  }

  renderItem = (item, index) => {
    return <GridCell key={item.groupKey} item={item} onPress={this.props.onPress}/>
  }

  groupItems = (items, itemsPerRow) => {
    var itemsGroups = [];
    var group = [];
    items.forEach(function(item) {
      if (group.length === itemsPerRow) {
        itemsGroups.push(group);
        group = [item];
      } else {
        group.push(item);
      }
    });

    if (group.length > 0) {
      itemsGroups.push(group);
    }

    return itemsGroups;
  }

  renderGroup = (group) => {
    var that = this;
    var items = group.map(function(item, index) {
      return that.renderItem(item, index);
    });
    return (
      <View style={styles.group}>
        {items}
      </View>
    );
  }

  render() {
    var groups = this.groupItems(this.props.data, 3);
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return (
      <View style={{ backgroundColor: 'transparent',  }}>
        <ListView
          renderRow={this.renderGroup}
          dataSource={ds.cloneWithRows(groups)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    overflow: 'hidden'
  }
});

export default GridComponent;
