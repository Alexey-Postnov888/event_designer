package ru.alexeypostnov.eventdesigner.presenter

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import ru.alexeypostnov.eventdesigner.domain.PostAuthAdminLoginUseCase
import javax.inject.Inject

class AuthViewModel @Inject constructor(
    private val postAuthAdminLoginUseCase: PostAuthAdminLoginUseCase
): ViewModel() {
    private val _token = MutableLiveData<String>()
    val token: LiveData<String> get() = _token

    fun loadAuthTokenInfo(email: String, password: String) {
        viewModelScope.launch {
            val authInfo = postAuthAdminLoginUseCase(email, password)
            _token.postValue(
                authInfo?.token ?: error("eventInfo is null")
            )
        }
    }
}