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
import java.text.SimpleDateFormat
import java.util.Locale
import javax.inject.Inject

class EventInfoFragment: Fragment(R.layout.fragment_event_info) {
    private val binding: FragmentEventInfoBinding by viewBinding(FragmentEventInfoBinding::bind)
    @Inject
    lateinit var viewModelFactory: ViewModelFactory
    private val viewModel: EventInfoViewModel by viewModels { viewModelFactory }
    val args: EventInfoFragmentArgs by navArgs()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        try {
            viewModel.loadEventInfo(args.eventId)
        } catch (e: Exception) {
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Ошибка")
                .setMessage(e.toString())
                .setPositiveButton("OK", null)
                .show()
        }
        viewModel.event.observe(viewLifecycleOwner) {
            if (it != null) {
                val timeFormatter = SimpleDateFormat("HH:mm", Locale.getDefault())
                val dateFormatter = SimpleDateFormat("dd.MM.yyyy", Locale.getDefault())
                binding.eventInfoDescription.text = it.description
                binding.eventInfoTime.text = timeFormatter.format(it.date)
                binding.eventInfoDate.text = dateFormatter.format(it.date)
                binding.eventInfoAddress.text = it.address
            } else {
                MaterialAlertDialogBuilder(requireContext())
                    .setTitle("Событие не найдено")
                    .setMessage("Событие с ID ${args.eventId} не найдено в базе данных")
                    .setPositiveButton("OK", null)
                    .show()
            }
        }
    }

    override fun onAttach(context: Context) {
        context.appComponent.inject(this)
        super.onAttach(context)
    }
}