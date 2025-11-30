package ru.alexeypostnov.eventdesigner.domain

import ru.alexeypostnov.eventdesigner.data.EventInfoRepository
import javax.inject.Inject

interface PostAuthUseCase {
}

class PostAuthUseCaseImpl @Inject constructor(
    private val repository: EventInfoRepository
): PostAuthUseCase {
    // реализация метода интерфейса
}