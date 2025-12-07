package ru.alexeypostnov.eventdesigner.presenter

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import ru.alexeypostnov.eventdesigner.data.model.EventInfo
import ru.alexeypostnov.eventdesigner.data.model.MapInfo
import ru.alexeypostnov.eventdesigner.domain.GetEventInfoByIdUseCase
import ru.alexeypostnov.eventdesigner.domain.GetEventMapByEventIdUseCase
import java.util.UUID
import javax.inject.Inject

class EventInfoViewModel @Inject constructor(
//    private val createEventInfoUseCase: CreateEventInfoUseCase,
//    private val getAllEventsInfoUseCase: GetAllEventsInfoUseCase,
    private val getEventInfoByIdUseCase: GetEventInfoByIdUseCase,
    private val getEventMapByEventIdUseCase: GetEventMapByEventIdUseCase
): ViewModel() {
    /*private val _eventsInfo = MutableLiveData<List<EventInfoEntity>>()
    val eventsInfo: LiveData<List<EventInfoEntity>> get() = _eventsInfo*/

    private val _event = MutableLiveData<EventInfo>()
    val event: LiveData<EventInfo> get() = _event

    private val _eventMap = MutableLiveData<MapInfo>()
    val eventMap: LiveData<MapInfo> get() = _eventMap

    fun loadEventInfo(eventId: UUID) {
        viewModelScope.launch {
            val eventInfo = getEventInfoByIdUseCase(eventId)
            _event.postValue(
                eventInfo ?: error("eventInfo is null")
            )
        }
    }
    fun loadEventMap(eventId: UUID) {
        viewModelScope.launch() {
            val eventMap = getEventMapByEventIdUseCase(eventId)
            _eventMap.postValue(
                eventMap ?: error("eventMap is null")
            )
        }
    }
}