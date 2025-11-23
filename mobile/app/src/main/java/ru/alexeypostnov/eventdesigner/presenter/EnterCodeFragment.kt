package ru.alexeypostnov.eventdesigner.presenter

import androidx.fragment.app.Fragment
import dev.androidbroadcast.vbpd.viewBinding
import ru.alexeypostnov.eventdesigner.R
import ru.alexeypostnov.eventdesigner.databinding.FragmentEnterCodeBinding

class EnterCodeFragment : Fragment(R.layout.fragment_enter_code) {
    private val binding: FragmentEnterCodeBinding by viewBinding(FragmentEnterCodeBinding::bind)
}