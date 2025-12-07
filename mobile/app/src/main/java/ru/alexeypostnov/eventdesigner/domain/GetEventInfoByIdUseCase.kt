package ru.alexeypostnov.eventdesigner.domain

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import ru.alexeypostnov.eventdesigner.data.EventInfoRepository
import ru.alexeypostnov.eventdesigner.data.model.EventInfoEntity
import javax.inject.Inject

interface GetEventInfoByIdUseCase {
    suspend operator fun invoke(eventId: Long): Flow<EventInfoEntity?>
}

class GetEventInfoByIdUseCaseImpl @Inject constructor(
    private val repository: EventInfoRepository
): GetEventInfoByIdUseCase {
    override suspend fun invoke(eventId: Long): Flow<EventInfoEntity?> =
        repository.getEventInfoById(eventId)
}