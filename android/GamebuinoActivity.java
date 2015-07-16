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
                switch(view.getId())
                {
                        case R.id.btnUp:
                                buttonHit(0x23,0xFD);
                                break;
                        case R.id.btnRight:
                                buttonHit(0x29,0x7F);
                                break;
                        case R.id.btnDown:
                                buttonHit(0x29,0xBF);
                                break;
                        case R.id.btnLeft:
                                buttonHit(0x23,0xFE);
                                break;
                        case R.id.btnA:
                                buttonHit(0x29,0xEF);
                                break;
                        case R.id.btnB:
                                buttonHit(0x29,0xFB);
                                break;
                        case R.id.btnC:
                                buttonHit(0x26,0xF7);
                                break;
                }
        }

	@Override
        public void writeSPI(final JsonSpiUpdate[] updates) {
		mSurfaceView.post(new Runnable(){
			public void run(){
				for(int i = 0; i < updates.length; i++)
				{
					JsonSpiUpdate update = updates[i];
					mBackgroundWebView.loadUrl("javascript:writePort("+1+","+update.p.c+")");
					mBackgroundWebView.loadUrl("javascript:writeSPI("+update.s+")");
				}
			}
		});
	}

	@Override
	protected String getTarget(){
		return "atmega328";
	}
}
