package org.starlo.boardmicro;

import org.apache.http.*;
import org.apache.http.client.HttpClient;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.client.methods.HttpGet;
import java.io.ByteArrayOutputStream;
import android.os.AsyncTask;

public class DropboxTask extends AsyncTask<Void, Void, String> {
	private String mURL;
	private BoardMicroInterface mBoardMicro;

	public DropboxTask(String url, BoardMicroInterface boardMicro) {
		mURL = url;
		mBoardMicro = boardMicro;
	}

	protected String doInBackground(Void... param) {
		try{
			HttpResponse response = new DefaultHttpClient().execute(new HttpGet(mURL));
			if(response.getStatusLine().getStatusCode() == HttpStatus.SC_OK){
				ByteArrayOutputStream stream = new ByteArrayOutputStream();
				response.getEntity().writeTo(stream);
				stream.close();
				return stream.toString();
			} else{
				response.getEntity().getContent().close();
			}
		} catch (Exception e) {}
		return "";
	}

	protected void onPostExecute(String result) {
		mBoardMicro.startProcess("javascript:loadMemory('"+result.replace("\r\n", "|")+"', true)");
	}
}
