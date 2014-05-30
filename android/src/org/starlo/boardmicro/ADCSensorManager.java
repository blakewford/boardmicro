package org.starlo.boardmicro;

import android.hardware.*;
import android.content.Context;

public class ADCSensorManager implements SensorEventListener {

	private Sensor mSensor = null;
	private SensorManager mSensorManager = null;
	private int mLastKnownValue = 0;

	public ADCSensorManager(SensorManager manager) {
		mSensorManager = manager;
		if (mSensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) != null){
			mSensor = mSensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
			mSensorManager.registerListener(this, mSensor, SensorManager.SENSOR_DELAY_NORMAL);
		}
	}

	public boolean hasAccelerometer(){
		return mSensor != null;
	}

	public int getValue(){
		return mLastKnownValue;
	}

	public float getSensorRange(){
		if(mSensor != null)
			return mSensor.getMaximumRange();
		else
			return 0;
	}

	@Override
	public final void onAccuracyChanged(Sensor sensor, int accuracy) {
	}

	@Override
	public final void onSensorChanged(SensorEvent event) {
		int positiveRange = Math.round(SensorManager.GRAVITY_EARTH);
		mLastKnownValue =
			map((int)Math.round(event.values[0]), -positiveRange, positiveRange, 0, 1023);
	}

        private int map(int x, int in_min, int in_max, int out_min, int out_max)
        {
            return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
        }
}
