package ru.alexeypostnov.eventdesigner.data

import javax.inject.Inject

interface Repository {
}

class RepositoryImpl @Inject constructor(
    private val service: Service,
): Repository {
    // реализация методов из интерфейса
}