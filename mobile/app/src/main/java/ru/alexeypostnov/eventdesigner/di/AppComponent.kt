package ru.alexeypostnov.eventdesigner.di

import dagger.Component
import dagger.Module
import ru.alexeypostnov.eventdesigner.di.viewModel.ViewModelModule

@Component(
    modules = [
        AppModule::class
    ]
)
abstract class AppComponent {
//    abstract fun inject(fragment: MainFragment)
}

@Module(
    includes = [
        NetworkModule::class,
        AppBindsModule::class,
        ViewModelModule::class
    ]
)
class AppModule