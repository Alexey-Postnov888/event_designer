package ru.alexeypostnov.eventdesigner.di

import dagger.Module
import dagger.Provides
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.create
import ru.alexeypostnov.eventdesigner.data.EventInfoService

@Module
object NetworkModule {
    @Provides
    fun provideService(): EventInfoService =
        Retrofit.Builder()
            .baseUrl("http://localhost:8080/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create()
}