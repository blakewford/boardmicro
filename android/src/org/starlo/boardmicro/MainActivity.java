package org.starlo.boardmicro;

import org.starlo.boardmicro.R;

import android.os.Bundle;
import android.app.Activity;
import android.webkit.WebView;
import android.widget.Toast;
import android.content.Intent;
import android.webkit.WebViewClient;
import com.dropbox.chooser.android.DbxChooser;

public class MainActivity extends Activity {

	static final int DBX_CHOOSER_REQUEST = 0;
	private WebView mBackgroundWebView;
	private boolean mDropboxCalled = false;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.display_layout);
		mBackgroundWebView = new WebView(this);
		mBackgroundWebView.getSettings().setJavaScriptEnabled(true);
		mBackgroundWebView.loadUrl("file:///android_asset/index.html");
		mBackgroundWebView.addJavascriptInterface(new WebAppInterface(this), "Android");
                mBackgroundWebView.getSettings().setUserAgentString(mBackgroundWebView.getSettings().getUserAgentString()+" NativeApp");
		mBackgroundWebView.setWebViewClient(new WebViewClient() {
			public void onPageFinished(WebView view, String loc) {
				if(!mDropboxCalled){
					mDropboxCalled = true;
					new DbxChooser("").forResultType(DbxChooser.ResultType.FILE_CONTENT).launch(MainActivity.this, DBX_CHOOSER_REQUEST);
				}
			}
		});
	}

	@Override
	public void onActivityResult(int requestCode, int resultCode, Intent data) {
		if (requestCode == DBX_CHOOSER_REQUEST) {
			if (resultCode == Activity.RESULT_OK) {
				mBackgroundWebView.loadUrl("javascript:loadDefault()");
				mBackgroundWebView.loadUrl("javascript:engineInit()");
				mBackgroundWebView.loadUrl("javascript:exec()");
				DbxChooser.Result result = new DbxChooser.Result(data);
				Toast.makeText(this, result.getLink().toString(), Toast.LENGTH_SHORT).show();
			}
		} else {
			super.onActivityResult(requestCode, resultCode, data);
		}
	}
}
