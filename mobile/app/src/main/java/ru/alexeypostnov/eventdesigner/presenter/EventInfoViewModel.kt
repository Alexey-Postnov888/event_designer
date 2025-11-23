package ru.alexeypostnov.eventdesigner.presenter

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import ru.alexeypostnov.eventdesigner.data.model.EventInfoEntity
import ru.alexeypostnov.eventdesigner.domain.CreateEventInfoUseCase
import ru.alexeypostnov.eventdesigner.domain.GetEventInfoByIdUseCase
import javax.inject.Inject

class EventInfoViewModel @Inject constructor(
//    private val createEventInfoUseCase: CreateEventInfoUseCase,
//    private val getAllEventsInfoUseCase: GetAllEventsInfoUseCase,
    private val getEventInfoByIdUseCase: GetEventInfoByIdUseCase
): ViewModel() {
    /*private val _eventsInfo = MutableLiveData<List<EventInfoEntity>>()
    val eventsInfo: LiveData<List<EventInfoEntity>> get() = _eventsInfo*/

    private val _event = MutableLiveData<EventInfoEntity?>()
    val event: LiveData<EventInfoEntity?> get() = _event

    fun loadEventInfo(eventId: Long) {
        viewModelScope.launch {
            getEventInfoByIdUseCase(eventId)?.collect {
                _event.postValue(it)
            }
        }
    }
}