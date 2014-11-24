package org.starlo.boardmicro;

import android.os.Bundle;
import android.app.Activity;
import android.graphics.Bitmap;
import android.view.View.*;
import android.view.*;

import org.starlo.boardmicro.R;

public class BoardMicroActivity extends MainActivity
{
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		setConfiguration(R.layout.display_layout, 160, 128, true, true);
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
	protected SurfaceView getDisplay() {
		return (SurfaceView)findViewById(R.id.display);
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
}
