# Week 8 Assignment
#### Due: OCtober 27, 2020 6pm

## Objective: Use sensors to create data

In this assignment, I was asked to connect sensors to a Particle microcomputer and ensure that data was being recorded in the Particle system.

------

## Starter Code
We were given starter code to use with the Particle web console that connect the various pieces of hardware we are using. Docoumentation for each sensor is linked below:
- DHT sensor: [https://learn.adafruit.com/dht](https://learn.adafruit.com/dht)
- I2S MEMS Microphone breakout: [https://learn.adafruit.com/adafruit-i2s-mems-microphone-breakout](https://learn.adafruit.com/adafruit-i2s-mems-microphone-breakout)


File `Adafruit_ADT7410.cpp`:
```cpp
/*!
 *  @file Adafruit_ADT7410.cpp
 *
 *  @mainpage Adafruit ADT7410 I2C Temp Sensor
 *
 *  @section intro_sec Introduction
 *
 * 	I2C Driver for Microchip's ADT7410 I2C Temp sensor
 *
 * 	This is a library for the Adafruit ADT7410 breakout:
 * 	http://www.adafruit.com/products/1782
 *
 * 	Adafruit invests time and resources providing this open source code,
 *  please support Adafruit and open-source hardware by purchasing products from
 * 	Adafruit!
 *
 *  @section author Author
 *
 *  K.Townsend (Adafruit Industries)
 *
 * 	@section license License
 *
 * 	BSD (see license.txt)
 *
 * 	@section  HISTORY
 *
 *     v1.0 - First release
 */

#include "Arduino.h"
#include <Wire.h>

#include "Adafruit_ADT7410.h"

/*!
 *    @brief  Instantiates a new ADT7410 class
 */
Adafruit_ADT7410::Adafruit_ADT7410() {}

/*!
 *    @brief  Setups the HW
 *    @param  addr
 *    @return True if initialization was successful, otherwise false.
 */
boolean Adafruit_ADT7410::begin(uint8_t addr) {
  _i2caddr = addr;
  Wire.begin();

  uint8_t id = read8(ADT7410_REG__ADT7410_ID) & 0xF8;
  if (id != 0xC8) {
    return false;
  }

  // soft reset
  Wire.beginTransmission(_i2caddr);
  Wire.write(ADT7410_REG__ADT7410_SWRST);
  Wire.endTransmission();

  delay(10);

  return true;
}

/*!
 *   @brief  Reads the 16-bit temperature register and returns the Centigrade
 *           temperature as a float.
 *   @return Temperature in Centigrade.
 */
float Adafruit_ADT7410::readTempC() {
  uint16_t t = read16(ADT7410_REG__ADT7410_TEMPMSB);

  float temp = (int16_t)t;
  temp /= 128.0;

  return temp;
}

/*!
 *    @brief  Low level 8 bit write procedures
 *    @param  reg
 *    @param  value
 */
void Adafruit_ADT7410::write8(uint8_t reg, uint8_t value) {
  Wire.beginTransmission(_i2caddr);
  Wire.write((uint8_t)reg);
  Wire.write((uint8_t)value);
  Wire.endTransmission();
}

/*!
 *    @brief  Low level 16 bit read procedure
 *    @param  reg
 *    @return value
 */
uint16_t Adafruit_ADT7410::read16(uint8_t reg) {
  uint16_t val;

  Wire.beginTransmission(_i2caddr);
  Wire.write((uint8_t)reg);
  Wire.endTransmission(false);

  Wire.requestFrom((uint8_t)_i2caddr, (uint8_t)2);
  val = Wire.read();
  val <<= 8;
  val |= Wire.read();
  return val;
}


/*!
 *    @brief  Low level 8 bit read procedure
 *    @param  reg
 *    @return value
 */
uint8_t Adafruit_ADT7410::read8(uint8_t reg) {
  Wire.beginTransmission(_i2caddr);
  Wire.write((uint8_t)reg);
  Wire.endTransmission(false);

  Wire.requestFrom((uint8_t)_i2caddr, (uint8_t)2);
  return Wire.read();
}
```

File `Adafruit_ADT7410.h`:
```cpp
/*!
 *  @file Adafruit_ADT7410.h
 *
 * 	I2C Driver for Microchip's ADT7410 I2C Temp sensor
 *
 * 	This is a library for the Adafruit ADT7410 breakout:
 * 	http://www.adafruit.com/products/xxxx
 *
 * 	Adafruit invests time and resources providing this open source code,
 *please support Adafruit and open-source hardware by purchasing products from
 * 	Adafruit!
 *
 *
 *	BSD license (see license.txt)
 */

#ifndef _ADAFRUIT_ADT7410_H
#define _ADAFRUIT_ADT7410_H

#include "Arduino.h"
#include <Wire.h>

#define ADT7410_I2CADDR_DEFAULT 0x48 ///< I2C address

#define ADT7410_REG__ADT7410_TEMPMSB 0x0
#define ADT7410_REG__ADT7410_TEMPLSB 0x1
#define ADT7410_REG__ADT7410_STATUS  0x2
#define ADT7410_REG__ADT7410_CONFIG  0x3
#define ADT7410_REG__ADT7410_ID      0xB
#define ADT7410_REG__ADT7410_SWRST   0x2F


/*!
 *    @brief  Class that stores state and functions for interacting with
 *            ADT7410 Temp Sensor
 */
class Adafruit_ADT7410 {
public:
  Adafruit_ADT7410();
  boolean begin(uint8_t a = ADT7410_I2CADDR_DEFAULT);
  float readTempC();
  void write8(uint8_t reg, uint8_t val);
  uint16_t read16(uint8_t reg);
  uint8_t read8(uint8_t reg);

private:
  uint8_t _i2caddr;
};

#endif
```

File `temp-hangar.ino`:
```cpp
// Adafruit IO ADT7410 Example
//
// Adafruit invests time and resources providing this open source code.
// Please support Adafruit and open source hardware by purchasing
// products from Adafruit!
//
// Written by Ladyada and Brent Rubell for Adafruit Industries
// Copyright (c) 2019 Adafruit Industries
// Licensed under the MIT license.
//
// All text above must be included in any redistribution.

/************************ Example Starts Here *******************************/
// #include <Wire.h>
// adt7410 sensor
#include "Adafruit_ADT7410.h"

// Create the ADT7410 temperature sensor object
Adafruit_ADT7410 tempsensor = Adafruit_ADT7410();
double tempvalue;

void setup()
{
  tempsensor.begin();
  // sensor takes 250 ms to get first readings
  delay(500);
  Particle.variable("tempsensor", &tempvalue, DOUBLE);
}

void loop()
{
  // Read and print out the temperature, then convert to *F
  float c = tempsensor.readTempC();
  float f = (c * 9 / 5) + 32;

  tempvalue = f;
  delay(500);
}
```

------

## Process Documentation

### Part 1: Set up sensor



### Part 2: Sketch interface design for data I'll be collecting

```

```javascript
```

### Success! 👾

## Final Reflections
