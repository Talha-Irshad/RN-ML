import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import BackgroundTimer from 'react-native-background-timer';
import axios from 'axios';

export default function App() {
  const {hasPermission, requestPermission} = useCameraPermission();

  const cameraRef = useRef(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const device = useCameraDevice('back');

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    const fetchPrediction = async () => {
      if (!cameraRef.current) return;

      setLoading(true);

      // Capture the current frame
      const data = await cameraRef.current.takePhoto();
      console.log(data);

      // Send the frame to the server
      const formData = new FormData();
      formData.append('image', {
        uri: data.path,
        type: 'image/jpeg',
        name: 'frame.jpg',
      });

      try {
        const response = await axios.post(
          'http://192.168.2.108:3000/',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );
        setPrediction(response.data);
      } catch (error) {
        console.error(
          'Error sending image to server:',
          error,
          error?.message,
          error?.data?.message,
        );
      } finally {
        setLoading(false);
      }
    };

    // Fetch prediction every 5 seconds
    const intervalId = BackgroundTimer.setInterval(fetchPrediction, 5000);

    return () => {
      BackgroundTimer.clearInterval(intervalId);
    };
  }, []);

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
            <Text>Loading...</Text>
          ) : (
            <Text>
              Prediction: {prediction ? JSON.stringify(prediction) : 'None'}
            </Text>
          )}
        </>
      ) : (
        <Text>No Camera available.</Text>
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
