package ru.alexeypostnov.eventdesigner.presenter

import android.content.Context
import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.navArgs
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import dev.androidbroadcast.vbpd.viewBinding
import ru.alexeypostnov.eventdesigner.R
import ru.alexeypostnov.eventdesigner.appComponent
import ru.alexeypostnov.eventdesigner.databinding.FragmentEventInfoBinding
import ru.alexeypostnov.eventdesigner.di.viewModel.ViewModelFactory
import java.sql.Date
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.UUID
import javax.inject.Inject
import kotlin.time.ExperimentalTime

class EventInfoFragment: Fragment(R.layout.fragment_event_info) {
    private val binding: FragmentEventInfoBinding by viewBinding(FragmentEventInfoBinding::bind)
    @Inject
    lateinit var viewModelFactory: ViewModelFactory
    private val viewModel: EventInfoViewModel by viewModels { viewModelFactory }
    val args: EventInfoFragmentArgs by navArgs()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val eventIdString = args.eventId

        try {
            if (!eventIdString.isNullOrEmpty()) {
                try {
                    val eventId = UUID.fromString(eventIdString)
                    viewModel.loadEventInfo(eventId)
                    viewModel.event.observe(viewLifecycleOwner) {
                        if (it != null) {
                            val timeFormatter = SimpleDateFormat("HH:mm", Locale.getDefault())
                            val dateFormatter = SimpleDateFormat("dd.MM.yyyy", Locale.getDefault())
                            binding.eventInfoDescription.text = it.description.string

                            val startsAtInstant = it.startsAt.instant
                            val startsAtDate = Date.from(startsAtInstant)
                            binding.eventInfoTime.text = timeFormatter.format(startsAtDate)
                            binding.eventInfoDate.text = dateFormatter.format(startsAtDate)
                            binding.eventInfoAddress.text = it.address.string
                        } else {
                            MaterialAlertDialogBuilder(requireContext())
                                .setTitle("Событие не найдено")
                                .setMessage("Событие с ID ${args.eventId} не найдено в базе данных")
                                .setPositiveButton("OK", null)
                                .show()
                        }
                    }
                } catch (e: IllegalArgumentException) {
                    showErrorDialog("Неверный формат ID события")
                }
            } else {
                showErrorDialog("ID события не указан")
            }
        } catch (e: Exception) {
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Ошибка")
                .setMessage(e.toString())
                .setPositiveButton("OK", null)
                .show()
        }
    }

    private fun showErrorDialog(message: String) {
        MaterialAlertDialogBuilder(requireContext())
            .setTitle("Ошибка")
            .setMessage(message)
            .setPositiveButton("OK", null)
            .show()
    }

    override fun onAttach(context: Context) {
        context.appComponent.inject(this)
        super.onAttach(context)
    }
}