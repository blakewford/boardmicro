package org.starlo.boardmicro;

import org.starlo.boardmicro.R;

import android.os.Bundle;
import android.app.Activity;
import android.webkit.WebView;
import android.widget.Toast;
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
import android.view.View.OnTouchListener;
import android.hardware.SensorManager;
import android.content.Context;

public class MainActivity extends Activity implements SurfaceHolder.Callback, BoardMicroInterface{

	private static final int DBX_CHOOSER_REQUEST = 0;
	private static final int SCREEN_WIDTH = 160;
	private static final int SCREEN_HEIGHT = 128;
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
	private	int[] mPixelArray = new int[SCREEN_WIDTH*SCREEN_HEIGHT];
	private boolean mScreenDirty = true;
	private boolean mProgramEnded = false;
	private boolean mDropboxCalled = false;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.display_layout);
		setupUI();
		startBackgroundWebApp();
	}

	@Override
	public void onActivityResult(int requestCode, int resultCode, Intent data) {
		if (requestCode == DBX_CHOOSER_REQUEST) {
			if (resultCode == Activity.RESULT_OK) {
				final DbxChooser.Result result = new DbxChooser.Result(data);
				new DropboxTask(result.getLink().toString(), this).execute();
			}
		} else {
			super.onActivityResult(requestCode, resultCode, data);
		}
	}

	@Override
        public void writeToUARTBuffer(String buffer) {
		Log.v("UART", buffer);
		Toast.makeText(this, buffer, Toast.LENGTH_SHORT).show();
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
                mSurfaceView.post(new Runnable(){
                        public void run(){
				mBackgroundWebView.loadUrl("javascript:writeADCDataRegister("+value+")");
                        }
                });
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
				mScaledBitmap = Bitmap.createScaledBitmap(mBitmap, mScreenWidth, mScreenWidth, false);
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
			});
		mSurfaceView.setOnTouchListener(new OnTouchListener() {
			public boolean onTouch(View v, MotionEvent event) {
				return mGestureDetector.onTouchEvent(event);
			}
		});
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
