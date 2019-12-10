/* const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
const  IamAuthenticator  = require('ibm-watson/auth');

const languageTranslator = new LanguageTranslatorV3({
  version: '2018-05-01',
  authenticator: new IamAuthenticator({
    apikey: '49VHiNhCFkuEyqB2iJXPkEVzQCJidnJXi8q2wfJ-PVDM',
  }),
  url:'https://gateway-lon.watsonplatform.net/language-translator/api', */

  
  
  
  
  const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
var LanguageDetect = require('languagedetect'); 
var lngDetector = new LanguageDetect();
/* const languageTranslator = new LanguageTranslatorV3({
  version: '{version}',
  authenticator: new BasicAuthenticator({
    username: 'apikey',
    password: '49VHiNhCFkuEyqB2iJXPkEVzQCJidnJXi8q2wfJ-PVDM',
  }),
    url:'https://gateway-lon.watsonplatform.net/language-translator/api',
}); */

var languageTranslator = new LanguageTranslatorV3({
      username: 'apikey',
    password: '49VHiNhCFkuEyqB2iJXPkEVzQCJidnJXi8q2wfJ-PVDM',
     url:'https://gateway-lon.watsonplatform.net/language-translator/api',

    version: '2018-05-01',
});
console.log("languagedector :",lngDetector.detect("hey", 1));
            if (lngDetector.detect("hola", 1) == 0) {
                otherLanguage = 'en';
              console.log("inside if condition")
            } else if (lngDetector.detect("hola", 1)[0][0] == 'spanish' || lngDetector.detect("hola", 1)[0][0] == 'hawaiian' && lngDetector.detect("hola", 1)[0][1] >= 0.4) {
                console.log('other language');
              
            } else {
                console.log('this is english')
               
            }

const translateParams = {
  text: 'ما الذي تستطيع القيام به',
  source:"ar",
  target:"en",
 // modelId: 'en-es'
};

languageTranslator.translate(translateParams)
  .then(translationResult => {
    console.log(JSON.stringify(translationResult, null, 2));
  })
  .catch(err => {
    console.log('error:', err);
  });