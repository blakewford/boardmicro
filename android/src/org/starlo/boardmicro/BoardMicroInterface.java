package org.starlo.boardmicro;

import android.graphics.Color;

public interface BoardMicroInterface {

	public void writeToUARTBuffer(String buffer);
	public void setPinState(char port, byte pin, boolean status);
	public void setPixel(int x, int y, int color);
	public void startProcess(String javascriptUrl);
	public void endProgram();
}
