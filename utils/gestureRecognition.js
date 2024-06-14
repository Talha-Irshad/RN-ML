// // utils/gestureRecognition.js
// import cv from 'opencv4nodejs';
// import fs from 'react-native-fs';
// import RNFetchBlob from "rn-fetch-blob";


// // Placeholder function to load model
// const loadModel = async modelPath => {
// };

// const recognizeGesture = async (imagePath, numberMode) => {
//   const modelLetterPath = '../assets/classify_letter_model.p';
//   const modelNumberPath = '../assets/classify_number_model.p';

//   const letterModel = await loadModel(modelLetterPath);
//   const numberModel = await loadModel(modelNumberPath);

//   const image = await fs.readFile(imagePath, 'base64');
//   const img = cv.imdecode(Buffer.from(image, 'base64'));

//   const handDetection = new cv.HandDetection(img);

//   if (!handDetection) {
//     throw new Error('No hand detected');
//   }

//   const gesture = numberMode
//     ? numberModel.predict(handDetection)
//     : letterModel.predict(handDetection);
//   return gesture;
// };

// export {recognizeGesture};
