package ru.alexeypostnov.eventdesigner.di

import android.app.Application
import android.content.Context
import androidx.room.Room
import dagger.Binds
import dagger.Module
import dagger.Provides
import ru.alexeypostnov.eventdesigner.data.EventInfoRepository
import ru.alexeypostnov.eventdesigner.data.EventInfoRepositoryImpl
import ru.alexeypostnov.eventdesigner.data.db.EventsInfoDAO
import ru.alexeypostnov.eventdesigner.data.db.EventsInfoDatabase
import ru.alexeypostnov.eventdesigner.domain.CreateEventInfoUseCase
import ru.alexeypostnov.eventdesigner.domain.CreateEventInfoUseCaseImpl
import ru.alexeypostnov.eventdesigner.domain.GetAllEventsInfoUseCase
import ru.alexeypostnov.eventdesigner.domain.GetAllEventsInfoUseCaseImpl
import ru.alexeypostnov.eventdesigner.domain.GetEventInfoByIdUseCase
import ru.alexeypostnov.eventdesigner.domain.GetEventInfoByIdUseCaseImpl
import ru.alexeypostnov.eventdesigner.domain.GetEventMapByEventIdUseCase
import ru.alexeypostnov.eventdesigner.domain.GetEventMapByEventIdUseCaseImpl
import javax.inject.Singleton

@Module
interface AppBindsModule {
    @Binds
    @Singleton
    fun bindEventInfoRepository(impl: EventInfoRepositoryImpl): EventInfoRepository

    @Binds
    @Singleton
    fun bindCreateEventInfoUseCase(impl: CreateEventInfoUseCaseImpl): CreateEventInfoUseCase

    @Binds
    @Singleton
    fun bindGetAllEventsInfoUseCase(impl: GetAllEventsInfoUseCaseImpl): GetAllEventsInfoUseCase

    @Binds
    @Singleton
    fun bindGetEventInfoByIdUseCase(impl: GetEventInfoByIdUseCaseImpl): GetEventInfoByIdUseCase

    @Binds
    @Singleton
    fun bindsGetEventMapByEventIdUseCase(impl: GetEventMapByEventIdUseCaseImpl): GetEventMapByEventIdUseCase

    companion object {
        @Provides
        fun provideContext(
            app: Application
        ): Context = app.applicationContext

        @Provides
        @Singleton
        fun provideDb(context: Context): EventsInfoDatabase =
            Room.databaseBuilder(
                context,
                EventsInfoDatabase::class.java,
                "eventsInfo.db"
            ).build()

        @Provides
        @Singleton
        fun provideDao(db: EventsInfoDatabase): EventsInfoDAO =
            db.eventsInfoDao
    }
}