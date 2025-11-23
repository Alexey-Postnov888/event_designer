package ru.alexeypostnov.eventdesigner.domain

import ru.alexeypostnov.eventdesigner.data.Repository
import javax.inject.Inject

interface PostAuthUseCase {
}

class PostAuthUseCaseImpl @Inject constructor(
    private val repository: Repository
): PostAuthUseCase {
    // реализация метода интерфейса
}