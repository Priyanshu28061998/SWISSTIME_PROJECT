const Nexmo = require('nexmo');
const nexmo = new Nexmo({
  apiKey: "1285b85f",
  apiSecret: "Glu9wFvXIGLcktCm"
});


nexmo.message.sendSms(
  '919953270799','yo',
    (err, responseData) => {
      if (err) {
        console.log(err);
      } else {
        console.dir(responseData);
      }
    }
 );

