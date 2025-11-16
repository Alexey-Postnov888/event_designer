package ru.alexeypostnov.eventdesigner.presenter

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import javax.inject.Inject

class MainViewModel @Inject constructor(
    // Use Cases
): ViewModel() {
    fun loadSomeInfo() {
        viewModelScope.launch {

        }
    }

    fun setSomeValues(color: String) {
        viewModelScope.launch {

        }
    }
}