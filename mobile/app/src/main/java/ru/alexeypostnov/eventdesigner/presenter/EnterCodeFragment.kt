package ru.alexeypostnov.eventdesigner.presenter

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import dev.androidbroadcast.vbpd.viewBinding
import ru.alexeypostnov.eventdesigner.R
import ru.alexeypostnov.eventdesigner.databinding.FragmentEnterCodeBinding

class EnterCodeFragment : Fragment(R.layout.fragment_enter_code) {
    private val binding: FragmentEnterCodeBinding by viewBinding(FragmentEnterCodeBinding::bind)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding.resendCodeButton.setOnClickListener {
            findNavController().navigate(R.id.action_enterCodeFragment_to_eventDetailsFragment)
        }
    }
}