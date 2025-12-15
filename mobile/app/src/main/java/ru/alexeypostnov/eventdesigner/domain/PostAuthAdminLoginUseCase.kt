package ru.alexeypostnov.eventdesigner.domain

import ru.alexeypostnov.eventdesigner.data.EventInfoRepository
import ru.alexeypostnov.eventdesigner.data.model.AuthResponse
import javax.inject.Inject

interface PostAuthAdminLoginUseCase {
    suspend operator fun invoke(email: String, password: String): AuthResponse?
}

class PostAuthAdminLoginUseCaseImpl @Inject constructor(
    private val repository: EventInfoRepository
): PostAuthAdminLoginUseCase {
    override suspend fun invoke(email: String, password: String): AuthResponse? =
        repository.postAuthAdminLogin(email, password)
}