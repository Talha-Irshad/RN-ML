import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View, Text, Dimensions, FlatList} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import axios from 'axios';
import ImageResizer from '@bam.tech/react-native-image-resizer';

export default function App() {
  const {hasPermission, requestPermission} = useCameraPermission();

  const cameraRef = useRef(null);
  const [prediction, setPrediction] = useState([]);
  const [loading, setLoading] = useState(false);
  const device = useCameraDevice('front');

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const onCaputre = async () => {
    const data = await cameraRef.current.takePhoto({enableShutterSound: false});

    try {
      const resized = await ImageResizer.createResizedImage(
        data.path,
        500,
        500,
        'JPEG',
        50,
      );
      const formData = new FormData();
      formData.append('file', {
        uri: `file://${resized.path}`,
        type: 'image/jpeg',
        name: 'frame.jpg',
      });

      const response = await axios.post(
        'http://ai-sign-env-1.eba-z9pwwi3e.us-east-1.elasticbeanstalk.com/recognize',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: progressEvent => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            console.log(percentCompleted);
          },
        },
      );
      setPrediction(prev => {
        let arr = prev?.length > 0 ? [...prev] : [];
        if (response.data?.gesture && response.data?.gesture !== '?') {
          arr.unshift({key: Date.now(), gesture: response.data?.gesture});
        }
        return arr;
      });
    } catch (error) {
      console.error(
        'Error sending image to server:',
        error,
        error?.message,
        error?.data?.message,
        error?.response?.data,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch prediction every 5 seconds
    const intervalId = setInterval(onCaputre, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);
  console.log(prediction?.length);
  return (
    <View style={styles.container}>
      {hasPermission && device != null ? (
        <>
          <Camera
            ref={cameraRef}
            device={device}
            style={styles.camera}
            photo
            isActive={true}
            pixelFormat="yuv"
          />
          {loading ? (
            <Text style={{color: 'white'}}>Loading...</Text>
          ) : (
            <>
              {prediction?.length > 0 ? (
                <FlatList
                  contentContainerStyle={{
                    backgroundColor: 'black',
                    width: Dimensions.get('window').width,
                    height: Dimensions.get('window').height / 2,
                  }}
                  keyExtractor={item => item.key}
                  style={{flex: 1, backgroundColor: 'black'}}
                  data={prediction}
                  renderItem={({item}) => (
                    <View
                      style={{
                        width: Dimensions.get('window').width,
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: 'white'}}>{item?.gesture}</Text>
                    </View>
                  )}
                />
              ) : (
                <View
                  style={{
                    width: Dimensions.get('window').width,
                    height: Dimensions.get('window').height / 3,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text style={{color: 'white'}}>
                    Prediction will be shown here
                  </Text>
                </View>
              )}
            </>
          )}
        </>
      ) : (
        <Text style={{color: 'white'}}>No Camera available.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
});
