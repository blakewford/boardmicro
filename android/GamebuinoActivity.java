package org.starlo.boardmicro.gamebuino;

import android.os.Bundle;
import android.app.Activity;
import android.view.*;
import android.view.View.*;
import android.graphics.Bitmap;
import org.starlo.boardmicro.*;

import org.starlo.boardmicro.gamebuino.R;

public class GamebuinoActivity extends MainActivity
{
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		setConfiguration(R.layout.gamebuino, 84, 48);
		super.onCreate(savedInstanceState);
	}

        @Override
        protected Bitmap getScaledBitmap() {
		return Bitmap.createScaledBitmap(mBitmap, (mScreenWidth/5)*2, (mScreenHeight/5)*3, false);
        }

        @Override
        public void setDebugResult(final String result){}

        @Override
        public void setPinState(char port, byte pin, boolean status) {}

	@Override
	protected void filterOutUnsupportedPins(){}

	@Override
        protected void startDebugActivity(){}

	@Override
	protected SurfaceView getDisplay(){
		return (SurfaceView)findViewById(R.id.display);
	}

	@Override
	public void handleButtonPress(View view) {
                int pinNumber = -1;
                switch(view.getId())
                {
                        case R.id.btnUp:
                                pinNumber = 1;
                                break;
                        case R.id.btnRight:
                                pinNumber = 0;
                                break;
                        case R.id.btnDown:
                                pinNumber = 22;
                                break;
                        case R.id.btnLeft:
                                pinNumber = 23;
                                break;
                        case R.id.btnA:
                                pinNumber = 20;
                                break;
                        case R.id.btnB:
                                pinNumber = 18;
                                break;
                        case R.id.btnC:
                                pinNumber = 11;
                                break;
                }
                if(pinNumber >= 0)
                        mBackgroundWebView.loadUrl("javascript:handlePinInput("+pinNumber+")");
        }
}
