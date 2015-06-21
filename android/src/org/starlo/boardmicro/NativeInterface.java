package org.starlo.boardmicro;

public class NativeInterface
{
	private int mRowSet = 0;
	private int mDataSent = 0;
	private int mColumnSet = 0;
	private int mScreenDataOffset = -1;
	private int portState[] = new int[5];
	private int mVideoMemory[] = new int[10];
	private BoardMicroInterface mBoardMicro;

	public native void loadPartialProgram(String line);
	public native void engineInit(String target);
	public native int fetchN(int n);

	public NativeInterface(BoardMicroInterface boardMicro){
		mBoardMicro = boardMicro;
	}

	public void writePort(int port, byte value) {
		mBoardMicro.writePort(port, getUnsigned(value));
	}

	public void writeSPI(int value) {
		mBoardMicro.writeSPI(value);
	}

	private int getUnsigned(byte value) {
		return value & 0xFF;
	}

	static { System.loadLibrary("run_avr"); }
}
