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
		portState[port] = getUnsigned(value);
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

	public void writeSPI(int value) {
		if (0 == (portState[3] & 64) && 0 == (portState[2] & 4)) {
			if(42 == value)mColumnSet = 4;
			else if(43 == value)
			{
				mRowSet = 4;
			}
		} else {
			if (0 == (portState[3] & 64) && 0 != (portState[2] & 4)) {
				if (0 < mColumnSet) {
					switch(mColumnSet) {
						case 4:
						writeVideoMemory(1, value);
						break;
						case 3:
						writeVideoMemory(0, value);
						break;
						case 2:
						writeVideoMemory(3, value);
						break;
						case 1:
						writeVideoMemory(2, value);
					}
					mColumnSet--;
				} else {
					if (0 < mRowSet) {
						switch(mRowSet) {
							case 4:
							writeVideoMemory(5, value);
							break;
							case 3:
							writeVideoMemory(4, value);
							break;
							case 2:
							writeVideoMemory(7, value);
							break;
							case 1:
							writeVideoMemory(6, value);
					}
					mRowSet--;
					} else {
						if(0 == (mDataSent % 2))
						{
							writeVideoMemory(8, value);
						}
						else
						{
							writeVideoMemory(9, value);
							mDataSent++;
						}
					}
				}
			}
		}
	}

	private void writeVideoMemory(int address, int value) {
		mVideoMemory[address] = value;
		if(address == 0 || address == 1) {
			mScreenDataOffset = -1;
		} else {
			if(address == 9 || address == 8) {
				int startX = mVideoMemory[1] << 8 | mVideoMemory[0];
				int endX = mVideoMemory[3] << 8 | mVideoMemory[2];
				int Y = mVideoMemory[5] << 8 | mVideoMemory[4];
				int endY = mVideoMemory[7] << 8 | mVideoMemory[6];
				int color = mVideoMemory[9] << 8 | mVideoMemory[8];

				int decompressedColor = (8 * (color >> 11) << 16) + (4 * (color >> 5 & 63) << 8);
				decompressedColor += 8 * (color & 31);
				if(-1 != mScreenDataOffset)
				{
					mBoardMicro.setPixel(startX + mScreenDataOffset, Y, decompressedColor);
				}
				if(startX + mScreenDataOffset != endX) mScreenDataOffset++;
				else
				{
					mScreenDataOffset = 0;
					if(Y != endY)
					{
						Y++;
						mVideoMemory[5] = (Y >> 8);
						mVideoMemory[4] = (Y & 255);
					}
				}
			}
		}
	}

	private int getUnsigned(byte value) {
		return value & 0xFF;
	}

	static { System.loadLibrary("run_avr"); }
}
