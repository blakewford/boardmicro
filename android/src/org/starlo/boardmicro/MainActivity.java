package org.starlo.boardmicro;

import org.starlo.boardmicro.R;

import android.os.Bundle;
import android.app.Activity;
import android.webkit.WebView;
import android.widget.*;
import android.content.Intent;
import android.webkit.WebViewClient;
import android.view.*;
import com.dropbox.chooser.android.DbxChooser;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.Bitmap.Config;
import android.graphics.Canvas;
import android.util.TypedValue;
import android.view.MotionEvent;
import android.view.SurfaceHolder;
import android.util.Log;
import android.view.GestureDetector.SimpleOnGestureListener;
import android.view.View.*;
import android.hardware.SensorManager;
import android.content.*;
import android.graphics.Matrix;

public class MainActivity extends Activity implements SurfaceHolder.Callback, BoardMicroInterface{

	public static final String SEND_COMMAND_ACTION = "sendCommand";

	private static final int DBX_CHOOSER_REQUEST = 0;
	private static final int DEBUG_COMMAND_REQUEST = 1;
	private static final String ASSET_URL = "file:///android_asset/avrcore.html";

	private SurfaceView mSurfaceView;
	private WebView mBackgroundWebView;
	private SurfaceHolder mHolder;
	private Bitmap mBitmap;
	private Bitmap mScaledBitmap;
	private Thread mRefreshThread = null;
	private GestureDetector mGestureDetector = null;

	private int mScreenWidth;
	private int mScreenHeight;
	private boolean mScreenDirty = true;
	private boolean mProgramEnded = false;
	private boolean mDropboxCalled = false;
	private boolean mPaused = false;
	private boolean mShouldToastResult = false;

	private int SCREEN_WIDTH;
	private int SCREEN_HEIGHT;
	private int[] mPixelArray;
	private boolean mUsePins;
	private boolean mUseGDB;
	private int mLayout;

	private BroadcastReceiver receiver = new BroadcastReceiver() {
		@Override
		public void onReceive(Context context, Intent intent) {
			sendDebugCommand(intent.getStringExtra("command"));
		}
	};

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(mLayout);
		setupUI();
		startBackgroundWebApp();
		IntentFilter filter = new IntentFilter();
		filter.addAction(SEND_COMMAND_ACTION);
		registerReceiver(receiver, filter);
		//WebView.setWebContentsDebuggingEnabled(true);
	}

	@Override
	protected void onResume() {
		mPaused = false;
		super.onResume();
	}

	@Override
	protected void onPause() {
		mPaused = true;
		super.onPause();
	}

	@Override
	protected void onDestroy() {
		unregisterReceiver(receiver);
		super.onDestroy();
	}

	@Override
	public void onActivityResult(int requestCode, int resultCode, Intent data) {
		super.onActivityResult(requestCode, resultCode, data);
		if(resultCode != Activity.RESULT_OK)
			return;
		switch(requestCode)
		{
			case DBX_CHOOSER_REQUEST:
				final DbxChooser.Result result = new DbxChooser.Result(data);
				new DropboxTask(result.getLink().toString(), this).execute();
				break;
			case DEBUG_COMMAND_REQUEST:
				mShouldToastResult = true;
				sendDebugCommand(data.getStringExtra("command"));
				break;
		}
	}

	@Override
        public void writeToUARTBuffer(String buffer) {
		Log.v("UART", buffer);
		Toast.makeText(this, buffer, Toast.LENGTH_SHORT).show();
	}

	@Override
        public void setPinState(char port, byte pin, boolean status) {
		if(mUsePins){
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
	}

	@Override
        public void setPixel(int x, int y, int color){
		mScreenDirty = true;
		mPixelArray[y*SCREEN_WIDTH+x] = color;
	}

	@Override
	public void startProcess(String javascriptUrl){
		try{
			mBackgroundWebView.loadUrl(javascriptUrl);
			mBackgroundWebView.loadUrl("javascript:engineInit()");
			mBackgroundWebView.loadUrl("javascript:exec()");
			startRefreshThread();
		}catch(Exception e){}
	}

	@Override
	public void updateADCRegister(final int value){
		if(mPaused)
			return;
                mSurfaceView.post(new Runnable(){
                        public void run(){
				mBackgroundWebView.loadUrl("javascript:writeADCDataRegister("+value+")");
                        }
                });
	}

	@Override
	public void sendDebugCommand(final String command){
		mBackgroundWebView.loadUrl("javascript:handleDebugCommandString('"+command+"')");
	}

	@Override
	public void setDebugResult(final String result){
		if(mShouldToastResult)
			Toast.makeText(this, result, Toast.LENGTH_LONG).show();
		sendBroadcast(new Intent(DebugActivity.SEND_RESULT_ACTION).putExtra("result", result));
		mShouldToastResult = false;
	}

	@Override
        public void endProgram(){
		mProgramEnded = true;
	}

	@Override
	public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {}

	@Override
	public void surfaceCreated(SurfaceHolder holder) {
		wipeScreen();
	}

	@Override
	public void surfaceDestroyed(SurfaceHolder holder) {}

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

	protected void setConfiguration( int layout, int width, int height, boolean usePins, boolean useGDB ){
		mLayout = layout;
		mUsePins = usePins;
		mUseGDB = useGDB;
		SCREEN_WIDTH = width;
		SCREEN_HEIGHT = height;
		mPixelArray = new int[SCREEN_WIDTH*SCREEN_HEIGHT];
	}

	private void startRefreshThread(){
		endProgram();
		mRefreshThread = new Thread(new Runnable(){
			public void run(){
				while(!mProgramEnded){
					refreshScreenLoop();
					try{
						Thread.yield();
					}catch(Exception e){}
				}
			}
		});
		int i = Short.MAX_VALUE*1000;
		while(i-- > 0)
			refreshScreenLoop();
		mProgramEnded = false;
		mRefreshThread.start();
	}

	private void wipeScreen(){
		wipeScreen(Color.BLACK);
	}

	private void wipeScreen(int color){
		for(int i = 0; i < SCREEN_HEIGHT; i++){
			for(int j = 0; j < SCREEN_WIDTH; j++){
				setPixel(j, i, color);
			}
		}
	}

	private void refreshScreenLoop(){
		if(mScreenDirty){
			mScreenDirty = false;
			if(mScaledBitmap != null)
				mScaledBitmap.recycle();
			Canvas canvas = mHolder.lockCanvas();
			if(canvas != null){
				canvas.drawColor(Color.BLACK);
				mBitmap.setPixels(mPixelArray, 0, SCREEN_WIDTH, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
				if(false)
					mScaledBitmap = Bitmap.createScaledBitmap(mBitmap, (mScreenWidth/5)*2, (mScreenHeight/5)*3, false);
				else
					mScaledBitmap = Bitmap.createScaledBitmap(mBitmap, mScreenWidth, (mScreenHeight/5)*2 + mScreenHeight/20, false);
				canvas.drawBitmap(mScaledBitmap, 0, 0, null);
				mHolder.unlockCanvasAndPost(canvas);
			}
		}
	}

	private void setupUI(){
		mSurfaceView = (SurfaceView)findViewById(R.id.display);
		mHolder = mSurfaceView.getHolder();
		mHolder.addCallback(this);
		mBitmap = Bitmap.createBitmap(SCREEN_WIDTH, SCREEN_HEIGHT, Config.ARGB_8888);
		Resources r = mSurfaceView.getResources();
		mScreenWidth =
			Float.valueOf(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, r.getConfiguration().screenWidthDp, r.getDisplayMetrics())).intValue();
		mScreenHeight =
			Float.valueOf(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, r.getConfiguration().screenHeightDp, r.getDisplayMetrics())).intValue();
		mBackgroundWebView = new WebView(this);
		mGestureDetector = new GestureDetector(getApplicationContext(),
			new GestureDetector.SimpleOnGestureListener() {
				@Override
				public boolean onDown(MotionEvent event){
					return true;
				}

				@Override
				public void onLongPress(MotionEvent event){
					mBackgroundWebView.loadUrl(ASSET_URL);
					new DbxChooser(DropboxConstants.API_KEY).forResultType(DbxChooser.ResultType.DIRECT_LINK).launch(MainActivity.this, DBX_CHOOSER_REQUEST);
				}

				@Override
				public boolean onDoubleTap(MotionEvent event){
					if(mUseGDB)
						startActivityForResult(new Intent(getApplicationContext(), DebugActivity.class), DEBUG_COMMAND_REQUEST);
					return true;
				}
			});
		mSurfaceView.setOnTouchListener(new OnTouchListener() {
			public boolean onTouch(View v, MotionEvent event) {
				return mGestureDetector.onTouchEvent(event);
			}
		});
		if(mUsePins)
			filterOutUnsupportedPins();
		getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
	}

	private void startBackgroundWebApp(){
		mBackgroundWebView.getSettings().setJavaScriptEnabled(true);
		mBackgroundWebView.loadUrl(ASSET_URL);
		mBackgroundWebView.addJavascriptInterface(
			new PichaiJavascriptInterface(this, new ADCSensorManager((SensorManager)getSystemService(Context.SENSOR_SERVICE))), "Android");
		mBackgroundWebView.getSettings().setUserAgentString(mBackgroundWebView.getSettings().getUserAgentString()+" NativeApp");
		mBackgroundWebView.setWebViewClient(new WebViewClient() {
			public void onPageFinished(WebView view, String loc) {
				if(DropboxConstants.USE_DROPBOX && !mDropboxCalled){
					mDropboxCalled = true;
					new DbxChooser(DropboxConstants.API_KEY).forResultType(DbxChooser.ResultType.DIRECT_LINK).launch(MainActivity.this, DBX_CHOOSER_REQUEST);
				}else if(!DropboxConstants.USE_DROPBOX){
					startProcess("javascript:loadDefault()");
				}
			}
		});
	}

	private void filterOutUnsupportedPins(){
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
