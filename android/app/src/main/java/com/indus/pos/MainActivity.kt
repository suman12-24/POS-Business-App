package com.indus.pos

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.ContentResolver
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.os.Bundle
import androidx.core.app.NotificationCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "Indus Curry Express"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState) // Call super early

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationChannel = NotificationChannel(
                "booking_channel",
                "New Booking",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                setShowBadge(true)
                description = "Channel for incoming new order alerts"
                
                val att = AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
                
                setSound(
                    Uri.parse("${ContentResolver.SCHEME_ANDROID_RESOURCE}://${packageName}/raw/orders_up"),
                    att
                )
                
                enableVibration(true)
                enableLights(true)
                vibrationPattern = longArrayOf(400, 400)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
            }

            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(notificationChannel)
        }
    }
}