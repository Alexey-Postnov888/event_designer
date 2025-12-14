package ru.alexeypostnov.eventdesigner.data

import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path
import ru.alexeypostnov.eventdesigner.data.model.EventInfo
import ru.alexeypostnov.eventdesigner.data.model.MapInfo
import ru.alexeypostnov.eventdesigner.data.model.PointInfo

interface EventInfoService {
    @GET("events/{eventId}")
    suspend fun getEventInfoById(
        @Path("eventId") eventId: String
    ): Response<EventInfo>

    @GET("events/{eventId}/map")
    suspend fun getEventMapByEventId(
        @Path("eventId") eventId: String
    ): Response<MapInfo>

    @GET("events/{eventId}/points")
    suspend fun getEventPointsByEventId(
        @Path("eventId") eventId: String
    ): Response<List<PointInfo>>
}