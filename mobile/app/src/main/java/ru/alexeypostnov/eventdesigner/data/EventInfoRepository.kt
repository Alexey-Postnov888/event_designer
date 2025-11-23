package ru.alexeypostnov.eventdesigner.data

import kotlinx.coroutines.flow.Flow
import ru.alexeypostnov.eventdesigner.data.db.EventsInfoDAO
import ru.alexeypostnov.eventdesigner.data.model.EventInfoEntity
import javax.inject.Inject

interface EventInfoRepository {
    fun getAllEventsInfo(): Flow<List<EventInfoEntity>>
    suspend fun getEventInfoById(eventId: Long): Flow<EventInfoEntity>?
    suspend fun createEventInfo(eventInfoEntity: EventInfoEntity)
}

class EventInfoRepositoryImpl @Inject constructor(
    private val eventsInfoDAO: EventsInfoDAO
): EventInfoRepository {
    override fun getAllEventsInfo(): Flow<List<EventInfoEntity>> =
        eventsInfoDAO.getAllEventsInfo()

    override suspend fun getEventInfoById(eventId: Long): Flow<EventInfoEntity>? =
        eventsInfoDAO.getEventInfoById(eventId)

    override suspend fun createEventInfo(eventInfoEntity: EventInfoEntity) {
        eventsInfoDAO.upsertEventInfo(
            eventInfoEntity
        )
    }
}