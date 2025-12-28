package com.stxdevs.continuity.model

import com.google.firebase.Timestamp

data class Task(
    var id: String = "",
    val title: String = "",
    val isCompleted: Boolean = false,
    val timestamp: Timestamp = Timestamp.now()
)
