const fs = require('fs');
const download = require('image-downloader')
module.exports.classifier = function (params, callback) {

    console.log("{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{")
    console.log("params", params)

    const VisualRecognitionV3 = require('ibm-watson/visual-recognition/v3');

    const visualRecognition = new VisualRecognitionV3({
        version: '2018-03-19',
        iam_apikey: 'BF6EWYWPFi301EJtIJF04DzgK-Am8LJzBKd5KKzgtSDn'
    });

    const createClassifierParams = {
        name: 'shoes',
        negative_examples: fs.createReadStream('./shirts.zip'),
        positive_examples: {
            nike: fs.createReadStream('./nike.zip'),
            adidas: fs.createReadStream('./adidas.zip'),
            // puma: fs.createReadStream('./puma.zip'),
        }
    };


    // const detectFacesParams = {
    //     images_file: fs.createReadStream('./0.jpg'),
    // };

    // visualRecognition.createClassifier(createClassifierParams).then(classifier => {
    //         console.log("first console", JSON.stringify(classifier, null, 2));
    //         detectFacesParams = {               
    //             images_file: fs.createReadStream('./0.jpg'),
    //             classifier_ids: ['shoes_1024125780'],

    //         };
    //         classifier.classify(detectFacesParams,(err,res)=>{
    //             if(!err){
    //                 console.log(JSON.stringify(res))
    //             }
    //             else{
    //                 console.log(err)
    //             }
    //         })
    //     }).catch(err => {
    //         console.log('error:', err);
    //     });
    // const listClassifiersParams = {
    //     verbose: true,
    //   };
    // visualRecognition.listClassifiers(listClassifiersParams)
    // .then(classifiers => {
    //   console.log(JSON.stringify(classifiers, null, 2));
    // })


    // visualRecognition.createClassifier(createClassifierParams, (err, classifier) => {
    //     if (!err) {
    //         // console.log(JSON.stringify(classifier, null, 2));
    //         console.log("name",classifier.classifier_id)

    //     }
    //     else {
    //         console.log("err", err)
    //     }
    // })


    // visualRecognition.classify(detectFacesParams,(err,res)=>{
    //     if(!err){
    //         console.log(JSON.stringify(res))
    //     }
    //     else{
    //         console.log(err)
    //     }
    // })

    // visualRecognition.detectFaces(detectFacesParams, (err, res) => {
    //     if (!err)
    //         console.log(res);

    //     else
    //         console.log('error:', err);

    // })

    options = {
        url: params.url,
        dest: __dirname+'/images/photo.jpg'      // Save to /path/to/dest/photo.jpg
    }

   

    download.image(options)
        .then(({ filename, image }) => {
            console.log(filename)
            detectFacesParams = {
                images_file: fs.createReadStream(__dirname+'/images/photo.jpg'),
                classifier_ids: ["shoes_1984151857"]
        
            };
             console.log('Saved to', filename)  // Saved to /path/to/dest/photo.jpg
            visualRecognition.classify(detectFacesParams, (err, res) => {
                // console.log(detectFacesParams)
        
                if (!err) {
                    // console.log(JSON.stringify(res))
                    var response = res;
                    console.log(response)
                    if(response.images[0].classifiers[0].classes[0].class == undefined) 
                    console.log("Oops!")
                    else
                    console.log(response.images[0].classifiers[0].classes[0].class)
                    callback(response.images[0].classifiers[0].classes[0].class)
                
                }
                else {
                    console.log("error while detecting")
                    callback("Sorry, this product is not available. We only offer shoes of various brands")
                }
            })
        })
        .catch((err) => console.error(err))


    


}

//shoes_1024125780
