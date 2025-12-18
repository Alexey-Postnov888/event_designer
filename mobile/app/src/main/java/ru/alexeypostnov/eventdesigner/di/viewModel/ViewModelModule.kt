package ru.alexeypostnov.eventdesigner.di.viewModel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import dagger.Binds
import dagger.Module
import dagger.multibindings.IntoMap
import ru.alexeypostnov.eventdesigner.presenter.AuthViewModel
import ru.alexeypostnov.eventdesigner.presenter.EventInfoViewModel
import ru.alexeypostnov.eventdesigner.presenter.EventListViewModel

@Module
interface ViewModelModule {
    @Binds
    fun bindViewModelFactory(
        factory: ViewModelFactory
    ): ViewModelProvider.Factory

    @Binds
    @IntoMap
    @ViewModelKey(EventInfoViewModel::class)
    fun bindEventInfoViewModel(
        viewModel: EventInfoViewModel
    ): ViewModel

    @Binds
    @IntoMap
    @ViewModelKey(AuthViewModel::class)
    fun bindAuthViewModel(
        viewModel: AuthViewModel
    ): ViewModel

    @Binds
    @IntoMap
    @ViewModelKey(EventListViewModel::class)
    fun bindEventListViewModel(
        viewModel: EventListViewModel
    ): ViewModel
}