const fs = require('fs');
const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');

const visualRecognition = new VisualRecognitionV3({
  version: '2018-03-19',
  iam_apikey: 'n0-Kuk_1cxunxg6OhCJdq9ZAnXKYOycPJV1VIIR4lC6d',
});

const createClassifierParams = {
  name: 'caps',
  //negative_examples: fs.createReadStream('./cats.zip'),
  positive_examples: {
    adidasC77154Superstar: fs.createReadStream('./visualrecognition/AdidasC77154Superstar.zip'),
    nikeAirMax90: fs.createReadStream('./visualrecognition/NikeAirMax90.zip'),
    nikeSkyForce88: fs.createReadStream('./visualrecognition/NikeSkyForce88.zip'),
    pumaSpeed600Ignite: fs.createReadStream('./visualrecognition/PumaSpeed600Ignite.zip'),
    nikeWmnsStudio: fs.createReadStream('./visualrecognition/NikeWmnsStudio.zip'),

  }
};

visualRecognition.createClassifier(createClassifierParams)
  .then(classifier => {
    console.log(JSON.stringify(classifier, null, 2));
  })
  .catch(err => {
    console.log('error:', err);
  });