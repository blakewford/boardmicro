package org.starlo.boardmicro;

import com.google.gson.*;

public class NativeInterface
{
	private int mRowSet = 0;
	private int mDataSent = 0;
	private int mColumnSet = 0;
	private int mScreenDataOffset = -1;
	private int portState[] = new int[5];
	private int mVideoMemory[] = new int[10];
	private BoardMicroInterface mBoardMicro;
	private Gson mGson = new Gson();

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

	public void writeSPI(String jsonString) {
		JsonSpiUpdate updates[] = mGson.fromJson(jsonString, JsonSpiUpdate[].class);
		for(int i = 0; i < updates.length; i++)
		{
			JsonSpiUpdate update = updates[i];
			writePort(0, (byte)update.ports.bState);
			writePort(1, (byte)update.ports.cState);
			writePort(2, (byte)update.ports.dState);
			writePort(3, (byte)update.ports.eState);
			writePort(4, (byte)update.ports.fState);
			writeSPI(update.spi);
		}
	}

	private int getUnsigned(byte value) {
		return value & 0xFF;
	}

	static { System.loadLibrary("run_avr"); }
	private class portState
	{
		int bState;
		int cState;
		int dState;
		int eState;
		int fState;
	}

	private class JsonSpiUpdate
	{
		portState ports;
		int spi;
	}
}
