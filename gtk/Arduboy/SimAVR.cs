using System;
using System.Runtime.InteropServices;

namespace Arduboy
{
	public class SimAVR
	{
		[UnmanagedFunctionPointer(CallingConvention.StdCall)]
		public delegate void SharpSPI(byte portC, byte spi);
		[DllImport ("libsimavr.so")]
		public static extern void SharpCallback([MarshalAs(UnmanagedType.FunctionPtr)] SharpSPI pointer);

		[DllImport ("libsimavr.so")]
		public static extern void loadPartialProgram(byte[] binary);
		[DllImport ("libsimavr.so")]
		public static extern void engineInit(String m);
		[DllImport ("libsimavr.so")]
		public static extern int fetchN(int n);
	}
}

