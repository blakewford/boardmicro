package org.starlo.boardmicro;

import android.os.Bundle;
import android.app.Activity;

public class GamebuinoActivity extends MainActivity
{
        @Override
        protected void onCreate(Bundle savedInstanceState) {
                setConfiguration(R.layout.gamebuino, 84, 48, false, false);
                super.onCreate(savedInstanceState);
        }
}
