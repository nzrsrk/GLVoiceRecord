import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Alert,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  FlatList,
  Image
} from 'react-native';
import SoundPlayer from 'react-native-sound-player'
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { color } from 'react-native-reanimated';
import Sound from 'react-native-sound'
import moment, { relativeTimeThreshold } from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];
const audioRecorderPlayer = new AudioRecorderPlayer();
let path;
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      record: false,
      audioName: 0,
      audioList: [],
}
}
  async componentDidMount() {
    const audioList = await AsyncStorage.getItem('AudioList');
    const audioName = await AsyncStorage.getItem('AudioName');
    this.setState({ audioList: audioList != null ? JSON.parse(audioList) : [], audioName: audioName != null ? JSON.parse(audioName) : 0 })

    this._onFinishedPlayingSubscription = SoundPlayer.addEventListener('FinishedPlaying', ({ success }) => {
      // console.log('finished playing', success)
    })
    this._onFinishedLoadingSubscription = SoundPlayer.addEventListener('FinishedLoading', ({ success }) => {
      // console.log('finished loading', success)
    })
    this._onFinishedLoadingFileSubscription = SoundPlayer.addEventListener('FinishedLoadingFile', ({ success, name, type }) => {
      // console.log('finished loading file', success, name, type)
    })
    this._onFinishedLoadingURLSubscription = SoundPlayer.addEventListener('FinishedLoadingURL', ({ success, url }) => {
      console.log('finished loading url', success, url)
    })

  }
  async componentWillUnmount() {
    this._onFinishedPlayingSubscription && this._onFinishedPlayingSubscription.remove()
    this._onFinishedLoadingSubscription && this._onFinishedLoadingSubscription.remove()
    this._onFinishedLoadingFileSubscription && this._onFinishedLoadingFileSubscription.remove()
  }

  onStartRecord = async () => { //Star Recording
    path = 'sdcard/' + this.state.audioName + '.mp3';
    const result = await audioRecorderPlayer.startRecorder(path);
    audioRecorderPlayer.addRecordBackListener((e) => {
      this.setState({
        recording: true,
        recordSecs: e.current_position,
        recordTime: audioRecorderPlayer.mmssss(
          Math.floor(e.current_position),
        ),
      });
      return;
    });
  };

  onStopRecord = async (value) => { //Stop and save records to path 
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    this.setState({
      recordSecs: 0,
    });
    this.setState({ recording: false })
    let temp = {
      audioName: 'Voice ' + this.state.audioName,
      audioPath: path,
      audioTime: moment().format('LT')
    }
    let t = this.state.audioList;
    t.push(temp)
    this.setState({ t, audioName: this.state.audioName + 1, })
    let audioList = JSON.stringify(this.state.audioList)
    let audioName = JSON.stringify(this.state.audioName)
    await AsyncStorage.setItem('AudioList', audioList)
    await AsyncStorage.setItem('AudioName', audioName)
  };
  Warning() {
    Alert.alert("Please Hold the button to record")
  }
//  play function-->
  async onStartPlay(value) {
    SoundPlayer.loadUrl(value)
    SoundPlayer.addEventListener('FinishedLoadingURL', ({ success, url }) => {
      SoundPlayer.play()
    })
  }

  // Pause play function-->
  onPausePlay = async (value) => {
    SoundPlayer.pause()
    this.setState({ active: 'Pause' })
  };

  // Delete function-->
  async onDelete(value) {
    try {
      var t = this.state.audioList;
      let new_array = t;
      if (value > -1) {
        new_array.splice(value, 1);
        this.setState({ t: new_array })

        let audioList = JSON.stringify(this.state.audioList)
        let audioName = JSON.stringify(this.state.audioName)
        await AsyncStorage.setItem('AudioList', audioList)
        await AsyncStorage.setItem('AudioName', audioName)
      }
    } catch (error) {
      console.log('Error in removing action')
    }
  }

  render() {

    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor={'#0078D7'} />
        <SafeAreaView >
          <View style={styles.topContainer}>
            <Text style={styles.Header}>GL Voice Recorder</Text>
          </View>
          <View style={styles.body}>
            <ImageBackground source={require('./assets/bg.png')} style={styles.image}>
              <TouchableOpacity onPress={this.Warning.bind(this)} onLongPress={this.onStartRecord.bind(this)} onPressOut={this.onStopRecord.bind(this)} >
                <View style={styles.round}>
                  <Image source={require('./assets/icon.png')} style={styles.icon} />
                  <Text style={styles.textsm}>Tap to Record</Text>
                </View></TouchableOpacity>
            </ImageBackground>

            <View style={{ width: '100%', height: '60%', justifyContent: 'center', alignItems: 'center', paddingBottom: 50 }} >

              <FlatList
                style={{ flex: 1, }}
                extraData={this.state}
                data={this.state.audioList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => {
                  return (
                    <View style={{ width: '100%', height: windowHeight * 0.08, paddingHorizontal: '6%', marginVertical: '2%', }}>
                      <View style={{ width: '100%', height: '60%', flexDirection: 'row', alignItems: 'center', }}>
                        <View style={{ width: '55%', height: '100%', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 22, color: '#5f9ea0' }}>{item.audioName}</Text>
                        </View>
                        <TouchableOpacity style={{ width: '15%', height: '100%', justifyContent: 'center', alignItems: 'flex-end' }} onPress={() => this.onStartPlay(item.audioPath)}>
                          <Image source={require('./assets/play.png')} style={{ width: 35, height: 35, }} />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ width: '15%', height: '100%', justifyContent: 'center', alignItems: 'flex-end' }} onPress={() => this.onPausePlay(item.audioPath)}>
                          <Image source={require('./assets/pause.png')} style={{ width: 30, height: 30, }} />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ width: '15%', height: '100%', justifyContent: 'center', alignItems: 'flex-end' }} onPress={() => this.onDelete(index)}>
                          <Image source={require('./assets/delete.png')} style={{ width: 22, height: 22, }} />
                        </TouchableOpacity>
                      </View>
                      <View style={{ width: '100%', height: '40%', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, color: '#707070' }}>{item.audioTime}</Text>
                      </View>
                    </View>
                  );
                }}
              />
            </View>
          </View>



        </SafeAreaView>
      </>
    );
  };
}
const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#FFFFFF'
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  round: {
    width: 140,
    height: 140,
    borderRadius: 140 / 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    marginTop: -7

  },
  body: {

    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    marginTop: 35
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  textsm: {
    marginTop: 10,
    fontSize: 10,
    color: 'grey'

  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 220 / 2,
    justifyContent: 'center',

    alignItems: 'center'

  },
  icon: {
    width: 25,
    height: 35
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  topContainer: {
    backgroundColor: "#0078D7",
    height: 120,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center'
  },
  Header: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: 'bold'

  },

});

export default App;
