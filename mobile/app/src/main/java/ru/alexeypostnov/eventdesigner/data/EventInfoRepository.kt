package ru.alexeypostnov.eventdesigner.data

import kotlinx.coroutines.flow.Flow
import ru.alexeypostnov.eventdesigner.data.db.EventsInfoDAO
import ru.alexeypostnov.eventdesigner.data.model.AuthRequest
import ru.alexeypostnov.eventdesigner.data.model.AuthResponse
import ru.alexeypostnov.eventdesigner.data.model.Event
import ru.alexeypostnov.eventdesigner.data.model.EventInfo
import ru.alexeypostnov.eventdesigner.data.model.EventInfoEntity
import ru.alexeypostnov.eventdesigner.data.model.MapInfo
import ru.alexeypostnov.eventdesigner.data.model.PointInfo
import java.util.UUID
import javax.inject.Inject

interface EventInfoRepository {
    fun getAllEventsInfo(): Flow<List<EventInfoEntity>>
    suspend fun getEventInfoById(eventId: UUID): EventInfo?
    suspend fun createEventInfo(eventInfoEntity: EventInfoEntity)
    suspend fun getEventMapByEventId(eventId: UUID): MapInfo?
    suspend fun getEventsPointInfoByEventId(eventId: UUID): List<PointInfo>?
    suspend fun postAuthAdminLogin(email: String, password: String): AuthResponse?
    suspend fun getMyEvents(): List<Event>?
}

class EventInfoRepositoryImpl @Inject constructor(
    private val eventsInfoDAO: EventsInfoDAO,
    private val service: EventInfoService
): EventInfoRepository {
    override fun getAllEventsInfo(): Flow<List<EventInfoEntity>> =
        eventsInfoDAO.getAllEventsInfo()


    override suspend fun getEventInfoById(eventId: UUID): EventInfo? {
        val response = service.getEventInfoById(eventId.toString())
        return if (response.isSuccessful) response.body() else null
    }


    override suspend fun createEventInfo(eventInfoEntity: EventInfoEntity) {
        eventsInfoDAO.upsertEventInfo(
            eventInfoEntity
        )
    }

    override suspend fun getEventMapByEventId(eventId: UUID): MapInfo? {
        val response = service.getEventMapByEventId(eventId.toString())
        return if (response.isSuccessful) response.body() else null
    }

    override suspend fun getEventsPointInfoByEventId(eventId: UUID): List<PointInfo>? {
        val response = service.getEventPointsByEventId(eventId.toString())
        return if (response.isSuccessful) response.body() else null
    }

    override suspend fun postAuthAdminLogin(email: String, password: String): AuthResponse? {
        val authRequest = AuthRequest(
            email,
            password
        )

        val response = service.postAuthAdminLogin(authRequest)

        return if (response.isSuccessful) response.body() else null
    }

    override suspend fun getMyEvents(): List<Event>? {
        val response = service.getMyEvents()
        return if (response.isSuccessful) response.body() else null
    }
}