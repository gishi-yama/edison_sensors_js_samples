'use strict';

//  LCDモジュールを用意し、I2CピンのLCDをLcdという名前で操作できるようにする
var LCD = require('jsupm_i2clcd');//IC2 RGB BackLight
var Lcd = new LCD.Jhd1313m1 (0, 0x3E, 0x62);
Lcd.setCursor(0,0);
// RGB Red
Lcd.setColor(0, 255, 0);

//温度センサーモジュールを用意し、A0ピンのgroveSensorをtempという名前で操作できるようにする
var groveSensor = require('jsupm_grove');
var temp = new groveSensor.GroveTemp(0);

console.log(temp.name());

//温度センサーから1秒ごとに温度を測定する
var celsius, fahrenheit;
var waiting = setInterval(function(){getDegree()}, 1000);//1000ミリ秒＝1秒

function getDegree() {
  celsius = temp.value();
  fahrenheit = celsius * 9.0/5.0 + 32.0;
  console.log(celsius + " degrees Celsius, or " +
              Math.round(fahrenheit) + " degrees Fahrenheit");
  writeToLCD(celsius +"c");
}

//LCDへの表示
function writeToLCD(t){
    Lcd.clear();
    Lcd.setCursor(0,0);
    Lcd.write(t);
}

//終了時に温度センサーとLCDを停止する
process.on('SIGINT', function() {
    clearInterval(waiting);
    groveSensor.cleanUp();
    Lcd.setColor(0, 0, 0);
    Lcd.clear();
    LCD.cleanUp();
    process.exit(0);
});
