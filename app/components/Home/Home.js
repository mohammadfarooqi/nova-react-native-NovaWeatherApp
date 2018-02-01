import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, AsyncStorage, Alert, NetInfo } from 'react-native';
import moment from 'moment';

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

        const temp = await Promise.all(storedLocation.map(city => {
          // console.log('Stored City: ', city);

          return this.fetchData(city);
        }));

        const temp2 = await Promise.all(temp.map(cityInfo => this.fetchDetailData(cityInfo.id)));

        storedLocation.map((item, i) => {
          temp2[i] = this.getThreeDaysAvgData(temp2[i]);
          
          // console.log('temp = ', JSON.stringify(temp[i]))
          // console.log('temp2 = ', JSON.stringify(temp2[i]))            
          
          storedLocationData.push({
            overview: temp[i],
            detail: temp2[i]
          });
        });

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

  fetchDetailData(cityId) {
    return new Promise(async (res, rej) => {
      try {
        //https://api.openweathermap.org/data/2.5/forecast?id=6167865&APPID=8a826ef7ef79234d6adc634028501964&units=metric
        const result = await fetch('https://api.openweathermap.org/data/2.5/forecast?id=' + cityId + '&APPID=8a826ef7ef79234d6adc634028501964&units=metric');
        res(result.json());
      } catch (error) {
        console.log('fetch detail Data error: ', JSON.stringify(error));
        rej(error);
      }
    });
  }

  getThreeDaysAvgData(obj) {
    const tomorrow = moment().utc().milliseconds(0).seconds(0).minutes(0).hours(0).add(1, 'days');
    const fourDays = moment().utc().milliseconds(0).seconds(0).minutes(0).hours(0).add(4, 'days');
    
    let temp = obj.list.filter(item => moment(item.dt_txt).utc().isBetween(tomorrow, fourDays, null, '[)'));

    // console.log('getThreeDaysAvgData arr.length = ', obj.list.length, ' // temp.length = ', temp.length);

    let dayStart = tomorrow;
    let dayEnd = moment(tomorrow).utc().milliseconds(0).seconds(0).minutes(0).hours(0).add(1, 'days');

    // console.log('dayStart => ', dayStart.toString())
    // console.log('dayEnd => ', dayEnd.toString())    
    let result = [];
    let count = 0;
    let temperature = 0;

    for (let i = 0; i < temp.length; i++) {
      if (moment(temp[i].dt_txt).utc().isBetween(dayStart, dayEnd, null, '[)')) {
        count++;
        temperature += temp[i].main.temp; 
        // console.log('hitting here 1')        
      }

      // check to see if we need to rest values 
      if (temp[i + 1] && moment(temp[i + 1].dt_txt).utc().isSameOrAfter(dayEnd)) {
        // console.log('hitting here 2')
        const calcAvg = ((temperature + 0.0) / count).toFixed(2);
        count = 0;
        temperature = 0;

        // temp[i] = {
        //   temperature: calcAvg,
        //   forDate: dayStart
        // };
        result.push({
          temperature: calcAvg,
          forDate: dayStart
        });
        
        // reset values
        dayStart = moment(dayStart).utc().milliseconds(0).seconds(0).minutes(0).hours(0).add(1, 'days');
        // console.log('resseting start => ', dayStart.toString());
        dayEnd = moment(dayStart).utc().milliseconds(0).seconds(0).minutes(0).hours(0).add(1, 'days');
        // console.log('resseting end => ', dayEnd.toString());        
      } else if (i === temp.length - 1) {
        // console.log('hitting here 3')        
        const calcAvg = ((temperature + 0.0) / count).toFixed(2);
        // temp[i] = {
        //   temperature: calcAvg,
        //   forDate: dayStart
        // };
        result.push({
          temperature: calcAvg,
          forDate: dayStart
        });
      }
    }

    obj.list = result;

    // console.log('returning obj from getThreeDaysData ', JSON.stringify(result));

    return obj;
  }

  async addLocationToList(event) {
    const location = event.nativeEvent.text;
    console.log('Adding Location: ', location);

    const locations = [...this.state.locations];
    locations.push(location);
    
    let locationData;
    let locationsData;
    let detailLocationsData;

    try {
      locationData = await this.fetchData(location);
      console.log('fetched location data: ', JSON.stringify(locationData));  

      detailLocationsData = await this.fetchDetailData(locationData.id);
      console.log('fetched detail location data for location.id = ', locationData.id);
    } catch (error) {
      Alert.alert('Error', 'There was an error fetching data forom fetchData');            
    }

    // clear our other days other than 3 days
    detailLocationsData = this.getThreeDaysAvgData(detailLocationsData);

    locationsData = [...this.state.locationsData];
    // locationsData.push(locationData);
    locationsData.push({
      overview: locationData,
      detail: detailLocationsData
    });

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
        
        <ListWeatherLocation locationsData={this.state.locationsData} navigator={this.props.navigator}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textInput: {
    height: 40,
    marginTop: 70,
    marginLeft: 10
  }
});
