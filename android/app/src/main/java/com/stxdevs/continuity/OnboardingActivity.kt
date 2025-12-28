package com.stxdevs.continuity

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.auth.FirebaseAuth

class OnboardingActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_onboarding)

        // specific check: if already logged in, skip to Dashboard
        if (FirebaseAuth.getInstance().currentUser != null) {
            startActivity(Intent(this, DashboardActivity::class.java))
            finish()
            return
        }

        val btnGetStarted = findViewById<Button>(R.id.btnGetStarted)
        val tvSkip = findViewById<TextView>(R.id.tvSkip)

        btnGetStarted.setOnClickListener {
            // Navigate to Login
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }

        tvSkip.setOnClickListener {
            // Navigate to Login
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }
}
