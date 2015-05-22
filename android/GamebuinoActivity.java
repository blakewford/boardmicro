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
		return Bitmap.createScaledBitmap(mBitmap, (mScreenWidth/5)*2, (mScreenHeight/5)*3 + mScreenHeight/20, false);
        }

        @Override
        public void setDebugResult(final String result){}

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
        public String getExampleDir(){
            return "gamebuino";
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
