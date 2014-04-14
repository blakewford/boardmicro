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

public class MainActivity extends Activity implements SurfaceHolder.Callback, BoardMicroInterface{

	static final int DBX_CHOOSER_REQUEST = 0;
	private WebView mBackgroundWebView;
	private boolean mDropboxCalled = false;

	private static final int SCREEN_WIDTH = 160;
	private static final int SCREEN_HEIGHT = 128;
	private SurfaceHolder mHolder;
	private Bitmap mBitmap;
	private Bitmap mScaledBitmap;
	private int mScreenWidth;
	private int mScreenHeight;
	private	int[] mPixelArray = new int[SCREEN_WIDTH*SCREEN_HEIGHT];
	private boolean mScreenDirty = true;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.display_layout);
		SurfaceView surfaceView = (SurfaceView)findViewById(R.id.display);
		mHolder = surfaceView.getHolder();
		mHolder.addCallback(this);
		mBitmap = Bitmap.createBitmap(SCREEN_WIDTH, SCREEN_HEIGHT, Config.ARGB_8888);
		Resources r = surfaceView.getResources();
		mScreenWidth =
			Float.valueOf(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, r.getConfiguration().screenWidthDp, r.getDisplayMetrics())).intValue();
		mScreenHeight =
			Float.valueOf(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, r.getConfiguration().screenHeightDp, r.getDisplayMetrics())).intValue();
		mBackgroundWebView = new WebView(this);
		new Thread(new Runnable(){
			public void run(){
				while(true){
					refreshScreenLoop();
					try{
						Thread.yield();
					}catch(Exception e){}
				}
			}
		}).start();
		mBackgroundWebView.getSettings().setJavaScriptEnabled(true);
		mBackgroundWebView.loadUrl("file:///android_asset/example.html");
		mBackgroundWebView.addJavascriptInterface(new WebAppInterface(this), "Android");
		mBackgroundWebView.getSettings().setUserAgentString(mBackgroundWebView.getSettings().getUserAgentString()+" NativeApp");
		mBackgroundWebView.setWebViewClient(new WebViewClient() {
			public void onPageFinished(WebView view, String loc) {
				if(DropboxConstants.USE_DROPBOX && !mDropboxCalled){
					mDropboxCalled = true;
					new DbxChooser(DropboxConstants.API_KEY).forResultType(DbxChooser.ResultType.FILE_CONTENT).launch(MainActivity.this, DBX_CHOOSER_REQUEST);
				}else{
					mBackgroundWebView.loadUrl("javascript:loadDefault()");
					mBackgroundWebView.loadUrl("javascript:engineInit()");
					mBackgroundWebView.loadUrl("javascript:exec()");
				}
			}
		});
	}

	@Override
	public void onActivityResult(int requestCode, int resultCode, Intent data) {
		if (requestCode == DBX_CHOOSER_REQUEST) {
			if (resultCode == Activity.RESULT_OK) {
				DbxChooser.Result result = new DbxChooser.Result(data);
				Toast.makeText(this, result.getLink().toString(), Toast.LENGTH_SHORT).show();
				mBackgroundWebView.loadUrl("javascript:engineInit()");
				mBackgroundWebView.loadUrl("javascript:exec()");
			}
		} else {
			super.onActivityResult(requestCode, resultCode, data);
		}
	}

	@Override
	public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {}

	@Override
	public void surfaceCreated(SurfaceHolder holder) {
		wipeScreen();
	}

	@Override
	public void surfaceDestroyed(SurfaceHolder holder) {}

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

	private void wipeScreen(){
		wipeScreen(Color.WHITE);
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
		mBackgroundWebView.post(new Runnable(){
			public void run(){
				refreshScreenLoop();
			}
		});
	}
}
