// Load heart rate sensor module
var groveehr = require('jsupm_groveehr');
// Instantiate a Grove Ear-clip Heart Rate sensor on digital pin D2
var ehr2 = new groveehr.GroveEHR(2);

var i2clcd = require('jsupm_i2clcd');
var lcd = new i2clcd.Jhd1313m1(6, 0x3E, 0x62);
lcd.setColor(0, 255, 0);
lcd.clear();

// set the beat counter to 0, init the clock and start counting beats
ehr2.clearBeatCounter();
ehr2.initClock();
ehr2.startBeatCounter();

var millis, beats, heartRate;
var myInterval = setInterval(function () {
  // we grab these just for display purposes in this example
  millis = ehr2.getMillis();
  beats = ehr2.beatCounter();

  // heartRate() requires that at least 5 seconds pass before
  // returning anything other than 0
  heartRate = ehr2.heartRate();

  // output milliseconds passed, beat count, and computed heart rate
  console.log("Millis: " + millis + " Beats: " + beats +
    " Heart Rate: " + heartRate);

  writeToLCD("Heart Rate: " + heartRate);
}, 1000);

// Print message when exiting
process.on('SIGINT', function () {
  clearInterval(myInterval);
  ehr2.stopBeatCounter();
  ehr2 = null
  groveehr.cleanUp();
  groveehr = null;
  lcd.setColor(0, 0, 0);
  lcd.clear();
  lcd = null;
  i2clcd.cleanUp();
  i2clcd = null;
  process.exit(0);
});

function writeToLCD(str) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.write(str);
}
