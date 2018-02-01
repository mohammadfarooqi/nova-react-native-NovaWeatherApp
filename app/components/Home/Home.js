import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, AsyncStorage, Alert, NetInfo } from 'react-native';

import ListWeatherLocation from '../ListWeatherLocation/ListWeatherLocation';

export default class Home extends Component {
  constructor() {
    super();

    // AsyncStorage.clear();

    this.state = {
      locations: [],
      locationsData: []
    };
  }

  async componentDidMount() {
    const isConnected = await this.checkInternetConnectivity();
    console.log('isConnected: ', isConnected)
    this.onLoad(isConnected);
    // this.fetchData();
  }

  checkInternetConnectivity() {
    return new Promise((res, rej) => {
      const dispatchConnected = isConnected => res(isConnected);

      NetInfo.isConnected.fetch().then().done(() => {
        NetInfo.isConnected.addEventListener('connectionChange', dispatchConnected);
      });
    })
  }

  async onLoad(isConnected) {
    try {
      let storedLocation = await AsyncStorage.getItem('@NovaWeatherApp:locations');
      let storedLocationData = await AsyncStorage.getItem('@NovaWeatherApp:locationsData');

      // console.log('storedLocation: ', storedLocation);
      // console.log('storedLocationData: ', storedLocationData);
      
      if (storedLocation === null) {
        storedLocation = [];
      } else {
        storedLocation = JSON.parse(storedLocation);
      }

      if (storedLocationData === null) {
        storedLocationData = [];
      } else {
        storedLocationData = JSON.parse(storedLocationData);
      }

      if (isConnected) {
        storedLocationData = [];

        storedLocationData = await Promise.all(storedLocation.map(city => {
            // console.log('Stored City: ', city);

            return this.fetchData(city);
        }));

        // console.log(storedLocationData);
        this.onSave(storedLocation, storedLocationData);
      }

      this.setState({
        locations: storedLocation,
        locationsData: storedLocationData
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'There was an error while loading the data from local storage');      
    }
  }

  async onSave(locations, locationsData) {
    // console.log('locations ', locations);
    // console.log('locationsData ', locationsData);

    try {
      await AsyncStorage.setItem('@NovaWeatherApp:locations', JSON.stringify(locations));  
      await AsyncStorage.setItem('@NovaWeatherApp:locationsData', JSON.stringify(locationsData));        
    } catch (error) {
      Alert.alert('Error', 'Error saving data to local storage');
    }
  }

  fetchData(city) {
    // fetch('https://api.openweathermap.org/data/2.5/weather?q=' + city +'&APPID=8a826ef7ef79234d6adc634028501964')
    //   .then((res) => res.json())
    //   .then((res) => {
    //     return console.log(res);
    //   })
    //   .catch(err => {
    //     console.log(err);
    //   })
    return new Promise(async (res, rej) => {
      try {
        const result = await fetch('https://api.openweathermap.org/data/2.5/weather?q=' + city +'&APPID=8a826ef7ef79234d6adc634028501964&units=metric');
        res(result.json());
      } catch (error) {
        console.log('fetch Data error: ', JSON.stringify(error));
        rej(error);
      }
    });
  }

  async addLocationToList(event) {
    const location = event.nativeEvent.text;
    console.log('Adding Location: ', location);

    const locations = [...this.state.locations];
    locations.push(location);

    
    let locationData;
    let locationsData;

    try {
      locationData = await this.fetchData(location);
      
      console.log('fetched: ', JSON.stringify(locationData));
      
      locationsData = [...this.state.locationsData];
      locationsData.push(locationData);
    } catch (error) {
      Alert.alert('Error', 'There was an error fetching data forom fetchData');            
    }

    this.onSave(locations, locationsData);

    // console.log(locationsData[locationsData.length - 1]);

    this.setState({
      locations, 
      locationsData
    });

    // console.log('Locations array: ', this.state.locations);

    this.textInput.clear();
  }
  
  render() {
    return (
      <View>
        <TextInput 
          placeholder="Enter a City"
          onSubmitEditing={(e) => this.addLocationToList(e)}
          ref={input => { this.textInput = input }}
          style={styles.textInput}
        />
        
        <ListWeatherLocation locationsData={this.state.locationsData}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textInput: {
    height: 40,
    marginTop: 20,
    marginLeft: 10
  }
});
