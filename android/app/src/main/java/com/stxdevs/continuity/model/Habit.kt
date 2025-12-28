package com.stxdevs.continuity.model

import com.google.firebase.Timestamp

data class Habit(
    var id: String = "",
    val title: String = "",
    val fireCount: Int = 0,
    val isCompleted: Boolean = false,
    val timestamp: Timestamp = Timestamp.now()
)
