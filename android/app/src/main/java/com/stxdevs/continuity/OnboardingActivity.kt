package com.stxdevs.continuity

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.ViewGroup.LayoutParams.WRAP_CONTENT
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.viewpager2.widget.ViewPager2

class OnboardingActivity : AppCompatActivity() {

    private lateinit var onboardAdapter: OnboardingAdapter
    private lateinit var indicatorLayout: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // potential check for shared prefs
        if (getSharedPreferences("AppPrefs", Context.MODE_PRIVATE).getBoolean("OnboardingComplete", false)) {
            // Check auth then redirect
            // For now, let's just let it flow since AuthActivity handles auth check
        }

        setContentView(R.layout.activity_onboarding)

        val btnNext = findViewById<Button>(R.id.btnNext)
        val tvSkip = findViewById<TextView>(R.id.tvSkip)
        val viewPager = findViewById<ViewPager2>(R.id.viewPager)
        indicatorLayout = findViewById(R.id.indicatorLayout)

        val items = listOf(
            OnboardingItem(
                R.drawable.onboarding_focus,
                "Find Your Flow",
                "Deep work sessions designed to keep you in the zone."
            ),
            OnboardingItem(
                R.drawable.onboarding_mood,
                "Track Your Pulse",
                "Monitor your energy and mood to optimize your productivity."
            ),
            OnboardingItem(
                R.drawable.onboarding_vision,
                "Expand Your Horizon",
                "Visualize your goals and keep your north star in sight."
            )
        )

        onboardAdapter = OnboardingAdapter(items)
        viewPager.adapter = onboardAdapter

        setupIndicators(items.size)
        setCurrentIndicator(0)

        viewPager.registerOnPageChangeCallback(object : ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                super.onPageSelected(position)
                setCurrentIndicator(position)
                if (position == items.size - 1) {
                    btnNext.text = "Get Started"
                } else {
                    btnNext.text = "Next"
                }
            }
        })

        btnNext.setOnClickListener {
            if (viewPager.currentItem + 1 < onboardAdapter.itemCount) {
                viewPager.currentItem += 1
            } else {
                completeOnboarding()
            }
        }
        
        tvSkip.setOnClickListener {
            completeOnboarding()
        }
    }

    private fun setupIndicators(count: Int) {
        val indicators = arrayOfNulls<ImageView>(count)
        val layoutParams = LinearLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT)
        layoutParams.setMargins(8, 0, 8, 0)
        for (i in indicators.indices) {
            indicators[i] = ImageView(applicationContext)
            indicators[i].apply {
                this.setImageDrawable(
                    ContextCompat.getDrawable(
                        applicationContext,
                        R.drawable.indicator_inactive
                    )
                )
                this.layoutParams = layoutParams
            }
            indicatorLayout.addView(indicators[i])
        }
    }

    private fun setCurrentIndicator(index: Int) {
        val childCount = indicatorLayout.childCount
        for (i in 0 until childCount) {
            val imageView = indicatorLayout.getChildAt(i) as ImageView
            if (i == index) {
                imageView.setImageDrawable(
                    ContextCompat.getDrawable(applicationContext, R.drawable.indicator_active)
                )
            } else {
                imageView.setImageDrawable(
                    ContextCompat.getDrawable(applicationContext, R.drawable.indicator_inactive)
                )
            }
        }
    }

    private fun completeOnboarding() {
        getSharedPreferences("AppPrefs", Context.MODE_PRIVATE).edit()
            .putBoolean("OnboardingComplete", true).apply()
        startActivity(Intent(this, LoginActivity::class.java))
        finish()
    }
}
