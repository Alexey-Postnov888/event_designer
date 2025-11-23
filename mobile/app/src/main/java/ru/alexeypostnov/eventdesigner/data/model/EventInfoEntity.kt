package ru.alexeypostnov.eventdesigner.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = EventInfoEntity.TABLE)
data class EventInfoEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long,
    val title: String,
    val description: String,
    val date: Long,
    val address: String
) {
    companion object {
        const val TABLE = "eventsInfo"
    }
}