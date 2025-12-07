package ru.alexeypostnov.eventdesigner.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import java.time.Instant

@Serializable
data class EventInfo(
    val id: String,
    val name: String,
    val description: StringAttribute,
    val address: StringAttribute,
    @SerialName("starts_at")
    val startsAt: TimeAttribute,
    @SerialName("ends_at")
    val endsAt: TimeAttribute,
    @SerialName("creator_email")
    val creatorEmail: String
)

@Serializable
data class StringAttribute(
    @SerialName("String")
    val string: String,
    @SerialName("Valid")
    val valid: Boolean
)

@Serializable
data class TimeAttribute(
    @SerialName("Time")
    val time: String,
    @SerialName("Valid")
    val valid: Boolean
) {
    val instant: Instant
        get() = Instant.parse(time)
}
