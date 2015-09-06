using System;
using Gtk;

public partial class MainWindow: Gtk.Window
{
	private const int COlOR_SCALE = 256;

	public MainWindow () : base (Gtk.WindowType.Toplevel)
	{
		SetPosition(Gtk.WindowPosition.Center);
		Title = "Arduboy";
		Gdk.Color color = new Gdk.Color();
		color.Red = 0x66*COlOR_SCALE;
		color.Green = 0x00*COlOR_SCALE;
		color.Blue = 0x33*COlOR_SCALE;
		ModifyBg(StateType.Normal, color);

		Gtk.VBox vLinearLayout = new VBox(false, 15);
		Gtk.Image screen = new Gtk.Image ("screen");
		Gtk.Image scaled = new Gtk.Image(screen.Pixbuf.ScaleSimple (256, 128, Gdk.InterpType.Nearest));
		vLinearLayout.Add(scaled);

		Gtk.HBox hLinearLayout = new HBox(false, 0);
		Gtk.HBox blankLeft = new HBox(false, 0);
		blankLeft.SetSizeRequest(44, 44);
		Gtk.Button upButton = new Gtk.Button();
		upButton.SetSizeRequest(44, 44);
		Gtk.HBox blankRight = new HBox(false, 0);
		blankRight.SetSizeRequest(168, 44);
		hLinearLayout.Add(blankLeft);
		hLinearLayout.Add(upButton);
		hLinearLayout.Add(blankRight);
		vLinearLayout.Add(hLinearLayout);

		Gtk.HBox hLinearLayout1 = new HBox(false, 44);
		Gtk.Button leftButton = new Gtk.Button();
		leftButton.SetSizeRequest(44, 44);
		Gtk.Button rightButton = new Gtk.Button();
		rightButton.SetSizeRequest(44, 44);
		Gtk.HBox blankRight1 = new HBox(false, 0);
		blankRight1.SetSizeRequest(80, 44);
		hLinearLayout1.Add(leftButton);
		hLinearLayout1.Add(rightButton);
		hLinearLayout1.Add(blankRight1);
		vLinearLayout.Add(hLinearLayout1);

		Gtk.HBox hLinearLayout2 = new HBox(false, 0);
		Gtk.HBox blankLeft1 = new HBox(false, 0);
		blankLeft1.SetSizeRequest(44, 44);
		Gtk.Button downButton = new Gtk.Button();
		downButton.SetSizeRequest(44, 44);
		Gtk.HBox blankRight2 = new HBox(false, 0);
		blankRight2.SetSizeRequest(168, 44);
		hLinearLayout2.Add(blankLeft1);
		hLinearLayout2.Add(downButton);
		hLinearLayout2.Add(blankRight2);
		vLinearLayout.Add(hLinearLayout2);

		Gtk.HBox hLinearLayout3 = new HBox(false, 0);
		Gtk.HBox blankLeft2 = new HBox(false, 0);
		blankLeft2.SetSizeRequest(44, 44);
		Gtk.Button aButton = new Gtk.Button();
		aButton.SetSizeRequest(44, 44);
		Gtk.Button bButton = new Gtk.Button();
		bButton.SetSizeRequest(44, 44);
		hLinearLayout3.Add(blankLeft2);
		hLinearLayout3.Add(aButton);
		hLinearLayout3.Add(bButton);
		vLinearLayout.Add(hLinearLayout3);

		Add(vLinearLayout);
	}

	protected void OnDeleteEvent(object sender, DeleteEventArgs a)
	{
		Application.Quit ();
		a.RetVal = true;
	}
}
