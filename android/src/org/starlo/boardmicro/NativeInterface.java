package org.starlo.boardmicro;

public class NativeInterface
{
	static { System.loadLibrary("run_avr"); }
}
