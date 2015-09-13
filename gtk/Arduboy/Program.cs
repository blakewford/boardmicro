using System;
using System.Text;
using System.Threading;
using Gtk;

namespace Arduboy
{
	class MainClass
	{
		private static int X=0, Y=0;
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
				if(portC == 0x50)
				{
					for(int j = 0; j < 8; j++)
					{
						//int color = (value & (1 << j)) == 0 ? 0x000000: 0xFFFFFF;
					}
					if(++X == 128)
					{
						X = 0;
						Y += 8;
						if(Y == 64)
						{
							Y = 0;
						}
					}
				}
			};
			SimAVR.SharpCallback(callback);
			new Thread(Simulation).Start();
			Application.Run();
			GtkRunning = false;
		}
	}
}
