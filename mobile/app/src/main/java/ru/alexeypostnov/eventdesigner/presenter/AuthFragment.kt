package ru.alexeypostnov.eventdesigner.presenter

import android.content.Context
import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import dev.androidbroadcast.vbpd.viewBinding
import ru.alexeypostnov.eventdesigner.R
import ru.alexeypostnov.eventdesigner.appComponent
import ru.alexeypostnov.eventdesigner.data.AuthManager
import ru.alexeypostnov.eventdesigner.databinding.FragmentAuthBinding
import ru.alexeypostnov.eventdesigner.di.viewModel.ViewModelFactory
import javax.inject.Inject

class AuthFragment : Fragment(R.layout.fragment_auth) {
    private val binding: FragmentAuthBinding by viewBinding(FragmentAuthBinding::bind)

    @Inject
    lateinit var viewModelFactory: ViewModelFactory

    @Inject
    lateinit var authManager: AuthManager

    private val viewModel: AuthViewModel by viewModels{ viewModelFactory }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        if (authManager.isLoggedIn()) {
            navigateToEventList()
            return
        }

        binding.authButton.setOnClickListener {
            val email = binding.emailText.text?.toString()?.trim()
            val password = binding.passwordText.text?.toString()?.trim()

            viewModel.loadAuthTokenInfo(email!!, password!!)
        }

        viewModel.token.observe(viewLifecycleOwner) { token ->
            saveToken(token)
            navigateToEventList()
        }
    }

    private fun saveToken(token: String) {
        authManager.saveToken(token)
    }

    private fun navigateToEventList() {
        findNavController().navigate(R.id.action_authFragment_to_eventListFragment)
    }

    override fun onAttach(context: Context) {
        context.appComponent.inject(this)
        super.onAttach(context)
    }
}