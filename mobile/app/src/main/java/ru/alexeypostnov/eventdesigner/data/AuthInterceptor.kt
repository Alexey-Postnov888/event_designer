package ru.alexeypostnov.eventdesigner.data

import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthInterceptor @Inject constructor() : Interceptor {

    companion object {
        private var token: String? = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJlbWFpbCI6Im9ic2VydmVyMUBleGFtcGxlLmNvbSIsInJvbGUiOiJvYnNlcnZlciIsImV4cCI6MTc2NTE0ODI5NSwiaWF0IjoxNzY1MTQxMDk1fQ.X8xCU_3CAl27l8cLU2CXgM8K6kIM_oiK5kUNQBNdKdA"
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()

        val currentToken = token

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