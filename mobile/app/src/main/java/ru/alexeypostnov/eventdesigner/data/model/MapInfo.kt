package ru.alexeypostnov.eventdesigner.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class MapInfo(
    @SerialName("map_url")
    val mapUrl: String
)