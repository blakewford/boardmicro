package org.starlo.boardmicro;

import android.os.Bundle;
import android.app.*;
import android.webkit.WebView;
import android.widget.*;
import android.content.Intent;
import android.webkit.WebViewClient;
import android.view.*;
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
import android.widget.AdapterView.*;

import java.io.*;
import com.dropbox.chooser.android.DbxChooser;

public abstract class MainActivity extends Activity implements SurfaceHolder.Callback, BoardMicroInterface{

	public static final String SEND_COMMAND_ACTION = "sendCommand";

	private static final int CYCLE_SIZE = 200000;
	private static final int DBX_CHOOSER_REQUEST = 0;
	private static final String ASSET_URL = "file:///android_asset/avrcore.html";

	private SurfaceHolder mHolder;
	private Bitmap mScaledBitmap;
	private Thread mRefreshThread = null;
	private GestureDetector mGestureDetector = null;

	private boolean mScreenDirty = true;
	private boolean mProgramEnded = false;
	private boolean mDropboxCalled = false;
	private boolean mPaused = false;

 	protected static final int DEBUG_COMMAND_REQUEST = 1;
	protected Bitmap mBitmap;
	protected int mScreenWidth;
	protected int mScreenHeight;
	protected WebView mBackgroundWebView;
	protected boolean mShouldToastResult = false;
	protected SurfaceView mSurfaceView;
	protected long mPostTime = 0;

	private int SCREEN_WIDTH;
	private int SCREEN_HEIGHT;
	private int[] mPixelArray;
	private int mLayout;

	private NativeInterface mRunAVR = null;
	private boolean mIsNative = false;

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
		mRunAVR = new NativeInterface(this);
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
        public void writePort(final int port, final int value) {
		mSurfaceView.post(new Runnable(){
			public void run(){
				mBackgroundWebView.loadUrl("javascript:writePort("+port+","+value+")");
				mBackgroundWebView.loadUrl("javascript:Android.writePort("+port+","+value+")");
			}
		});
	}

	@Override
        public void writeToUARTBuffer(String buffer) {
		Log.v("UART", buffer);
		Toast.makeText(this, buffer, Toast.LENGTH_SHORT).show();
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
	public int getScreenWidth(){
		return SCREEN_WIDTH;
	}

	@Override
	public int getScreenHeight(){
		return SCREEN_HEIGHT;
	}

	@Override
	public void buttonHit(int r, int v){
		if(mIsNative) mRunAVR.buttonHit(r, v);
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

	public abstract void handleButtonPress(View view);
	protected abstract Bitmap getScaledBitmap();
	protected abstract void filterOutUnsupportedPins();
	protected abstract SurfaceView getDisplay();
	protected abstract void startDebugActivity();

	public abstract void writeSPI(final JsonSpiUpdate[] updates);
	protected abstract View findExampleListView(View view);
	protected abstract View getExampleView();
	protected abstract String getExampleDir();
	protected abstract String getMessageString();
	protected abstract String getDropboxString();
	protected abstract String getExampleString();
	protected abstract String getTarget();

	protected void setConfiguration( int layout, int width, int height ){
		mLayout = layout;
		SCREEN_WIDTH = width;
		SCREEN_HEIGHT = height;
		mPixelArray = new int[SCREEN_WIDTH*SCREEN_HEIGHT];
	}

	protected String getUIString(int id){
		return getResources().getString(id);
	}

	protected void refreshScreenLoop(){
		if(mScreenDirty){
			mScreenDirty = false;
			if(mScaledBitmap != null)
				mScaledBitmap.recycle();
			Canvas canvas = mHolder.lockCanvas();
			if(canvas != null){
				canvas.drawColor(Color.BLACK);
				mBitmap.setPixels(mPixelArray, 0, SCREEN_WIDTH, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
				mScaledBitmap = getScaledBitmap();
				canvas.drawBitmap(mScaledBitmap, 0, 0, null);
				mHolder.unlockCanvasAndPost(canvas);
			}
		}
	}

	private void startRefreshThread(){
		endProgram();
		mRefreshThread = new Thread(new Runnable(){
			public void run(){
				while(!mProgramEnded){
					if(mIsNative)
					{
						long startTime = System.nanoTime();
						mProgramEnded = mRunAVR.fetchN(CYCLE_SIZE) == 0;
						long cycleTime = (System.nanoTime()-startTime)/1000000;
						Log.v("CYCLE TIME", new Long(cycleTime).toString());
						try{ Thread.sleep((mPostTime/cycleTime)*cycleTime); }catch(Exception e){}
						mSurfaceView.post(new Runnable(){
							public void run(){
								mBackgroundWebView.loadUrl("javascript:flushPixelBuffer()");
							}
						});
					}
					refreshScreenLoop();
					try{ Thread.yield(); }catch(Exception e){}
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

	private void setupUI(){
		mSurfaceView = getDisplay();
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
					new SourceFragment().show(getFragmentManager(),"");
				}

				@Override
				public boolean onDoubleTap(MotionEvent event){
					startDebugActivity();
					return true;
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
					new SourceFragment().show(getFragmentManager(),"");
				}else if(!DropboxConstants.USE_DROPBOX){
					mIsNative = true;
					new ExampleListFragment().show(getFragmentManager(),"");
				}
			}
		});
	}

	private class SourceFragment extends DialogFragment
	{
		@Override
		public Dialog onCreateDialog(Bundle savedInstanceState){
			AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
			builder.setMessage(getMessageString())
			.setPositiveButton(getDropboxString(), new DialogInterface.OnClickListener() {
				public void onClick(DialogInterface dialog, int id) {
					mIsNative = false;
					new DbxChooser(DropboxConstants.API_KEY).forResultType(DbxChooser.ResultType.DIRECT_LINK).launch(MainActivity.this, DBX_CHOOSER_REQUEST);
				}
			})
			.setNegativeButton(getExampleString(), new DialogInterface.OnClickListener() {
				public void onClick(DialogInterface dialog, int id) {
					mIsNative = true;
					new ExampleListFragment().show(getFragmentManager(),"");
				}
			});
			return builder.create();
		}
	}

	private class ExampleListFragment extends DialogFragment
	{
		private void select(String file){
			try{
				String line = null;
				StringBuilder stringBuilder = new StringBuilder();
				BufferedReader reader = new BufferedReader(new InputStreamReader(MainActivity.this.getAssets().open(getExampleDir()+"/"+file)));
				while((line = reader.readLine()) != null)
				{
					mRunAVR.loadPartialProgram(line);
				}
				mRunAVR.engineInit(getTarget());
				startRefreshThread();
				mSurfaceView.post(new Runnable(){
					public void run(){
						mBackgroundWebView.loadUrl("javascript:initScreen()");
					}
				});
				dismiss();
			}catch(Exception e){}
		}

		@Override
		public Dialog onCreateDialog(Bundle savedInstanceState){
			AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
			View view = getExampleView();
			try{
				final String[] examples = MainActivity.this.getAssets().list(getExampleDir());
				ArrayAdapter<String> adapter = new ArrayAdapter<String>(MainActivity.this,
					android.R.layout.simple_list_item_1, android.R.id.text1, examples);
				final ListView listView = (ListView)findExampleListView(view);
				listView.setAdapter(adapter);
				listView.setOnItemClickListener(new OnItemClickListener() {
					@Override
					public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
						String file = (String)listView.getItemAtPosition(position);
						select(file);
					}
				});
				if(examples.length == 1) select(examples[0]);
			}catch(Exception e)
			{
			}
			return builder.setView(view).create();
		}
	}
}
