using System;
using Gtk;

public partial class MainWindow: Gtk.Window
{
	private const int COlOR_SCALE = 256;

	public Gtk.Image Standard {get; set;}
	public Gtk.Image Scaled {get; set;}

	public MainWindow() : base (Gtk.WindowType.Toplevel)
	{
		Build();
		SetPosition(Gtk.WindowPosition.Center);
		Title = "Arduboy";
		Gdk.Color color = new Gdk.Color();
		color.Red = 0x66*COlOR_SCALE;
		color.Green = 0x00*COlOR_SCALE;
		color.Blue = 0x33*COlOR_SCALE;
		ModifyBg(StateType.Normal, color);

		Fixed vLinearLayout = new Fixed();
		Standard = new Gtk.Image ("screen");
		Scaled = new Gtk.Image(Standard.Pixbuf.ScaleSimple (256, 128, Gdk.InterpType.Nearest));
		vLinearLayout.Put(Scaled, 0, 0);

		Gtk.Button upButton = new Gtk.Button();
		upButton.SetSizeRequest(44, 44);
		vLinearLayout.Put(upButton, 44, 145);

		Gtk.HBox hLinearLayout = new HBox(false, 44);
		Gtk.Button leftButton = new Gtk.Button();
		leftButton.SetSizeRequest(44, 44);
		Gtk.Button rightButton = new Gtk.Button();
		rightButton.SetSizeRequest(44, 44);
		hLinearLayout.Add(leftButton);
		hLinearLayout.Add(rightButton);
		vLinearLayout.Put(hLinearLayout, 0, 200);

		Gtk.Button downButton = new Gtk.Button();
		downButton.SetSizeRequest(44, 44);
		vLinearLayout.Put(downButton, 44, 255);

		Gtk.HBox hLinearLayout3 = new HBox(false, 0);
		Gtk.Button aButton = new Gtk.Button();
		aButton.SetSizeRequest(44, 44);
		Gtk.Button bButton = new Gtk.Button();
		bButton.SetSizeRequest(44, 44);
		hLinearLayout3.Add(aButton);
		hLinearLayout3.Add(bButton);
		vLinearLayout.Put(hLinearLayout3, 168, 305);

		Add(vLinearLayout);
	}

	protected void OnDeleteEvent(object sender, DeleteEventArgs a)
	{
		Application.Quit ();
		a.RetVal = true;
	}
}
