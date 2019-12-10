// Load the Watson Developer Cloud library.
var express = require('express');
var app = express();
var watson = require('watson-developer-cloud');
var bodyParser = require('body-parser');
var request = require('request');
var database = require("./db.js");
var updateDB = require("./updateDB.js");
var updateAgent = require("./agentUpdate.js")
var updateDB1 = require("./updateDB1.js");
var addressUpdate = require("./addressUpdate.js");
var getData = require("./getShoes.js")
var agentStatus = require("./agentStatus.js")
var cardDB = require("./cardDB.js");
var getStatus = require("./getStatus.js")
var cancelOrder = require("./cancelOrder.js")
var classifier = require("./visualRecognizer.js")
const jwt = require('jsonwebtoken-refresh');
var request = require("request");
var rp = require('request-promise');
const ToneAnalyzerV3 = require('ibm-watson/tone-analyzer/v3');


var port = 8000;
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())
app.use(express.static(__dirname + '/Login'));
var context = {};
var token = 'EAAT4lt4AZBBkBAIvvbYZClsoWpUfdhuEdrGnpW2xyT0byhUIONT1ABu5KsezdqhVQrWwOuoxGta33OCJ1QPAKSDcOqF3zV27ifrTgDflPntv8SOQ03M8MZAZC8t4XomaofP5p48QUUC5vzJZBkwv5TAyJbBAgB18N0s0IHU0lBXuaCdbblJbw';
var FbUserId = '';
var watsonID = 'eeaf35d6-2ef2-4425-b18c-451f14f7ddff';
var contextId = '';
var respBasicData, responseData;



//Initializing Watson Assiatant

var assistant = new watson.AssistantV1({
    iam_apikey: 'CjGbUCXpTokp2szQnmdEwUaibXmb6SEONFVC-Ez8kEwK',
    version: '2019-09-20',
    url: 'https://gateway-lon.watsonplatform.net/assistant/api'
});


const toneAnalyzer = new ToneAnalyzerV3({
    version: '2019-09-20',
    iam_apikey: 'ILRgrvQkq2Oet1Dr8SGa5rqcu8iskQvFoAMYKRwb9-RJ',
    url: 'https://gateway-lon.watsonplatform.net/tone-analyzer/api'
});



app.get('/', (req, res) => {
    console.log('get webhook');
    if (req.query['hub.verify_token'] === 'RetailChatbot') {
        res.send(req.query['hub.challenge']);
    } else
        res.send('Error when we try to validating your token.');
});

function watsonRequest(data, id) {
    var payload = {
        workspace_id: 'eeaf35d6-2ef2-4425-b18c-451f14f7ddff',
        input: {
            "text": data
        },
        context: context
    }
    /******************************************************************************* */









    //************************************************************************************** */
    assistant.message(payload, function (err, response) {
        if (err)
            console.log('error:', err);
        else {
            //console.log(JSON.stringify(response, null, 2));	
            context = response.context;
            responseData = JSON.parse(response.output.text[0]);

            console.log("responseData", responseData);
            database.loginStatus({ fbId: FbUserId }, function (result) {

                console.log("################")
                console.log(result);
                console.log(result.LoginStatus)


                if (responseData.action == "forward") {
                    console.log("inside forward")
                    if (responseData.function == "Incident" || responseData.function == "Greetings") {
                        typingOn(id)
                        loginSend(FbUserId, responseData.message)
                        setTimeout(() => {
                            typingOn(id)
                            loginSend(FbUserId, responseData.message1)
                        }, 2000);


                    }
                    else if (responseData.function == "Anything else") {
                        toneAnalysis(data).then((resp) => {
                            console.log("calling tone analysis", resp)
                            //console.log("resp.info",resp.info.document_tone.tones[0].tone_id)
                            if (resp.info.document_tone.tones.length > 0) {
                                if (resp.info.document_tone.tones[0].tone_id == "sadness") {
                                    console.log("sadness")
                                    loginSend(FbUserId, "Sorry to hear that. Do you want me to connect to the live agent?")
                                }

                                else {
                                    loginSend(FbUserId, responseData.message)
                                }
                            }
                            else {
                                loginSend(FbUserId, responseData.message)
                            }
                        })

                    }
                    else {
                        typingOn(id)
                        loginSend(FbUserId, responseData.message)
                    }

                }
                else if (responseData.action == "process") {
                    console.log("inside process")
                    if (responseData.function == "capabilities") {

                        console.log("typeof(responseData.buttons)", typeof (responseData.buttons));
                        typingOn(id)
                        buttonSend(FbUserId, responseData.message, responseData.buttons)
                    }
                    if (result.LoginStatus == "false") {

                        if (responseData.function == "ItemStatus") {
                            console.log("logincheck")
                            typingOn(id)
                            login(FbUserId, "Login to your Account to access your order history", responseData.function, responseData.message, response.entities[0].value)
                            // richCard(FbUserId, response.entities[0].value)


                            //loginSend(FbUserId,responseData.message)





                        }
                        else if (responseData.function == "Location") {
                            typingOn(id)
                            login(FbUserId, "Login to your Account to access your order history", responseData.function, responseData.message, "123");

                        }
                    }
                    else if (result.LoginStatus == "true") {

                        if (responseData.function == "ItemStatus") {
                            console.log("response in item ", response)
                            typingOn(id)
                            loginSend(FbUserId, responseData.message)
                            getStatus.getStatus({ fbId: FbUserId, orderID: response.context.orderID }, function (result) {
                                if (result[0].Orders[0].OrderStatus == "cancelled") {
                                    loginSend(FbUserId, "Your order was cancelled")
                                }
                                else {
                                    setTimeout(() => {
                                        typingOn(id)
                                        console.log("............................................")
                                        console.log("response", response)
                                        richCard(FbUserId, response.entities[0].value)
                                    }, 2000);
                                }
                            });


                        }
                        else if (responseData.function == "Location") {
                            console.log("inside location");
                            typingOn(id)
                            loginSend(FbUserId, responseData.message)
                            setTimeout(() => {
                                typingOn(id)
                                mapSend(FbUserId);
                            }, 2000);
                        }

                        else if (responseData.function == "cancelOrder") {
                            console.log("Inside Cancel order module")
                            cancelOrder.cancelOrder({ OrderId: response.context.orderID }, function (result) {
                                console.log("result", result)
                                loginSend(FbUserId, "Thank you. Your order has been canceled successfully")
                            });

                        }

                        else if (responseData.function == "agentFunction") {

                            updateAgent.updateAgent({ fbId: FbUserId }, function () {

                            })
                        }


                        else if (responseData.function == "ChangeAddress") {
                            console.log("inside address change module")
                            console.log("ORDERID", response.context.orderID)
                            var orderID = response.context.orderID
                            typingOn(id)
                            var options = {
                                method: 'GET',
                                url: 'http://autocomplete.geocoder.api.here.com/6.2/suggest.json',
                                qs:
                                {
                                    app_id: 'lGEmNrR1MTOaatsJFKUs',
                                    app_code: '35eIURzqFrdr16Hb1QAsxQ',
                                    query: response.input.text
                                },
                                headers:
                                {
                                    Connection: 'keep-alive',

                                    Host: 'autocomplete.geocoder.api.here.com',

                                    Accept: '*/*',
                                    'User-Agent': 'PostmanRuntime/7.15.2'
                                }
                            };

                            request(options, function (error, response, body) {
                                if (error) throw new Error(error);
                                console.log("body", body);
                                location = JSON.parse(body).suggestions[0]
                                console.log("location", location);
                                // console.log("body data", JSON.parse(body).suggestions[0])
                                // console.log(typeof(body.suggestions))

                                //.log(JSON.parse(body).suggestions[0]);

                                addressUpdate.addressUpdate({ fbId: FbUserId, street: location.address.street, city: location.address.city, postalCode: location.address.postalCode, state: location.address.state, country: location.address.country, orderID: orderID }, function (result) {
                                    console.log(result)
                                    loginSend(FbUserId, result)


                                });


                            });


                        }


                    }

                }


            });
        }
    });
}

app.get('/fblogin', (req, res) => {
    console.log("INSIDE FBLOGIN")
    res.sendFile(__dirname + '/Login/login.html');
});

app.post('/', (req, res) => {

    res.sendStatus(200);


    //  console.log("req.body", req.body)

    console.log(".................................................")
    //console.log(req.body)
    for (let i = 0; i < req.body.entry[0].messaging.length; i++) {
        //  console.log("req.body.entry[0].messaging[i].message.attachments",req.body.entry[0].messaging[i].message.attachments[0])  
        console.log("req.body.entry[0].messaging[i]", req.body.entry[0].messaging[i]);

        //    if(req.body.entry[0].messaging[i].message.attachments)
        //       {
        //             console.log("inside attatchment");
        //         if(req.body.entry[0].messaging[i].message.attachments[0].type=="image")
        //         {
        //             console.log("inside image")
        //             FbUserId = req.body.entry[0].messaging[i].sender.id;
        //             var url = req.body.entry[0].messaging[i].message.attachments[0].payload.url
        //             classifier.classifier( {url : url},function (result) {
        //                 console.log("result",result);
        //                 if(result == "puma"){
        //                     getData.getData({ type: result}, function (resultData) {
        //                         sendCards(FbUserId,resultData )
        //                     });
        //                 }
        //                 else{
        //                     console.log(FbUserId)
        //                     loginSend(FbUserId, result)
        //                 }
        //            })


        //         }
        //       }

        if (req.body.entry[0].messaging[i].message) {
            FbUserId = req.body.entry[0].messaging[i].sender.id;
            console.log("agent checkinggggggggggg")
            agentStatus.agentStatus({ fbId: FbUserId }, function (result) {
                console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
                console.log("result in agent part", result[0].isAgentOn)



                if (result[0].isAgentOn == false) {

                    console.log("message");
                    if (req.body.entry[0].messaging[i].message.attachments) {
                        console.log("inside attatchment");
                        if (req.body.entry[0].messaging[i].message.attachments[0].type == "image") {
                            console.log("inside image")
                            FbUserId = req.body.entry[0].messaging[i].sender.id;
                            var url = req.body.entry[0].messaging[i].message.attachments[0].payload.url
                            classifier.classifier({ url: url }, function (result) {
                                console.log("result", result);
                                if (result == "puma") {
                                    getData.getData({ type: result }, function (resultData) {
                                        loginSend(FbUserId, "Here are some similar products")
                                        sendCards(FbUserId, resultData)
                                    });
                                }
                                else {
                                    console.log(FbUserId)
                                    loginSend(FbUserId, result)
                                }
                            })


                        }
                    }
                    else {
                        console.log("inside message")
                        FbUserId = req.body.entry[0].messaging[i].sender.id;
                        console.log("fbuserID :", FbUserId)
                        respBasicData = req.body.entry[0].messaging[i].message.text;
                        watsonRequest(respBasicData, FbUserId)
                    }
                }
                else {
                    var msg = req.body.entry[0].messaging[i].message.text
                    socketImplementation(FbUserId, msg)
                }
            })
        }
        else {
            if (req.body.entry[0].messaging[i].postback) {
                console.log("inside postback button")
                FbUserId = req.body.entry[0].messaging[i].sender.id;
                respBasicData = req.body.entry[0].messaging[i].postback.payload;
                watsonRequest(respBasicData, FbUserId)
            }
        }

        //  else
        // {
        //     console.log("################################");
        //     console.log("req.body.entry[0].messaging[i].message.attachments",req.body.entry[0].messaging[i].message.attachments) 
        //     // if(req.body.entry[0].messaging[i].message.attachments){
        //     //     //   else{  
        //     //        console.log("inside attachment file function")

        //     //     //       if(req.body.entry[0].messaging[i].message.attachments[0].type == "image"){
        //     //     //       var url = req.body.entry[0].messaging[i].message.attachments[0].type.payload.url
        //     //     //        classifier.classifier( {url : url},function (result) {
        //     //     //        })
        //     //     //    }


        //     //        }
        // }

    }

});



// Getting user details using Facebook Graph API
function loginSend(id, text) {
    console.log("@@@@@@@@@@@@@@@@@@@");
    var dataPost = {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: token
        },
        method: 'POST',
        json: {
            recipient: {
                id: id
            },
            message: {
                "text": text
            }
        }
    };
    requestFunction(dataPost)
}

function sendCards(id, data1) {
    //console.log("data in sendCards", data);
    let elements = [];

    data1.forEach(dataElement => {
        //console.log("dataElement.url",dataElement.url);
        elements.push({
            "title": "Shoe",
            // "color":"#FF0000",
            "image_url": dataElement.url,
            //  "image_url":"https://c.static-nike.com/a/images/t_PDP_1280_v1/f_auto/vdiddoo53iphaixaqlc0/air-force-1-07-shoe-13DSWH.jpg"
            // "subtitle": dataElement.Squarefeet+ "\n"+ dataElement.Bedrooms + "\n" + dataElement.Bathrooms+"\n"+dataElement.Type

        })
    });
    console.log("elements", elements);

    var dataPost = {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: id },
            message: {
                attachment: {
                    type: "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": elements
                    }
                }
            }
        }
    };
    requestFunction(dataPost)
}



//function to send responses with buttons to facebook
function buttonSend(id, text, buttons) {
    console.log("typeof(buttons)", typeof (buttons));
    let button = [];
    for (var i = 0; i < buttons.length; i++) {
        button.push({
            "type": "postback",
            "title": buttons[i],
            "payload": buttons[i]
        })

    }

    console.log("typeof(button)", typeof (button));
    var dataPost = {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: id },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: text,
                        buttons: button
                    }
                }
            }
        }
    };
    requestFunction(dataPost)
}


// this function is used to send the message to facebook
function requestFunction(dataPost) {

    request(dataPost, (error, response, body) => {
        if (error) {
            console.log('Error when we try to sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else {
            console.log("Successfully Sent the message");
        }
    });

}

//login button for facebook


function login(id, text, fun, msg, value) {

    var dataPost = {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: id },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: text,
                        buttons: [
                            {
                                "type": "account_link",

                                "url": " https://fbc63a0c.ngrok.io/fblogin?id=" + id + "&functionName=" + fun + "&message=" + msg + "&value=" + value
                            }
                        ]
                    }
                }
            }
        }
    };
    requestFunction(dataPost)
}

app.post('/checkCredentials', (req, res) => {
    console.log('check credentials');
    if (req.body.userName == "clokam@miraclesoft.com" && req.body.userPassword == "Miracle@123") {
        //userChat.push("You are successfully logged in!");
        console.log('success authentication');
        res.send({ key: 'success', value: "You are successfully logged in!" });
        updateDB.updateLogin({ fbId: FbUserId }, function (result) {
            loginSend(req.body.fid, "You are successfully logged in! Continue your chat.");



            if (req.body.fun == "ItemStatus") {
                loginSend(req.body.fid, req.body.message)
                richCard(FbUserId, req.body.value)

            }
            else if (req.body.fun == "Location") {
                loginSend(req.body.fid, req.body.message)
                setTimeout(() => {
                    console.log("&&&&&&&&&&&&&&&&&&&&&&")
                    // console.log(process.env.Facebook_id)
                    mapSend(req.body.fid);
                }, 2000);
            }
        })

        jwtToken = jwt.sign({ data: 'CaraBot' }, 'secret', { expiresIn: 10 * 60 })
        // sessionTrue(sessionResponse); 
    } else {
        console.log('error in authenticating')
        res.send({ key: 'fail', value: "Please check the credentials and try again!" });
    }
})


//function to send the responses with richcard to facebook
function richCard(id, entity) {
    cardDB.cardDB({ fbId: FbUserId }, function (result) {
        console.log("resulttttt", result);
        console.log(typeof (result.PaymentMethod));
        console.log(typeof (result.Currency));
        console.log(typeof (result.Orders));
        console.log(result.Orders[0])

        var dataPost = {
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: token },
            method: 'POST',
            json: {
                recipient: { id: id },
                message: {
                    attachment: {
                        type: "template",
                        "payload": {
                            "template_type": "receipt",
                            "recipient_name": "Joy Paul",
                            "order_number": entity,
                            "currency": result.Currency,
                            "payment_method": result.PaymentMethod,
                            "order_url": "https://www.miraclesoft.com",
                            "address": result.Orders[0].Address,
                            "summary": {
                                "subtotal": 65,
                                "shipping_cost": 10,
                                "total_tax": 5,
                                "total_cost": 70
                            },
                            "elements": [
                                {
                                    "title": result.Orders[0].Items[0].ItemName,
                                    "subtitle": result.Orders[0].Items[0].Title,
                                    "quantity": result.Orders[0].Items[0].Quantity,
                                    "price": result.Orders[0].Items[0].Price,
                                    "currency": result.Currency,
                                    "image_url": result.Orders[0].Items[0].URL
                                },
                                {
                                    "title": result.Orders[0].Items[1].ItemName,
                                    "subtitle": result.Orders[0].Items[1].Title,
                                    "quantity": result.Orders[0].Items[1].Quantity,
                                    "price": result.Orders[0].Items[1].Price,
                                    "currency": result.Currency,
                                    "image_url": result.Orders[0].Items[1].URL
                                }
                            ]
                        }
                    }
                }
            }


        }
        requestFunction(dataPost)
    });
}


//function to send map as response
function mapSend(id) {
    console.log("INSIDE MAPSEND FUNCTION")

    var dataPost = {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: id },
            message: {
                attachment: {
                    type: "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": "Miracle's Shoe Corp. Twelve Oaks Mall | Novi, MI – 48374",
                                // "color":"#FF0000",
                                "image_url": "https://www.elegantthemes.com/blog/wp-content/uploads/2016/09/Divi-Google-Maps.png",
                                "subtitle": "Timings: 9AM to 8PM",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://www.miraclesoft.com",
                                    "messenger_extensions": false,
                                    "webview_height_ratio": "compact"
                                }
                            },
                        ]
                    }
                }
            }
        }
    };
    requestFunction(dataPost)
}


//function for typing 
function typingOn(id) {
    var dataPost = {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: id },
            sender_action: "typing_on"
        }
    };
    requestFunction(dataPost)
}

//function for sending discount dealing notifications to end user
function notifications() {
    var dataPost = {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.Facebook_Token },
        method: 'POST',
        json: {
            recipient: { id: fbId },
            message: {
                // text: "Today's big sale offer!",
                attachment: {
                    type: "image",
                    payload: {
                        url: "https://caratheretailbot.mybluemix.net/carousel?fileName=dayNotification",
                        is_reusable: true
                    }
                }
            }
        }
    };
    requestFun(dataPost)
}


//function to send the corousel notifications to end user
function corouselNotifications() {
    var dataPost = {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.Facebook_Token },
        method: 'POST',
        json: {
            recipient: { id: fbId },
            "message": {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": "Men's shoe offer!",
                                "image_url": "https://caratheretailbot.mybluemix.net/carousel?fileName=weekNotification2",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://www.miraclesoft.com",
                                    "webview_height_ratio": "tall",
                                }
                            },
                            {
                                "title": "Women's shoe offer!",
                                "image_url": "https://caratheretailbot.mybluemix.net/carousel?fileName=weekNotification3",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://www.miraclesoft.com",
                                    "webview_height_ratio": "tall",
                                }
                            },
                            {
                                "title": "Men's shoe big sale offer!",
                                "image_url": "https://caratheretailbot.mybluemix.net/carousel?fileName=weekNotification4",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://www.miraclesoft.com",
                                    "webview_height_ratio": "tall",
                                }
                            },
                            {
                                "title": "Women's shoe big sale offer!",
                                "image_url": "https://caratheretailbot.mybluemix.net/carousel?fileName=weekNotification5",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://www.miraclesoft.com",
                                    "webview_height_ratio": "tall",
                                }
                            },
                            {
                                "title": "Big Sale!!!",
                                "image_url": "https://caratheretailbot.mybluemix.net/carousel?fileName=weekNotification1",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://www.miraclesoft.com",
                                    "webview_height_ratio": "tall",
                                }
                            }
                        ]
                    }
                }
            }
        }
    }

    requestFun(dataPost)

}


//function for sending discount dealing notifications to end user
function notifications(id) {
    var dataPost = {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: id },
            message: {
                // text: "Today's big sale offer!",
                attachment: {
                    type: "image",
                    payload: {
                        url: "https://caratheretailbot.mybluemix.net/carousel?fileName=dayNotification",
                        is_reusable: true
                    }
                }
            }
        }
    };
    requestFunction(dataPost)
}



//function to send the corousel notifications to end user
function corouselNotifications(id) {
    var dataPost = {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: id },
            "message": {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": "Men's shoe offer!",
                                "image_url": "https://caratheretailbot.mybluemix.net/carousel?fileName=weekNotification2",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://www.miraclesoft.com",
                                    "webview_height_ratio": "tall",
                                }
                            },
                            {
                                "title": "Women's shoe offer!",
                                "image_url": "https://caratheretailbot.mybluemix.net/carousel?fileName=weekNotification3",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://www.miraclesoft.com",
                                    "webview_height_ratio": "tall",
                                }
                            },
                            {
                                "title": "Men's shoe big sale offer!",
                                "image_url": "https://caratheretailbot.mybluemix.net/carousel?fileName=weekNotification4",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://www.miraclesoft.com",
                                    "webview_height_ratio": "tall",
                                }
                            },
                            {
                                "title": "Women's shoe big sale offer!",
                                "image_url": "https://caratheretailbot.mybluemix.net/carousel?fileName=weekNotification5",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://www.miraclesoft.com",
                                    "webview_height_ratio": "tall",
                                }
                            },
                            {
                                "title": "Big Sale!!!",
                                "image_url": "https://caratheretailbot.mybluemix.net/carousel?fileName=weekNotification1",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://www.miraclesoft.com",
                                    "webview_height_ratio": "tall",
                                }
                            }
                        ]
                    }
                }
            }
        }
    }

    requestFunction(dataPost)
}


//tone Analysys
function toneAnalysis(input) {
    console.log("inside tone analysis")
    return new Promise(function (resolve, reject) {

        const toneParams = {
            tone_input: { 'text': input },
            content_type: 'application/json',
        };
        toneAnalyzer.tone(toneParams)
            .then(toneAnalysis => {
                console.log(JSON.stringify(toneAnalysis, null, 2));
                resolve({ "info": toneAnalysis })
            })
            .catch(err => {
                console.log('error:', err);
                reject({ "err": err });
            });
    });

}

//     tone_analyzer.tone(toneParams, function (err, response) {
//         if (err) {
//             console.log('error:' + err);
//         }
//         else {	/* 
//             console.log('---------------------toneAnalysis-----------');*/
//             console.log("tone response",JSON.stringify(response));
//           //  var count = false;
//             // for (let i = 0; i < response.document_tone.tone_categories[0].tones.length; i++) {

//             //     if (response.document_tone.tone_categories[0].tones[i].score > 0.7) {
//             //         return response.document_tone.tone_categories[0].tones[i];
//             //         count = true;
//             //         i = response.document_tone.tone_categories[0].tones.length - 1;
//             //     }
//             //     if (i == response.document_tone.tone_categories[0].tones.length - 1 && !count) {
//             //         return { "score": 0, "tone_id": "no_tone", "tone_name": "No Tone" }
//             //     }
//             // }
//         }
//     });




app.listen(port, function () {
    console.log('running on 8000');



    /*  setTimeout(() => {
         
          corouselNotifications("2858881334138912");
      }, 100000);
      */


});


    
function socketImplementation(fbid, msg) {
    //console.log("conversationID", conversationID);
    console.log("inside socketsimp")
    var options = {
        method: 'POST',
        uri: 'https://765d7fcf.ngrok.io/getRequest',
        body: {
            "fbId": fbid,
            "msg": msg

        },
        json: true // Automatically stringifies the body to JSON
    };

    rp(options)
        .then(function (parsedBody) {
            console.log("parsedBody", parsedBody);
        })
        .catch(function (err) {
            console.log("error", err);
            if (err.statusCode == 404) {
                loginSuccessMessage(fbid, "No Agents are available at this moment");
                enableBot({ "fbId": fbid }).then(() => {
                    console.log("bot enabled");
                });
            }
            else {
                loginSuccessMessage(fbid, "No Agents are available at this moment");
                enableBot({ "fbId": fbid }).then(() => {
                    console.log("bot enabled");
                });
            }
        });

}