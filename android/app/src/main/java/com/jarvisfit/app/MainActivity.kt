package com.jarvisfit.app

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : Activity() {
    private lateinit var status: TextView
    private val requestCode = 1301

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val layout = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(36, 48, 36, 24) }
        status = TextView(this).apply { text = "GPS parado. Autorize localização precisa para iniciar."; textSize = 18f }
        val start = Button(this).apply { text = "Iniciar corrida"; setOnClickListener { startTracking() } }
        val stop = Button(this).apply { text = "Finalizar corrida"; setOnClickListener {
            startService(Intent(this@MainActivity, TrackingService::class.java).setAction(TrackingService.ACTION_STOP))
            status.text = "Corrida finalizada."
        } }
        layout.addView(status); layout.addView(start); layout.addView(stop)
        setContentView(layout)
    }

    private fun startTracking() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION), requestCode)
            return
        }
        ContextCompat.startForegroundService(this, Intent(this, TrackingService::class.java).setAction(TrackingService.ACTION_START))
        status.text = "Solicitação enviada ao serviço GPS. Verifique a notificação persistente."
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.POST_NOTIFICATIONS), requestCode + 1)
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == this.requestCode) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) startTracking()
            else status.text = "Localização precisa não autorizada. GPS não iniciado."
        }
    }
}
