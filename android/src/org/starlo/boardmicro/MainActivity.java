package org.starlo.boardmicro;

import org.starlo.boardmicro.R;

import android.os.Bundle;
import android.app.Activity;
import android.webkit.WebView;
import android.widget.Toast;
import android.content.Intent;
import android.webkit.WebViewClient;
import com.dropbox.chooser.android.DbxChooser;

import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.Bitmap.Config;
import android.graphics.Canvas;
import android.util.TypedValue;
import android.view.MotionEvent;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.util.Log;

public class MainActivity extends Activity implements SurfaceHolder.Callback {

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

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.display_layout);
		SurfaceView surfaceView = (SurfaceView)findViewById(R.id.display);
		Resources r = surfaceView.getResources();
		mHolder = surfaceView.getHolder();
		mHolder.addCallback(this);
		mBitmap = Bitmap.createBitmap(SCREEN_WIDTH, SCREEN_HEIGHT, Config.ARGB_8888);
		mScreenWidth =
			Float.valueOf(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, r.getConfiguration().screenWidthDp, r.getDisplayMetrics())).intValue();		setContentView(R.layout.display_layout);
		mScreenHeight =
			Float.valueOf(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, r.getConfiguration().screenHeightDp, r.getDisplayMetrics())).intValue();
		mBackgroundWebView = new WebView(this);
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

	private void wipeScreen(){
		if(mScaledBitmap != null)
			mScaledBitmap.recycle();
		Canvas canvas = mHolder.lockCanvas();
		if(canvas != null){
			int[] colors = new int[SCREEN_WIDTH*SCREEN_HEIGHT];
			for(int i = 0; i < colors.length; i++)
				colors[i] = Color.BLUE;
			canvas.drawColor(Color.BLACK);
			mBitmap.setPixels(colors, 0, SCREEN_WIDTH, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
			mScaledBitmap = Bitmap.createScaledBitmap(mBitmap, mScreenWidth, mScreenWidth, false);
			canvas.drawBitmap(mScaledBitmap, 0, 0, null);
			mHolder.unlockCanvasAndPost(canvas);
		}
	}
}
