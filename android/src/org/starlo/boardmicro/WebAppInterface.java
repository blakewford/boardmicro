package org.starlo.boardmicro;

import android.webkit.JavascriptInterface;
import android.widget.Toast;
import android.content.Context;
import java.util.LinkedList;
import android.util.Log;

public class WebAppInterface {

	private LimitedQueue<String> mUARTBuffer = new LimitedQueue<String>(32);
	private BoardMicroInterface mBoardMicro;

	public WebAppInterface(BoardMicroInterface boardMicro){
		mBoardMicro = boardMicro;
	}

	@JavascriptInterface
	public void writeUARTBuffer(int value) {
		mUARTBuffer.add(new Character((char)value).toString());
		mBoardMicro.writeToUARTBuffer(mUARTBuffer.toString());
	}

	@JavascriptInterface
	public void writePort(int port, byte value) {
		for(byte i=0; i < 8; i++){
			if((value & 0x1) > 0){
				char portChar = '\0';
				switch(port){
					case 0:
						portChar = 'B';
						mBoardMicro.setPinState(portChar, i, true);
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
			}
			value = (byte)(value >> 0x1);
		}
	}

	private class LimitedQueue<E> extends LinkedList<E> {
		private final int mLimit;

		public LimitedQueue(int limit) { mLimit = limit;}

		@Override
		public boolean add(E o) {
			super.add(o);
			while (size() > mLimit) { super.remove(); }
			return true;
		}
	}
}
