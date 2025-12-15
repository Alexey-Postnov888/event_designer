package ru.alexeypostnov.eventdesigner.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AuthResponse(
    val user: UserInfo,
    val token: String,
    val message: String
)

@Serializable
data class UserInfo(
    val id: Int,
    val name: String,
    val email: String,
    @SerialName("type_of_activity")
    val typeOfActivity: String,
    val role: String
)
