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
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		setConfiguration(R.layout.display_layout, 160, 128);
		super.onCreate(savedInstanceState);
	}

	@Override
	protected Bitmap getScaledBitmap() {
		return Bitmap.createScaledBitmap(mBitmap, mScreenWidth, (mScreenHeight/5)*2 + mScreenHeight/20, false);
	}

	@Override
	public void handleButtonPress(View view) {
	}

        @Override
        public String getExampleDir(){
            return "boardmicro";
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
        public void setPinState(char port, byte pin, boolean status) {
		Resources r = getResources();
		final boolean finalStatus = status;
		final View view = findViewById(r.getIdentifier("port"+new Character(port).toString(), "id", this.getPackageName()))
			.findViewById(r.getIdentifier("pin"+new Byte(pin).toString(), "id", this.getPackageName()));
		view.post(new Runnable(){
			public void run(){
				view.setBackgroundColor(finalStatus ? Color.GREEN: Color.RED);
			}
		});
        }

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
					mBackgroundWebView.loadUrl("javascript:writePort("+2+","+update.p.d+")");
					mBackgroundWebView.loadUrl("javascript:writePort("+3+","+update.p.e+")");
					mBackgroundWebView.loadUrl("javascript:writeSPI("+update.s+")");
				}
				mPostTime = (System.nanoTime()-startTime)/1000000;
			}
		});
	}

	@Override
        protected void filterOutUnsupportedPins(){
                findViewById(R.id.portC).findViewById(R.id.pin0).setVisibility(View.INVISIBLE);
                findViewById(R.id.portC).findViewById(R.id.pin1).setVisibility(View.INVISIBLE);
                findViewById(R.id.portC).findViewById(R.id.pin2).setVisibility(View.INVISIBLE);
                findViewById(R.id.portC).findViewById(R.id.pin3).setVisibility(View.INVISIBLE);
                findViewById(R.id.portC).findViewById(R.id.pin4).setVisibility(View.INVISIBLE);
                findViewById(R.id.portC).findViewById(R.id.pin5).setVisibility(View.INVISIBLE);
                findViewById(R.id.portE).findViewById(R.id.pin0).setVisibility(View.INVISIBLE);
                findViewById(R.id.portE).findViewById(R.id.pin1).setVisibility(View.INVISIBLE);
                findViewById(R.id.portE).findViewById(R.id.pin3).setVisibility(View.INVISIBLE);
                findViewById(R.id.portE).findViewById(R.id.pin4).setVisibility(View.INVISIBLE);
                findViewById(R.id.portE).findViewById(R.id.pin5).setVisibility(View.INVISIBLE);
                findViewById(R.id.portE).findViewById(R.id.pin7).setVisibility(View.INVISIBLE);
                findViewById(R.id.portF).findViewById(R.id.pin2).setVisibility(View.INVISIBLE);
                findViewById(R.id.portF).findViewById(R.id.pin3).setVisibility(View.INVISIBLE);
        }

	@Override
	protected String getTarget(){
		return "atmega32u4";
	}
}
