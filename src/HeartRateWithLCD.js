// 心拍センサーとLCDの利用例

// 心拍センサーモジュールを用意し、D2ピンの心拍センサーをehr2という名前で操作できるようにする
var ehrModule = require('jsupm_groveehr');
var ehr2 = new ehrModule.GroveEHR(2);

// LCDモジュールを用意し、I2CピンのLCDをlcdという名前で操作できるようにする
var i2clcd = require('jsupm_i2clcd');
var lcd = new i2clcd.Jhd1313m1(6, 0x3E, 0x62);
lcd.setColor(0, 255, 0);
lcd.clear();

// 心拍センサーの動作を開始する
ehr2.clearBeatCounter();
ehr2.initClock();
ehr2.startBeatCounter();
console.log("心拍センサーの動作を開始しました");

// 1000ミリ秒（つまり、1秒）ごとに心拍センサーから生体情報を収集し、LCDに表示する
var myInterval = setInterval(function () {
  var millis = ehr2.getMillis();
  var beats = ehr2.beatCounter();
  var hr = ehr2.heartRate();
  console.log("収集時間[ms]: " + millis + " 心拍回数: " + beats + " 心拍数: " + hr);
  writeToLCD("Heart Rate: " + hr);
}, 1000);

// str の内容をLCDに表示する
function writeToLCD(str) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.write(str);
}

// 終了時にセンサーとLCDを停止する
process.on('SIGINT', function () {
  clearInterval(myInterval);
  ehr2.stopBeatCounter();
  ehrModule.cleanUp();
  lcd.setColor(0, 0, 0);
  lcd.clear();
  i2clcd.cleanUp();
  console.log("心拍センサーの動作を終了しました");
  process.exit(0);
});
