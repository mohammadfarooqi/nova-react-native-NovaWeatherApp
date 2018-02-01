import React, { Component } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableHighlight, Alert } from 'react-native';

export default class ListWeatherLocation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      locationsData: []
    };
  }
  
  componentWillReceiveProps(nextProps) {
    // console.log('nextProps.locationsData: ', nextProps.locationsData)

    this.setState({
      locationsData: [...nextProps.locationsData]
    });
  }

  renderIcon(item) {
    return (
      <Image style={{width: 40, height: 40}} source={{uri: 'http://openweathermap.org/img/w/' + item.icon + '.png'}} />
    )
  }

  navigateToDetails(data) {
    Alert.alert('Error', data.name);            
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
            data={this.state.locationsData}
            keyExtractor={(x, i) => i}
            renderItem={({item}) => (
              <TouchableHighlight onPress={this.navigateToDetails.bind(this, item)}>
                <View style={{borderBottomColor: '#bbb', borderBottomWidth: StyleSheet.hairlineWidth}}>
                  <Text style={styles.title}>{item.name}</Text>
                  <Text style={styles.body}>Temperature: {item.main.temp}</Text>
                  <View style={{flex: 1, flexDirection: 'row'}}>
                    {item.weather.map((data, idx) => (
                      <View key={idx}>{this.renderIcon(data)}</View>
                    ))}
                  </View>
                </View>
              </TouchableHighlight>
            )}
          />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    height: '90%' 
  },
  title: {
    fontWeight: "700",
    fontSize: 18
  },
  body: {
    fontWeight: "200",
    fontSize: 14
  }
});