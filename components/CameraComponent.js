// components/CameraComponent.js
import React, {useRef} from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {Camera, useCameraDevice} from 'react-native-vision-camera';

const CameraComponent = ({onCapture}) => {
  const cameraRef = useRef(null);

  const device = useCameraDevice('back');
  const takePicture = async () => {
    if (cameraRef.current) {
      const options = {quality: 0.5, base64: true};
      const data = await cameraRef.current.takePhoto(options);
      onCapture(data.uri);
    }
  };

  return (
    <View style={styles.container}>
      <Camera ref={cameraRef} style={styles.preview} device={device} />
      <View style={styles.captureContainer}>
        <TouchableOpacity onPress={takePicture} style={styles.capture}>
          <Text style={{fontSize: 14}}> SNAP </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  captureContainer: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
});

export default CameraComponent;
