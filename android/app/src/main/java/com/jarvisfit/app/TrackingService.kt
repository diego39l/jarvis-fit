package com.jarvisfit.app

import android.Manifest
import android.app.*
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.IBinder
import android.os.SystemClock
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream

/**
 * Android foreground location service. Must be started by a visible Activity after
 * runtime location permission is granted; do not start from the background.
 * Prototype: native UI, lifecycle and APK wiring are still required.
 */
class TrackingService : Service(), LocationListener {
    companion object {
        const val ACTION_START = "com.jarvisfit.app.START"
        const val ACTION_STOP = "com.jarvisfit.app.STOP"
        private const val CHANNEL = "jarvis_fit_tracking"
        private const val NOTIFICATION_ID = 101
    }

    private lateinit var manager: LocationManager
    private var last: Location? = null
    private var lastElapsedNs: Long = 0L
    private var meters = 0.0
    private var started = false

    override fun onCreate() {
        super.onCreate()
        manager = getSystemService(LOCATION_SERVICE) as LocationManager
        val channel = NotificationChannel(CHANNEL, "Corrida em andamento", NotificationManager.IMPORTANCE_LOW)
        getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopSelf()
            return START_NOT_STICKY
        }
        if (intent?.action != ACTION_START) return START_NOT_STICKY
        if (started) return START_STICKY
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            stopSelf()
            return START_NOT_STICKY
        }
        val notification = NotificationCompat.Builder(this, CHANNEL)
            .setContentTitle("Jarvis Fit")
            .setContentText("Registrando sua corrida com GPS")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .build()
        if (Build.VERSION.SDK_INT >= 29) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION)
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
        try {
            manager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000L, 1f, this)
            started = true
        } catch (e: SecurityException) {
            stopSelf()
            return START_NOT_STICKY
        } catch (e: IllegalArgumentException) {
            stopSelf()
            return START_NOT_STICKY
        }
        return START_STICKY
    }

    override fun onLocationChanged(location: Location) {
        if (!started || !location.hasAccuracy() || location.accuracy > 35f) return
        val elapsed = location.elapsedRealtimeNanos
        if (elapsed <= lastElapsedNs) return
        val previous = last
        if (previous != null) {
            val dt = (elapsed - lastElapsedNs) / 1e9
            val step = previous.distanceTo(location).toDouble()
            if (dt <= 0 || step / dt > 8.0) return
            meters += step
        }
        last = location
        lastElapsedNs = elapsed
        val record = JSONObject()
            .put("timestampMs", location.time)
            .put("elapsedRealtimeNanos", elapsed)
            .put("latitude", location.latitude)
            .put("longitude", location.longitude)
            .put("accuracyMeters", location.accuracy.toDouble())
            .put("distanceMeters", meters)
        // Private app storage; append each accepted fix to survive process interruption.
        FileOutputStream(File(filesDir, "route-points.jsonl"), true).use {
            it.write((record.toString() + "\n").toByteArray(Charsets.UTF_8))
            it.fd.sync()
        }
    }

    override fun onDestroy() {
        if (::manager.isInitialized) manager.removeUpdates(this)
        started = false
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
