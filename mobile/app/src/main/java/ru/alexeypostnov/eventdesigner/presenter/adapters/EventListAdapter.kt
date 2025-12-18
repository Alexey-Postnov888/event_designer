package ru.alexeypostnov.eventdesigner.presenter.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import ru.alexeypostnov.eventdesigner.data.model.Event
import ru.alexeypostnov.eventdesigner.databinding.ItemEventListBinding
import java.sql.Date
import java.text.SimpleDateFormat
import java.util.Locale

class EventListAdapter(
    private val onEventClick: (Event) -> Unit
): RecyclerView.Adapter<EventListAdapter.EventListViewHolder>() {
    private var eventList: List<Event> = listOf()
    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int
    ): EventListViewHolder {
        val context = parent.context
        val layoutInflater = LayoutInflater.from(context)
        val binding = ItemEventListBinding.inflate(
            layoutInflater,
            parent,
            false
        )

        return EventListViewHolder(binding, onEventClick)
    }

    override fun onBindViewHolder(
        holder: EventListViewHolder,
        position: Int
    ) {
        val item = eventList[position]
        holder.bind(item)
    }

    override fun getItemCount(): Int = eventList.size

    fun submitEventList(list: List<Event>) {
        eventList = list
        notifyDataSetChanged()
    }

    class EventListViewHolder(
        val binding: ItemEventListBinding,
        private val onEventClick: (Event) -> Unit
    ): RecyclerView.ViewHolder(binding.root) {
        fun bind(item: Event) {
            val timeFormatter = SimpleDateFormat("HH:mm", Locale.getDefault())
            val dateFormatter = SimpleDateFormat("dd.MM.yyyy", Locale.getDefault())

            val startsAtInstant = item.startsAt.instant
            val startsAtDate = Date.from(startsAtInstant)

            binding.eventListItemTitle.text = item.name
            binding.eventListItemStartTime.text = timeFormatter.format(startsAtDate)
            binding.eventListItemStartDate.text = dateFormatter.format(startsAtDate)

            binding.root.setOnClickListener {
                onEventClick(item)
            }
        }
    }
}