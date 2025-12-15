package ru.alexeypostnov.eventdesigner.presenter

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import ru.alexeypostnov.eventdesigner.data.model.Event
import ru.alexeypostnov.eventdesigner.domain.GetMyEventsUseCase
import javax.inject.Inject

class EventListViewModel @Inject constructor(
    private val getMyEventsUseCase: GetMyEventsUseCase
): ViewModel() {
    private val _eventsList = MutableLiveData<List<Event>>()
    val eventList: LiveData<List<Event>> get() = _eventsList

    fun loadEvents() {
        viewModelScope.launch {
            val eventInfo = getMyEventsUseCase()
            _eventsList.postValue(
                eventInfo ?: error("eventList is null")
            )
        }
    }
}