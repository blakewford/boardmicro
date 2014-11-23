package org.starlo.boardmicro;

import android.os.Bundle;
import android.app.Activity;

public class BoardMicroActivity extends MainActivity
{
        @Override
        protected void onCreate(Bundle savedInstanceState) {
		setConfiguration(R.layout.display_layout, 160, 128, true, true);
		super.onCreate(savedInstanceState);
	}
}
