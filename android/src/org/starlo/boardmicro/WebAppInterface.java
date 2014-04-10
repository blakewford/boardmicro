package org.starlo.boardmicro;

import android.webkit.JavascriptInterface;
import android.widget.Toast;
import android.content.Context;
import java.util.LinkedList;
import android.util.Log;

public class WebAppInterface {

	private Context mContext;
	private LimitedQueue<String> mUARTBuffer = new LimitedQueue<String>(32);
	private static final String TAG = "UART Buffer";

	WebAppInterface(Context c) {
		mContext = c;
	}

	@JavascriptInterface
	public void writeUARTBuffer(String value) {
                mUARTBuffer.add(new Character((char)Integer.parseInt(value)).toString());
		Log.v(TAG, mUARTBuffer.toString());
		Toast.makeText(mContext, mUARTBuffer.toString(), Toast.LENGTH_SHORT).show();
	}

	private class LimitedQueue<E> extends LinkedList<E> {
		private final int mLimit;

		public LimitedQueue(int limit) { mLimit = limit;}

		@Override
		public boolean add(E o) {
			super.add(o);
			while (size() > mLimit) { super.remove(); }
			return true;
		}
	}
}
