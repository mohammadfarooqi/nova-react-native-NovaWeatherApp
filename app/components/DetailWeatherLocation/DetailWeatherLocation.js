import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import moment from 'moment';

export default class DetailWeatherLocation extends Component {
  render() {
    return (
      <View style={styles.container}>
        {this.props.data.list.map((item, index) => <Text key={index}>{'Date: \t\t\t' + moment(item.forDate).utc().format('MMM DD YYYY') + ' \nTemperature: \t' + item.temperature + '\n'}</Text>)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 90
  }
});