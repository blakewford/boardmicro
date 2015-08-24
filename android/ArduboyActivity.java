package org.starlo.boardmicro.arduboy;

import android.os.Bundle;
import android.app.Activity;
import android.graphics.Bitmap;
import android.view.View.*;
import android.view.*;
import android.widget.*;
import android.content.Intent;
import android.content.res.Resources;
import android.graphics.Color;
import org.starlo.boardmicro.*;
import org.starlo.boardmicro.arduboy.R;

public class ArduboyActivity extends MainActivity
{
	private OLED mScreen = null;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		mScreen = new OLED();
		setConfiguration(R.layout.arduboy, 128, 64);
		super.onCreate(savedInstanceState);
	}

	@Override
	protected Bitmap getScaledBitmap() {
		return Bitmap.createScaledBitmap(mBitmap, mScreenWidth, (int)Math.round(mScreenHeight/3), false);
	}

	@Override
	public void handleButtonPress(View view) {
		switch(view.getId())
		{
			case R.id.btnUp:
				buttonHit(0x23,0xEF);
				break;
			case R.id.btnRight:
				buttonHit(0x26,0x80);
				break;
			case R.id.btnDown:
				buttonHit(0x23,0xBF);
				break;
			case R.id.btnLeft:
				buttonHit(0x23,0xDF);
				break;
			case R.id.btnA:
				buttonHit(0x2F,0x7F);
				break;
			case R.id.btnB:
				buttonHit(0x2F,0xBF);
				break;
		}
	}

        @Override
        public String getExampleDir(){
            return "arduboy";
        }

        @Override
        protected View findExampleListView(View view){
            return view.findViewById(R.id.example_list);
        }

        @Override
        public View getExampleView(){
            LayoutInflater inflater = getLayoutInflater();
            return inflater.inflate(R.layout.examples, null);
        }

        @Override
        public String getMessageString(){
            return getUIString(R.string.choose_source_location);
        }

        @Override
        public String getDropboxString(){
            return getUIString(R.string.dropbox);
        }

        @Override
        public String getExampleString(){
            return getUIString(R.string.examples);
        }

        @Override
        public void setPinState(char port, byte pin, boolean status) {}

	@Override
	protected void startDebugActivity(){}

	@Override
	protected SurfaceView getDisplay() {
		return (SurfaceView)findViewById(R.id.display);
	}

	@Override
        public void setDebugResult(final String result){}

	@Override
        public void writeSPI(final JsonSpiUpdate[] updates) {
		final long startTime = System.nanoTime();
		mSurfaceView.post(new Runnable(){
			public void run(){
				for(int i = 0; i < updates.length; i++)
				{
					JsonSpiUpdate update = updates[i];
					mScreen.send(update.p.d, update.s);
				}
				mPostTime = (System.nanoTime()-startTime)/1000000;
			}
		});
	}

	@Override
        protected void filterOutUnsupportedPins(){}

	@Override
	protected String getTarget(){
		return "atmega32u4";
	}

	private class OLED
	{
		private int X=0, Y=0;
		public void send(int portValue, int data) {
			if(portValue == 0x50)
			{
				for(int j = 0; j < 8; j++)
				{
					int color = Color.parseColor((data & (1 << j)) == 0 ? "#000000": "#FFFFFF");
					setPixel(X, Y+j, color);
				}
				if(++X == getScreenWidth())
				{
					X = 0;
					Y += 8;
					if(Y == getScreenHeight())
					{
						Y = 0;
					}
				}
			}
		}
	}
}
