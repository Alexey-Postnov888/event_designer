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

        setupChildFragment()
        setupChipNavigation()
    }

    private fun setupChipNavigation() {
        binding.eventDetailsNavigationChipGroup.setOnCheckedStateChangeListener(null)
        binding.chipInfo.isChecked = true

        binding.eventDetailsNavigationChipGroup.setOnCheckedStateChangeListener { group, checkedIds ->
            when (checkedIds.firstOrNull()) {
                R.id.chipInfo -> navigateToEventInfo()
                R.id.chipMap -> navigateToEventMap()
            }
        }
    }

    private fun setupChildFragment() {
        val navHostFragment = childFragmentManager.findFragmentById(R.id.main) as? NavHostFragment
        val childNavController = navHostFragment?.navController

        val startDestinationArgs = Bundle().apply {
            putLong("eventId", args.eventId)
        }

        childNavController?.setGraph(R.navigation.event_details_graph, startDestinationArgs)
    }

    private fun navigateToEventInfo() {
        val navHostFragment = childFragmentManager.findFragmentById(R.id.main) as? NavHostFragment
        val childNavController = navHostFragment?.navController

        if (childNavController?.currentDestination?.id != R.id.eventInfoFragment) {
            val args = Bundle().apply {
                putLong("eventId", this@EventDetailsFragment.args.eventId)
            }
            childNavController?.navigate(R.id.eventInfoFragment, args)
        }
    }

    private fun navigateToEventMap() {
        val navHostFragment = childFragmentManager.findFragmentById(R.id.main) as? NavHostFragment
        val childNavController = navHostFragment?.navController

        if (childNavController?.currentDestination?.id != R.id.eventMapFragment) {
            val args = Bundle().apply {
                putLong("eventId", this@EventDetailsFragment.args.eventId)
            }
            childNavController?.navigate(R.id.eventMapFragment, args)
        }
    }
}