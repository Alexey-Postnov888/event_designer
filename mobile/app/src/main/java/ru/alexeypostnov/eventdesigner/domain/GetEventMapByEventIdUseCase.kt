package ru.alexeypostnov.eventdesigner.domain

import ru.alexeypostnov.eventdesigner.data.EventInfoRepository
import ru.alexeypostnov.eventdesigner.data.model.EventInfo
import ru.alexeypostnov.eventdesigner.data.model.MapInfo
import java.util.UUID
import javax.inject.Inject

interface GetEventMapByEventIdUseCase {
    suspend operator fun invoke(eventId: UUID): MapInfo?
}

class GetEventMapByEventIdUseCaseImpl @Inject constructor(
    private val repository: EventInfoRepository
): GetEventMapByEventIdUseCase {
    override suspend fun invoke(eventId: UUID): MapInfo? =
        repository.getEventMapByEventId(eventId)
}