package org.starlo.boardmicro;

import android.webkit.JavascriptInterface;
import android.widget.Toast;
import android.content.Context;
public class WebAppInterface {

	private Context mContext;

	WebAppInterface(Context c) {
		mContext = c;
	}

	@JavascriptInterface
	public void showToast(String toast) {
		Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show();
	}
}
