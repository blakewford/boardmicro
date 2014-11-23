package org.starlo.boardmicro;

import android.os.Bundle;
import android.app.Activity;
import android.graphics.Bitmap;
import android.view.View.*;
import android.view.*;

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

	protected void handleButtonPress(View view) {
	}
}
