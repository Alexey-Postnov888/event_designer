package ru.alexeypostnov.eventdesigner

import android.app.Application
import android.content.Context
import ru.alexeypostnov.eventdesigner.di.AppComponent
import ru.alexeypostnov.eventdesigner.di.DaggerAppComponent

class MainApplication: Application() {
    lateinit var appComponent: AppComponent
        private set

    override fun onCreate() {
        appComponent = DaggerAppComponent.builder()
            .application(this)
            .build()

        super.onCreate()
    }

}

val Context.appComponent: AppComponent
    get() = when(this) {
        is MainApplication -> this.appComponent
        else -> this.applicationContext.appComponent
    }