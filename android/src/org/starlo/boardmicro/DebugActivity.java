package org.starlo.boardmicro;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;
import android.view.View.*;
import android.widget.*;
import android.view.View;

public class DebugActivity extends Activity {

	@Override
	protected void onCreate(Bundle savedInstanceState){
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		setContentView(R.layout.debug);
		findViewById(R.id.gdb).setOnClickListener(new OnClickListener(){
			public void onClick(View view){
				TextView commandView = (TextView)findViewById(R.id.command);
				String command = commandView.getText().toString().trim();
				commandView.setText("");
				//mBackgroundWebView.loadUrl("javascript:handleDebugCommandString('"+command+"')");
			}
		});
	}
}
