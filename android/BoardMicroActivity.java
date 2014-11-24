package org.starlo.boardmicro;

import android.os.Bundle;
import android.app.Activity;
import android.graphics.Bitmap;
import android.view.View.*;
import android.view.*;
import android.widget.*;
import android.content.Intent;
import android.content.res.Resources;
import android.graphics.Color;

import org.starlo.boardmicro.R;

public class BoardMicroActivity extends MainActivity
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
	protected void startDebugActivity(){
		startActivityForResult(new Intent(getApplicationContext(), DebugActivity.class), DEBUG_COMMAND_REQUEST);
	}

	@Override
	protected SurfaceView getDisplay() {
		return (SurfaceView)findViewById(R.id.display);
	}

	@Override
        public void setDebugResult(final String result){
                if(mShouldToastResult)
                        Toast.makeText(this, result, Toast.LENGTH_LONG).show();
                sendBroadcast(new Intent(DebugActivity.SEND_RESULT_ACTION).putExtra("result", result));
                mShouldToastResult = false;
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
