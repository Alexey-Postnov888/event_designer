package ru.alexeypostnov.eventdesigner.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Event(
    val address: StringAttribute,
    val description: StringAttribute,
    @SerialName("ends_at")
    val endsAt: TimeAttribute,
    val id: String,
    val name: String,
    @SerialName("starts_at")
    val startsAt: TimeAttribute
)
