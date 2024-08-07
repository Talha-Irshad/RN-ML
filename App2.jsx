/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from 'react';

import {StyleSheet, View, Text, ActivityIndicator} from 'react-native';
import {
  Tensor,
  TensorflowModel,
  useTensorflowModel,
} from 'react-native-fast-tflite';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {useResizePlugin} from 'vision-camera-resize-plugin';
import labels from './src/utils/labels';

function tensorToString(tensor: Tensor): string {
  return `\n  - ${tensor.dataType} ${tensor.name}[${tensor.shape}]`;
}
function modelToString(model: TensorflowModel): string {
  return (
    `TFLite Model (${model.delegate}):\n` +
    `- Inputs: ${model.inputs.map(tensorToString).join('')}\n` +
    `- Outputs: ${model.outputs.map(tensorToString).join('')}`
  );
}

export default function App(): React.ReactNode {
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');

  // from https://www.kaggle.com/models/tensorflow/efficientdet/frameworks/tfLite
  const model = useTensorflowModel(require('./assets/model.tflite'));
  const actualModel = model.state === 'loaded' ? model.model : undefined;

  React.useEffect(() => {
    if (actualModel == null) return;
    console.log(`Model loaded! Shape:\n${modelToString(actualModel)}]`);
  }, [actualModel]);

  const {resize} = useResizePlugin();

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      if (actualModel == null) {
        // model is still loading...
        return;
      }

      console.log(`Running inference on ${frame}`);
      const resized = resize(frame, {
        scale: {
          width: 640,
          height: 480,
        },
        pixelFormat: 'rgb',
        dataType: 'uint8',
      });
      const result = actualModel.runSync([resized]);
      const probabilities = result[0];
      console.log(probabilities);
      const labeledProbabilities = labels.map((label, index) => ({
        label,
        probability: probabilities[index],
      }));
      labeledProbabilities.sort((a, b) => b.probability - a.probability);
      // Get top-k results
      const topKResults = labeledProbabilities.slice(0, 3); // Adjust k as needed

      console.log('Top-K Results:');
      topKResults.forEach(res => {
        console.log(`${res.label}: ${res.probability}`);
      });
    },
    [actualModel],
  );

  React.useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  console.log(`Model: ${model.state} (${model.model != null})`);

  return (
    <View style={styles.container}>
      {hasPermission && device != null ? (
        <Camera
          device={device}
          style={StyleSheet.absoluteFill}
          isActive={true}
          frameProcessor={frameProcessor}
          pixelFormat="yuv"
        />
      ) : (
        <Text>No Camera available.</Text>
      )}

      {model.state === 'loading' && (
        <ActivityIndicator size="small" color="white" />
      )}

      {model.state === 'error' && (
        <Text>Failed to load model! {model.error.message}</Text>
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
});
