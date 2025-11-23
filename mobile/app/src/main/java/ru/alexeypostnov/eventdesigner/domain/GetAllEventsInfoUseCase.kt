package ru.alexeypostnov.eventdesigner.domain

import kotlinx.coroutines.flow.Flow
import ru.alexeypostnov.eventdesigner.data.EventInfoRepository
import ru.alexeypostnov.eventdesigner.data.model.EventInfoEntity
import javax.inject.Inject

interface GetAllEventsInfoUseCase {
    operator fun invoke(): Flow<List<EventInfoEntity>>
}

class GetAllEventsInfoUseCaseImpl @Inject constructor(
    private val repository: EventInfoRepository
): GetAllEventsInfoUseCase {
    override fun invoke(): Flow<List<EventInfoEntity>> =
        repository.getAllEventsInfo()
}