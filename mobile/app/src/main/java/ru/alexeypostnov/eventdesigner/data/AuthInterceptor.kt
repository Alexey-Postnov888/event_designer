package ru.alexeypostnov.eventdesigner.data

import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthInterceptor @Inject constructor(
    private val authManager: AuthManager
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()

        val currentToken = authManager.getToken()

        return if (currentToken != null) {
            val requestWithToken = originalRequest.newBuilder()
                .header("Authorization", "Bearer $currentToken")
                .build()

            chain.proceed(requestWithToken)
        } else {
            chain.proceed(originalRequest)
        }
    }
}