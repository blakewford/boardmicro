import serial
import sys

if len(sys.argv) != 2:
    print "Usage: %s /dev/ttyACM0" % sys.argv[0]
    sys.exit(-1)

serial.Serial(sys.argv[1], 1200).close()
