package ru.alexeypostnov.eventdesigner.presenter

import android.content.Context
import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.navArgs
import androidx.recyclerview.widget.LinearLayoutManager
import dev.androidbroadcast.vbpd.viewBinding
import ru.alexeypostnov.eventdesigner.R
import ru.alexeypostnov.eventdesigner.appComponent
import ru.alexeypostnov.eventdesigner.databinding.FragmentEventTimelineBinding
import ru.alexeypostnov.eventdesigner.di.viewModel.ViewModelFactory
import ru.alexeypostnov.eventdesigner.presenter.adapters.TimelineAdapter
import java.util.UUID
import javax.inject.Inject
import kotlin.getValue

class EventTimelineFragment: Fragment(R.layout.fragment_event_timeline) {
    private val binding: FragmentEventTimelineBinding by viewBinding(FragmentEventTimelineBinding::bind)

    private var adapter: TimelineAdapter? = null

    @Inject
    lateinit var viewModelFactory: ViewModelFactory
    private val viewModel: EventInfoViewModel by viewModels(
        ownerProducer = { requireActivity() },
        factoryProducer = { viewModelFactory }
    )

    private val args: EventMapFragmentArgs by navArgs()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        val eventIdString = args.eventId
        val eventId = UUID.fromString(eventIdString)

        binding.timelineWrap.layoutManager = LinearLayoutManager(requireContext(),
            LinearLayoutManager.VERTICAL, false)
        adapter = TimelineAdapter()

        binding.timelineWrap.adapter = adapter

        binding.timelineWrap.apply {
            this@EventTimelineFragment.adapter?.let { addItemDecoration(it.timelineDecorator) }
        }

        viewModel.loadEventPointsInfo(eventId)

        viewModel.eventPointsInfo.observe(viewLifecycleOwner) {
            adapter?.submitTimelineList(it)
        }

        super.onViewCreated(view, savedInstanceState)
    }

    override fun onAttach(context: Context) {
        val component = context.appComponent
        component.inject(this)
        super.onAttach(context)
    }
}