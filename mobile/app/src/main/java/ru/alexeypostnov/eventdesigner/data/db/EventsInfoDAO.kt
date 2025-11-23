package ru.alexeypostnov.eventdesigner.data.db

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Upsert
import kotlinx.coroutines.flow.Flow
import ru.alexeypostnov.eventdesigner.data.model.EventInfoEntity

@Dao
interface EventsInfoDAO {
    @Upsert
    suspend fun upsertEventInfo(eventInfo: EventInfoEntity)

    @Query("SELECT * FROM ${EventInfoEntity.TABLE} ORDER BY date ASC")
    fun getAllEventsInfo(): Flow<List<EventInfoEntity>>

    @Query("SELECT * FROM ${EventInfoEntity.TABLE} WHERE id = :eventId")
    fun getEventInfoById(eventId: Long): Flow<EventInfoEntity>?
}