package com.stxdevs.continuity.model

import com.google.firebase.Timestamp

data class Goal(
    var id: String = "",
    val title: String = "",
    val subtitle: String = "",
    val imageRes: String = "", // placeholder for resource name or url
    val timestamp: Timestamp = Timestamp.now()
)
