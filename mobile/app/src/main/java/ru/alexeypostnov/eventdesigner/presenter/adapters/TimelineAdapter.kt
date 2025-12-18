package ru.alexeypostnov.eventdesigner.presenter.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.graphics.toColorInt
import androidx.recyclerview.widget.RecyclerView
import com.lriccardo.timelineview.TimelineDecorator
import ru.alexeypostnov.eventdesigner.data.model.PointInfo
import ru.alexeypostnov.eventdesigner.databinding.ItemTimelineBinding
import java.sql.Date
import java.text.SimpleDateFormat
import java.util.Locale

class TimelineAdapter: RecyclerView.Adapter<TimelineAdapter.TimelineViewHolder>() {
    private var timelineList: List<PointInfo> = listOf()

    val timelineDecorator = TimelineDecorator(
        indicatorSize = 24f,
        lineWidth = 6f,
        padding = 48f,
        position = TimelineDecorator.Position.Left,
        indicatorColor = "#d9d9d9".toColorInt(),
        lineColor = "#e2e3e4".toColorInt()
    )

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int
    ): TimelineViewHolder {
        val context = parent.context
        val layoutInflater = LayoutInflater.from(context)
        val binding = ItemTimelineBinding.inflate(
            layoutInflater,
            parent,
            false
        )

        return TimelineViewHolder(binding)
    }

    override fun onBindViewHolder(
        holder: TimelineViewHolder,
        position: Int
    ) {
        val item = timelineList[position]
        holder.bind(item)
    }

    override fun getItemCount(): Int = timelineList.size

    fun submitTimelineList(list: List<PointInfo>) {
        timelineList = list
        notifyDataSetChanged()
    }

    class TimelineViewHolder(
        val binding: ItemTimelineBinding
    ): RecyclerView.ViewHolder(binding.root) {
        fun bind(item: PointInfo) {
            val timeFormatter = SimpleDateFormat("HH:mm", Locale.getDefault())

            val startsAtInstant = item.startAt.instant
            val startsAtDate = Date.from(startsAtInstant)

            val endsAtInstant = item.endAt.instant
            val endsAtDate = Date.from(endsAtInstant)

            binding.timelineItemDescription.text = item.timelineDescription.string
            binding.timelineItemStartTime.text = timeFormatter.format(startsAtDate)
            binding.timelineItemEndTime.text = timeFormatter.format(endsAtDate)
        }
    }
}