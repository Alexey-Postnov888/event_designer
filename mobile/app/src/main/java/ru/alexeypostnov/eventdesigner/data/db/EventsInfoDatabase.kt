package ru.alexeypostnov.eventdesigner.data.db

import androidx.room.Database
import androidx.room.RoomDatabase
import ru.alexeypostnov.eventdesigner.data.model.EventInfoEntity


@Database(
    entities = [
        EventInfoEntity::class
    ],
    version = 1
)
abstract class EventsInfoDatabase: RoomDatabase() {
    abstract val eventsInfoDao: EventsInfoDAO
}