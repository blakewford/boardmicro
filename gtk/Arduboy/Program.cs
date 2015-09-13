using System;
using System.Text;
using System.Threading;
using Gtk;

namespace Arduboy
{
	class MainClass
	{
		private static volatile bool GtkRunning = true;

		private static void Simulation()
		{
			SimAVR.engineInit("atmega32u4");
			while(GtkRunning && SimAVR.fetchN(16000000) > 0)
			{
			}
		}

		public static void Main(string[] args)
		{
			Application.Init();
			MainWindow win = new MainWindow();
			win.ShowAll();
			string[] lines = System.IO.File.ReadAllLines(args[0]);
			foreach(string line in lines)
			{
				var encoding = Encoding.UTF8;
				byte[] bytes = new byte[line.Length];
				System.Buffer.BlockCopy(encoding.GetBytes(line), 0, bytes, 0, bytes.Length);
				SimAVR.loadPartialProgram(bytes);
			}
			SimAVR.SharpSPI callback = (portC, value) =>
			{
			};
			SimAVR.SharpCallback(callback);


			new Thread(Simulation).Start();
			Application.Run();
			GtkRunning = false;
		}
	}
}
