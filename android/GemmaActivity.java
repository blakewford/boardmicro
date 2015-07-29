package org.starlo.boardmicro.gemma;

import android.os.*;
import android.app.Activity;
import android.graphics.Bitmap;
import android.view.View.*;
import android.view.*;
import android.widget.*;
import android.content.Intent;
import android.content.res.Resources;
import android.graphics.Color;
import android.content.Context;
import org.starlo.boardmicro.*;

import org.starlo.boardmicro.gemma.R;

public class GemmaActivity extends MainActivity
{
	private volatile Vibrator mVibrator;
	private boolean mVibrate = false;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		setConfiguration(R.layout.gemma, 1, 1);
		mVibrator = (Vibrator)getSystemService(Context.VIBRATOR_SERVICE);
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
            return "gemma";
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
		if(port != 'B' || pin > 2) return;
		final View view = findViewById(r.getIdentifier("pin"+new Byte(pin).toString(), "id", this.getPackageName()));
		view.post(new Runnable(){
			public void run(){
				if(view.getId() == R.id.pin1)
					mVibrate = finalStatus;
				view.setEnabled(finalStatus);
			}
		});
        }

	@Override
	protected void startDebugActivity(){}

	@Override
	public void setDebugResult(final String result){}

	@Override
	protected SurfaceView getDisplay() {
		return (SurfaceView)findViewById(R.id.display);
	}

	@Override
	protected void refreshScreenLoop() {
		if(mVibrate) mVibrator.vibrate(100);
		super.refreshScreenLoop();
	}

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
		findViewById(R.id.pin0).setEnabled(false);
		findViewById(R.id.pin1).setEnabled(false);
		findViewById(R.id.pin2).setEnabled(false);
	}

	@Override
	protected String getTarget(){
		return "attiny85";
	}
}
