package ru.alexeypostnov.eventdesigner.domain

import ru.alexeypostnov.eventdesigner.data.EventInfoRepository
import ru.alexeypostnov.eventdesigner.data.model.EventInfoEntity
import javax.inject.Inject

interface CreateEventInfoUseCase {
    suspend operator fun invoke(eventInfo: EventInfoEntity)
}

class CreateEventInfoUseCaseImpl @Inject constructor(
    private val repository: EventInfoRepository
): CreateEventInfoUseCase {
    override suspend operator fun invoke(eventInfo: EventInfoEntity) {
        repository.createEventInfo(eventInfo)
    }
}