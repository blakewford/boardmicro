using System;
using System.Runtime.InteropServices;

namespace Arduboy
{
	public class SimAVR
	{
		[DllImport ("libsimavr.so")]
		public static extern void loadPartialProgram(byte[] binary);
		[DllImport ("libsimavr.so")]
		public static extern void engineInit(String m);
		[DllImport ("libsimavr.so")]
		public static extern int fetchN(int n);
	}
}

