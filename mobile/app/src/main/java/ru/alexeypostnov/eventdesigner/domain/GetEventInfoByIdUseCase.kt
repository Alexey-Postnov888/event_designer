package ru.alexeypostnov.eventdesigner.domain

import ru.alexeypostnov.eventdesigner.data.EventInfoRepository
import ru.alexeypostnov.eventdesigner.data.model.EventInfo
import java.util.UUID
import javax.inject.Inject

interface GetEventInfoByIdUseCase {
    suspend operator fun invoke(eventId: UUID): EventInfo?
}

class GetEventInfoByIdUseCaseImpl @Inject constructor(
    private val repository: EventInfoRepository
): GetEventInfoByIdUseCase {
    override suspend fun invoke(eventId: UUID): EventInfo? =
        repository.getEventInfoById(eventId)
}