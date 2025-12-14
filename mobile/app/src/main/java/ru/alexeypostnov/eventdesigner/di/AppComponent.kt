package ru.alexeypostnov.eventdesigner.di

import android.app.Application
import dagger.BindsInstance
import dagger.Component
import dagger.Module
import ru.alexeypostnov.eventdesigner.di.viewModel.ViewModelModule
import ru.alexeypostnov.eventdesigner.presenter.EventDetailsFragment
import ru.alexeypostnov.eventdesigner.presenter.EventInfoFragment
import ru.alexeypostnov.eventdesigner.presenter.EventMapFragment
import ru.alexeypostnov.eventdesigner.presenter.EventTimelineFragment
import javax.inject.Singleton

@Component(
    modules = [
        AppModule::class
    ]
)
@Singleton
abstract class AppComponent {
    abstract fun inject(fragment: EventInfoFragment)
    abstract fun inject(fragment: EventMapFragment)
    abstract fun inject(fragment: EventDetailsFragment)
    abstract fun inject(fragment: EventTimelineFragment)

    @Component.Builder
    interface Builder {
        @BindsInstance
        fun application(app: Application): Builder
        fun build(): AppComponent
    }
}

@Module(
    includes = [
        NetworkModule::class,
        AppBindsModule::class,
        ViewModelModule::class
    ]
)
class AppModule