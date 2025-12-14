package ru.alexeypostnov.eventdesigner.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import java.time.Instant

@Serializable
data class PointInfo(
    @SerialName("end_at")
    val endAt: TimeAttribute,
    @SerialName("event_id")
    val eventId: String,
    val id: String,
    @SerialName("start_at")
    val startAt: TimeAttribute,
    @SerialName("timeline_description")
    val timelineDescription: StringAttribute,
    val title: String,
    val x: Int,
    val y: Int
)