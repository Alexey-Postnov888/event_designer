package ru.alexeypostnov.eventdesigner.presenter

import android.content.Context
import android.os.Bundle
import android.view.View
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import androidx.recyclerview.widget.LinearLayoutManager
import dev.androidbroadcast.vbpd.viewBinding
import ru.alexeypostnov.eventdesigner.R
import ru.alexeypostnov.eventdesigner.appComponent
import ru.alexeypostnov.eventdesigner.data.model.Event
import ru.alexeypostnov.eventdesigner.databinding.FragmentEventListBinding
import ru.alexeypostnov.eventdesigner.di.viewModel.ViewModelFactory
import ru.alexeypostnov.eventdesigner.presenter.adapters.EventListAdapter
import javax.inject.Inject

class EventListFragment: Fragment(R.layout.fragment_event_list) {
    private val binding: FragmentEventListBinding by viewBinding(FragmentEventListBinding::bind)
    private var adapter: EventListAdapter? = null

    @Inject
    lateinit var viewModelFactory: ViewModelFactory
    private val viewModel: EventListViewModel by viewModels { viewModelFactory }

    private val args: EventListFragmentArgs by navArgs()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding.eventListWrap.layoutManager = LinearLayoutManager(requireContext(),
            LinearLayoutManager.VERTICAL, false)

        adapter = EventListAdapter(::onEventClick)

        binding.eventListWrap.adapter = adapter

        viewModel.loadEvents()

        viewModel.eventList.observe(viewLifecycleOwner) {
            adapter?.submitEventList(it)
        }

        super.onViewCreated(view, savedInstanceState)
    }

    private fun onEventClick(event: Event) {
        val args = bundleOf(
            "eventId" to event.id
        )
        findNavController().navigate(R.id.action_eventListFragment_to_eventDetailsFragment, args)
    }

    override fun onAttach(context: Context) {
        val component = context.appComponent
        component.inject(this)
        super.onAttach(context)
    }
}