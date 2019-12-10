module.exports=  (params) =>{
  console.log("params", params)
    var Cloudant = require('cloudant');
      //var nodemailer = require('nodemailer');
    require('dotenv').config();
   // var cloudant = new Cloudant({ url: process.env.Cloudant_Url, maxAttempt: 5, plugins: [ 'iamauth', { retry: { retryDelayMultiplier: 4, retryErrors: true, retryInitialDelayMsecs:1000, retryStatusCodes: [ 429 ] } } ]});
   var me = '40417e08-f02f-4c68-9e7d-167845250c06-bluemix'; // Set this to your own account.
   var password = "c856fe7d49a3842263dd6b3c6576a163ccb17c1a784808e3694eb394ab443688";
    
   // Initialize the library with my account.
   var cloudant = Cloudant({ account: me, password: password },function(err,db){
       if(err){
            console.log("$$$$$$$$$$$$$$$$$$$$$$$$$")
            console.log(err)
        }
        else{
            console.log("Database connected in updateUserChat file")
        }
   
   var agentDB = cloudant.db.use('user_conversation');
      return new Promise(function(resolve,reject){
        //console.log(params);
        var query={
            selector: {
               _id: {
                  "$eq": params.fbId
               }
            }
          }
          agentDB.find(query,(err,body)=>{
                            if(err){
                console.log('err getting cloudant')
               // reject ({resData:'error'})
              }
              else{
                if(Object.keys(body.docs).length==0){
                    var data={
                        "_id":params.fbId,
                        "conversation":[params.conversation]
                    }
                    agentDB.insert(data, function(err, body1, header) {
                    if(err)
                    console.log(err)
                    else
                    console.log(body1)
                    })
  
                 // resolve({resData:'wrongCredentials'})
                }
                else if(body.docs.length>0){
                    //console.log('this is get response')
                    //console.log(body.docs[0]);
                    var dataRes=body.docs[0];
                    console.log("datares",dataRes)
                    dataRes.conversation.push(params.conversation);
                    agentDB.insert(dataRes, function(err, body1, header) {
  
                        if (err) {
                          reject ({resData:err.message});
                        }else{
                           // resolve({"resData":"success"})
                        }
  
                      });
  
                }
              }
            })
      })
    })
  };
  
  