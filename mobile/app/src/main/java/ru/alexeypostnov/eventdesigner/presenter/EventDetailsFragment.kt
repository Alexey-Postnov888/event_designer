package ru.alexeypostnov.eventdesigner.presenter

import android.content.Context
import android.os.Bundle
import android.view.View
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.fragment.navArgs
import dev.androidbroadcast.vbpd.viewBinding
import ru.alexeypostnov.eventdesigner.R
import ru.alexeypostnov.eventdesigner.appComponent
import ru.alexeypostnov.eventdesigner.data.model.EventInfo
import ru.alexeypostnov.eventdesigner.databinding.FragmentEventDetailsBinding
import ru.alexeypostnov.eventdesigner.di.viewModel.ViewModelFactory
import java.util.UUID
import javax.inject.Inject

class EventDetailsFragment: Fragment(R.layout.fragment_event_details) {
    private val binding: FragmentEventDetailsBinding by viewBinding(FragmentEventDetailsBinding::bind)
    private val args: EventDetailsFragmentArgs by navArgs()

    @Inject
    lateinit var viewModelFactory: ViewModelFactory
    private val viewModel: EventInfoViewModel by viewModels(
        ownerProducer = { requireActivity() },
        factoryProducer = { viewModelFactory }
    )

    private lateinit var eventId: UUID

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        eventId = parseEventId()

        if (viewModel.event.value == null) {
            viewModel.loadEventInfo(eventId)
        }

        viewModel.event.observe(viewLifecycleOwner) {eventInfo ->
            eventInfo?.let {
                binding.eventDetailsTitle.text = it.name
                setupChildFragment(it)
            }
        }

        setupChipNavigation()
    }

    private fun parseEventId(): UUID {
        val eventIdString = args.eventId
        if (!eventIdString.isNullOrEmpty()) {
            try {
                return UUID.fromString(eventIdString)
            } catch (e: IllegalArgumentException) {
                throw IllegalArgumentException("Invalid UUID: $eventIdString")
            }
        }

        throw IllegalArgumentException("Event ID is required")
    }

    private fun setupChipNavigation() {
        binding.eventDetailsNavigationChipGroup.setOnCheckedStateChangeListener(null)
        binding.chipInfo.isChecked = true

        binding.eventDetailsNavigationChipGroup.setOnCheckedStateChangeListener { group, checkedIds ->
            when (checkedIds.firstOrNull()) {
                R.id.chipInfo -> navigateToEventInfo()
                R.id.chipMap -> navigateToEventMap()
                R.id.chipTimeline -> navigateToEventTimeline()
            }
        }
    }

    private fun setupChildFragment(event: EventInfo) {
        val navHostFragment = childFragmentManager.findFragmentById(R.id.main) as? NavHostFragment
        val childNavController = navHostFragment?.navController

        val startDestinationArgs = bundleOf(
            "eventId" to eventId.toString()
        )

        childNavController?.setGraph(R.navigation.event_details_graph, startDestinationArgs)
    }

    private fun navigateToEventInfo() {
        val navHostFragment = childFragmentManager.findFragmentById(R.id.main) as? NavHostFragment
        val childNavController = navHostFragment?.navController

        val args = bundleOf(
            "eventId" to eventId.toString()
        )

        if (childNavController?.currentDestination?.id != R.id.eventInfoFragment) {
            childNavController?.navigate(R.id.eventInfoFragment, args)
        }
    }

    private fun navigateToEventMap() {
        val navHostFragment = childFragmentManager.findFragmentById(R.id.main) as? NavHostFragment
        val childNavController = navHostFragment?.navController

        val args = bundleOf(
            "eventId" to eventId.toString()
        )

        if (childNavController?.currentDestination?.id != R.id.eventMapFragment) {
            childNavController?.navigate(R.id.eventMapFragment, args)
        }
    }

    private fun navigateToEventTimeline() {
        val navHostFragment = childFragmentManager.findFragmentById(R.id.main) as? NavHostFragment
        val childNavController = navHostFragment?.navController

        val args = bundleOf(
            "eventId" to eventId.toString()
        )

        if (childNavController?.currentDestination?.id != R.id.eventTimelineFragment) {
            childNavController?.navigate(R.id.eventTimelineFragment, args)
        }
    }

    override fun onAttach(context: Context) {
        context.appComponent.inject(this)
        super.onAttach(context)
    }
}