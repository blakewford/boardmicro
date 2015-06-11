package org.starlo.boardmicro;

public class NativeInterface
{
	private BoardMicroInterface mBoardMicro;

	public native void loadPartialProgram(String line);
	public native void engineInit(String target);
	public native int fetchN(int n);

	public NativeInterface(BoardMicroInterface boardMicro){
		mBoardMicro = boardMicro;
	}

	public void writePort(int port, byte value) {
		for(byte i=0; i < 8; i++){
			boolean status = (value & 0x1) > 0;
			char portChar = '\0';
			switch(port){
				case 0:
					portChar = 'B';
					break;
				case 1:
					portChar = 'C';
					break;
				case 2:
					portChar = 'D';
					break;
				case 3:
					portChar = 'E';
					break;
				case 4:
					portChar = 'F';
					break;
			}
			mBoardMicro.setPinState(portChar, i, status);
			value = (byte)(value >> 0x1);
		}
	}

	static { System.loadLibrary("run_avr"); }
}
