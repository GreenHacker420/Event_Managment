// ESP32 + MPU6050 Posture Monitor (Improved)
// Using Jeff Rowberg I2Cdev + MPU6050 library

#include "I2Cdev.h"
#include "MPU6050.h"
#include "Wire.h"

MPU6050 accelgyro(0x68);

// Raw accelerometer data
int16_t ax, ay, az;

// ESP32 buzzer pin
int buzzerPin = 14;

// ---- ANGLE LIMITS ----
float lowLimit = 30.0;   // bad if angle < 30°
float highMin = 55.0;    // bad zone start
float highMax = 86.0;    // bad zone end

unsigned long requiredTime = 5UL * 60UL * 1000UL; // 5 minutes
unsigned long badStartTime = 0;
bool badAngleDetected = false;

// ---- FILTER (MOVING AVERAGE) ----
const int filterWindow = 20;
float angleBuffer[filterWindow];
int bufferIndex = 0;
float filteredAngle = 0;

// ---- Auto-Recalibration ----
float lastAngle = 0;
unsigned long lastMovementTime = 0;
const float stillTolerance = 0.3;      // small movement allowed
const unsigned long stillTime = 5000;  // 5 seconds steady

void setup() {
  Serial.begin(115200);

  // ESP32 I2C pins
  Wire.begin(21, 22, 400000);  
  delay(200);

  Serial.println("Initializing MPU6050...");
  accelgyro.initialize();

  if (accelgyro.testConnection())
    Serial.println("MPU6050 connection successful");
  else
    Serial.println("MPU6050 connection failed!");

  pinMode(buzzerPin, OUTPUT);
  digitalWrite(buzzerPin, LOW);

  for (int i = 0; i < filterWindow; i++)
    angleBuffer[i] = 0;

  lastMovementTime = millis();
}

void loop() {

  // Read accelerometer
  accelgyro.getAcceleration(&ax, &ay, &az);

  // Convert to g
  float accX = ax / 16384.0;
  float accY = ay / 16384.0;
  float accZ = az / 16384.0;

  // Calculate angle (Y-axis tilt)
  float angleY = atan2(-accX, sqrt(accY * accY + accZ * accZ)) * 180.0 / PI;

  // ---- MOVING AVERAGE FILTER ----
  angleBuffer[bufferIndex] = angleY;
  bufferIndex = (bufferIndex + 1) % filterWindow;

  float sum = 0;
  for (int i = 0; i < filterWindow; i++)
    sum += angleBuffer[i];

  filteredAngle = sum / filterWindow;

  Serial.print("AngleY (filtered): ");
  Serial.println(filteredAngle);


  // ---- AUTO-RECALIBRATION WHEN STILL ----
  if (abs(filteredAngle - lastAngle) < stillTolerance) {
    if (millis() - lastMovementTime > stillTime) {
      Serial.println("Sensor steady → recalibrating...");
      accelgyro.initialize();  // simple recalibration to remove drift
      lastMovementTime = millis();
    }
  } else {
    lastMovementTime = millis(); // movement detected
  }

  lastAngle = filteredAngle;


  // ---- BAD ANGLE CHECK ----
  bool isBadAngle = false;

  if (filteredAngle < lowLimit) isBadAngle = true;
  if (filteredAngle >= highMin && filteredAngle <= highMax) isBadAngle = true;


  // ---- TIMER LOGIC ----
  if (isBadAngle) {
    if (!badAngleDetected) {
      badAngleDetected = true;
      badStartTime = millis();
    }

    if (millis() - badStartTime >= requiredTime) {
      digitalWrite(buzzerPin, HIGH);  // alert
    }
  }
  else {
    badAngleDetected = false;
    digitalWrite(buzzerPin, LOW);  // reset buzzer
  }

  delay(40); // stable reading frequency
}
