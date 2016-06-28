// 心拍センサーの利用例

// 心拍センサーモジュールを用意し、D2ピンの心拍センサーをeehr2という名前で操作できるようにする
var ehrModule = require('jsupm_groveehr');
var ehr2 = new ehrModule.GroveEHR(2);

// 心拍センサーの動作を開始する
ehr2.clearBeatCounter();
ehr2.initClock();
ehr2.startBeatCounter();
console.log("心拍センサーの動作を開始しました");

// 1000ミリ秒（つまり、1秒）ごとに心拍センサーから生体情報を収集する
var myInterval = setInterval(function () {
  var millis = ehr2.getMillis();
  var beats = ehr2.beatCounter();
  var hr = ehr2.heartRate();
  console.log("収集時間[ms]: " + millis + " 心拍回数: " + beats + " 心拍数: " + hr);
}, 1000);

// プログラムが終了するときに、心拍センサーの動作を終了する
process.on('SIGINT', function () {
  clearInterval(myInterval);
  ehr2.stopBeatCounter();
  ehrModule.cleanUp();
  console.log("心拍センサーの動作を終了しました");
  process.exit(0);
});
