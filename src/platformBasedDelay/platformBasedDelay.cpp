#include <WProgram.h>
#include <avr/boot.h>

#define SIGRD 5

int led = 13;

void platformBasedDelay(unsigned long milliseconds) {
  if(boot_signature_byte_get(0) == 0xBF)
    delay(milliseconds >> 8);
  else
    delay(milliseconds);
}

void setup() {
  pinMode(led, OUTPUT);
}

void loop() {
  digitalWrite(led, HIGH);
  platformBasedDelay(1000);
  digitalWrite(led, LOW);
  platformBasedDelay(1000);
}
