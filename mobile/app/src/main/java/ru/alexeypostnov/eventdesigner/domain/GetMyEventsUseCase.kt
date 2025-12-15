package ru.alexeypostnov.eventdesigner.domain

import ru.alexeypostnov.eventdesigner.data.EventInfoRepository
import ru.alexeypostnov.eventdesigner.data.model.Event
import javax.inject.Inject

interface GetMyEventsUseCase {
    suspend operator fun invoke(): List<Event>?
}

class GetMyEventsUseCaseImpl @Inject constructor(
    private val repository: EventInfoRepository
): GetMyEventsUseCase {
    override suspend fun invoke(): List<Event>? =
        repository.getMyEvents()
}