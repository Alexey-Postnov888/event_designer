package ru.alexeypostnov.eventdesigner.presenter

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.navigation.NavOptions
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.fragment.navArgs
import dev.androidbroadcast.vbpd.viewBinding
import ru.alexeypostnov.eventdesigner.R
import ru.alexeypostnov.eventdesigner.databinding.FragmentEventDetailsBinding

class EventDetailsFragment: Fragment(R.layout.fragment_event_details) {
    private val binding: FragmentEventDetailsBinding by viewBinding(FragmentEventDetailsBinding::bind)
    private val args: EventDetailsFragmentArgs by navArgs()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupChipNavigation()
        setupChildFragment()
    }

    private fun setupChipNavigation() {
        binding.eventDetailsNavigationChipGroup.setOnCheckedStateChangeListener { group, checkedIds ->
            when (checkedIds.firstOrNull()) {
                R.id.chipInfo -> navigateToEventInfo()
            }
        }

        binding.chipInfo.isChecked = true
    }

    private fun setupChildFragment() {
        val navHostFragment = childFragmentManager.findFragmentById(R.id.main) as? NavHostFragment
        val childNavController = navHostFragment?.navController

        childNavController?.setGraph(R.navigation.event_details_graph)

        val savedStateHandle = childNavController?.currentBackStackEntry?.savedStateHandle
        savedStateHandle?.set("eventId", args.eventId)
    }

    private fun navigateToEventInfo() {
        val navHostFragment = childFragmentManager.findFragmentById(R.id.main) as? NavHostFragment
        navHostFragment?.navController?.navigate(R.id.eventInfoFragment)
    }
}