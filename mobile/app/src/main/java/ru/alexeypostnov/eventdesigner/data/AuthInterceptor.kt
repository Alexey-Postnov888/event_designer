package ru.alexeypostnov.eventdesigner.data

import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthInterceptor @Inject constructor(
    private val authManager: AuthManager
) : Interceptor {

//    companion object {
//        private var token: String? = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzY1ODM4NTA0LCJpYXQiOjE3NjU3NTIxMDR9._XmVa9as3Yz8xdIyJQ4_tL9kJKGH7DEPt9Ixe4GmxnI"
//    }

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