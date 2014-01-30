char platform = 0x1E;
int led = 13;

void platformBasedDelay(int milliseconds) {
  asm ("ldi r30, 0x00");
  asm ("ldi r31, 0x01");
  asm ("ldi r16, 0x21"); 
  asm ("sts 0x57, r16");
  asm ("ld r16, Z");
  if(platform == 0xBF)
    delay(milliseconds/180);
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
