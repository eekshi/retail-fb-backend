module.exports.getStatus= function(params,callback){
    var Cloudant = require('@cloudant/cloudant');
   
   
   var me = '40417e08-f02f-4c68-9e7d-167845250c06-bluemix'; // Set this to your own account.
   var password = "c856fe7d49a3842263dd6b3c6576a163ccb17c1a784808e3694eb394ab443688";
    
   // Initialize the library with my account.
   var cloudant = Cloudant({ account: me, password: password },function(err,db){
       if(err){
            console.log("$$$$$$$$$$$$$$$$$$$$$$$$$")
            console.log(err)
        }
        else{
            console.log("Database connected")
        }
    
    var userDB = cloudant.db.use('orders');
    
    console.log("params", params);
    var query =
    {
       "selector": {
          "fbId": params.fbId,
          "Orders.0.OrderId": params.orderID
       }
    }
    userDB.find(query,(err,body)=>{
    if(err){
    console.log('err getting cloudant');
    callback(err);
    //reject ({resData:'error'})
    }
    else{
      console.log("body",body);
     // callback(body.docs[0]);
      if(body.docs.length > 0){
          console.log("body.docs",body.docs)
         callback(body.docs)
      }
    
    } 
    })
    });
    }
    
    
   