package org.starlo.boardmicro;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;
import android.view.View.*;
import android.widget.*;
import android.view.View;
import android.content.*;

public class DebugActivity extends Activity {

	public static final String SEND_RESULT_ACTION = "sendResult";

        private BroadcastReceiver receiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
			((TextView)findViewById(R.id.result)).setText(intent.getStringExtra("result"));
                }
        };

	@Override
	protected void onCreate(Bundle savedInstanceState){
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		setContentView(R.layout.debug);
		findViewById(R.id.gdb).setOnClickListener(new OnClickListener(){
			public void onClick(View view){
				TextView commandView = (TextView)findViewById(R.id.command);
				String command = commandView.getText().toString().trim();
				Intent intent = new Intent(MainActivity.SEND_COMMAND_ACTION).putExtra("command", command);
				if(command.equals("c")){
					setResult(Activity.RESULT_OK, intent);
					finish();
				}else{
					sendBroadcast(intent);
				}
			}
		});
	}

	@Override
	protected void onResume() {
		IntentFilter filter = new IntentFilter();
		filter.addAction(SEND_RESULT_ACTION);
		registerReceiver(receiver, filter);
		super.onResume();
	}

	@Override
	protected void onPause() {
		unregisterReceiver(receiver);
		super.onPause();
	}
}
