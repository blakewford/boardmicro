package org.starlo.boardmicro;

import android.webkit.JavascriptInterface;
import android.widget.Toast;
import android.content.Context;
import java.util.LinkedList;
import android.graphics.Color;

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

	@JavascriptInterface
	public void drawPixel(int x, int y, String colorString) {
		mBoardMicro.setPixel(x, y, Color.parseColor(colorString));
	}

	@JavascriptInterface
	public void endProgram() {
		mBoardMicro.endProgram();
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
