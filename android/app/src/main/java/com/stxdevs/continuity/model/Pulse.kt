package com.stxdevs.continuity.model

import com.google.firebase.Timestamp

data class Pulse(
    val id: String = "",
    val mood: String = "", // "Low", "Neutral", "High"
    val note: String = "",
    val timestamp: Timestamp = Timestamp.now()
)
