package ru.alexeypostnov.eventdesigner.di

import android.content.Context
import dagger.Module
import dagger.Provides
import retrofit2.Retrofit
import retrofit2.create
import ru.alexeypostnov.eventdesigner.data.EventInfoService
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import ru.alexeypostnov.eventdesigner.data.AuthInterceptor
import ru.alexeypostnov.eventdesigner.data.AuthManager
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
object NetworkModule {
    @Provides
    @Singleton
    fun provideJson(): Json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        explicitNulls = false
    }

    @Provides
    @Singleton
    fun provideAuthManager(context: Context): AuthManager {
        return AuthManager(context)
    }

    @Provides
    @Singleton
    fun provideAuthInterceptor(authManager: AuthManager): AuthInterceptor {
        return AuthInterceptor(authManager)
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(
        authInterceptor: AuthInterceptor
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    fun provideService(
        okHttpClient: OkHttpClient
    ): EventInfoService {
        return Retrofit.Builder()
            .baseUrl("https://eventdesigner.alexeypostnov.ru/")
            .client(okHttpClient)
            .addConverterFactory(
                Json.asConverterFactory("application/json".toMediaType())
            )
            .build()
            .create()
    }
}