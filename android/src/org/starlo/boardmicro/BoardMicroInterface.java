package org.starlo.boardmicro;

public interface BoardMicroInterface {

	public void writeToUARTBuffer(String buffer);
	public void setPinState(char port, byte pin, boolean status);

}
