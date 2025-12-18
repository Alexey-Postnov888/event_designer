package ru.alexeypostnov.eventdesigner.domain

import ru.alexeypostnov.eventdesigner.data.EventInfoRepository
import ru.alexeypostnov.eventdesigner.data.model.PointInfo
import java.util.UUID
import javax.inject.Inject

interface GetEventPointsInfoUseCase {
    suspend operator fun invoke(eventId: UUID): List<PointInfo>?
}

class GetEventPointsInfoUseCaseImpl @Inject constructor(
    private val repository: EventInfoRepository
): GetEventPointsInfoUseCase {
    override suspend fun invoke(eventId: UUID): List<PointInfo>? =
            repository.getEventsPointInfoByEventId(eventId)
}