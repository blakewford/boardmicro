using System;
using Gtk;

namespace Arduboy
{
	class MainClass
	{
		public static void Main (string[] args)
		{
			Application.Init();
			MainWindow win = new MainWindow();
			win.ShowAll();
			SimAVR.loadPartialProgram(null);
			Application.Run();
		}
	}
}
