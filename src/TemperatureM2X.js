// 実行前に一度、m2xモジュールをインストールしておくこと
//   npm install -g m2x`

// M2Xの接続に必要な情報
// 実行時のコマンドを以下のようにしてください。
//   apiKey=... deviceId=... streamId=... node M2X.js
// ...の部分はM2Xの管理画面に載っています。
var apiKey = process.env.apiKey;
var deviceId = process.env.deviceId;
var streamId = process.env.streamId;

// 心拍センサーモジュールを用意し、A0ピンの温度センサーをtemp2という名前で操作できるようにする
var groveSensor = require('jsupm_grove');
var temp0 = new groveSensor.GroveTemp(0);

// M2Xモジュールを用意し、M2Xサービスへ温度を送信できるようにする
var m2xModule = require("m2x");
var m2x = new m2xModule(apiKey);


console.log("温度センサーの動作を開始します");

// プログラムの実行直後に一度 checkTemp() を実行し、その後は1分ごとに checkTemp() を実行する
checkTemp();

var waiting = setInterval(function() {
  checkTemp();
}, 60000);

// 温度センサーから温度を取得して、M2Xに送信する
function checkTemp() {
  var celsius = temp0.value();
  m2x.devices.setStreamValue(deviceId, streamId, {value: celsius}, function (response) {
    console.log(response.json);
  });
}

// プログラムが終了するときに、温度センサーの動作とM2Xの送信を終了する
process.on('SIGINT', function () {
  clearInterval(waiting);
  groveSensor.cleanUp();
  console.log("温度センサーの動作を終了しました");
  process.exit(0);
});
