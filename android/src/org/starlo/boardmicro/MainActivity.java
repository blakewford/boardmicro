package org.starlo.boardmicro;

import org.starlo.boardmicro.R;

import android.os.Bundle;
import android.app.Activity;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {

	private WebView mBackgroundWebView;

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
				view.loadUrl("javascript:loadDefault()");
				view.loadUrl("javascript:engineInit()");
				view.loadUrl("javascript:exec()");
			}
		});
	}
}
