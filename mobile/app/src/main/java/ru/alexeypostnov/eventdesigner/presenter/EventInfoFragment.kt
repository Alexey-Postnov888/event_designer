package ru.alexeypostnov.eventdesigner.presenter

import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.view.View
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.navArgs
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import dev.androidbroadcast.vbpd.viewBinding
import ru.alexeypostnov.eventdesigner.R
import ru.alexeypostnov.eventdesigner.appComponent
import ru.alexeypostnov.eventdesigner.data.model.EventInfo
import ru.alexeypostnov.eventdesigner.databinding.FragmentEventInfoBinding
import ru.alexeypostnov.eventdesigner.di.viewModel.ViewModelFactory
import java.sql.Date
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.UUID
import javax.inject.Inject

class EventInfoFragment: Fragment(R.layout.fragment_event_info) {
    private val binding: FragmentEventInfoBinding by viewBinding(FragmentEventInfoBinding::bind)

    @Inject
    lateinit var viewModelFactory: ViewModelFactory

    private val viewModel: EventInfoViewModel by viewModels(
        ownerProducer = { requireActivity() },
        factoryProducer = { viewModelFactory }
    )
    val args: EventInfoFragmentArgs by navArgs()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val eventId = UUID.fromString(args.eventId)

        viewModel.loadEventInfo(eventId)
        viewModel.loadEventMap(eventId)

        viewModel.event.observe(viewLifecycleOwner) {eventInfo ->
            eventInfo?.let {
                displayEventInfo(it)
            }
        }

        binding.downloadMapBtn.setOnClickListener {
            viewModel.eventMap.value?.let { mapInfo ->
                downloadMap(mapInfo.mapUrl, eventId, )
            } ?: showDownloadingToast("Карта еще не загружена")
        }
    }

    private fun displayEventInfo(event: EventInfo) {
        try {
            val timeFormatter = SimpleDateFormat("HH:mm", Locale.getDefault())
            val dateFormatter = SimpleDateFormat("dd.MM.yyyy", Locale.getDefault())
            binding.eventInfoDescription.text = event.description.string

            val startsAtInstant = event.startsAt.instant
            val startsAtDate = Date.from(startsAtInstant)
            binding.eventInfoTime.text = timeFormatter.format(startsAtDate)
            binding.eventInfoDate.text = dateFormatter.format(startsAtDate)
            binding.eventInfoAddress.text = event.address.string
        } catch (e: Exception) {
            showErrorDialog("Ошибка отображения данных: ${e.message}")
        }
    }

    private fun downloadMap(mapUrl: String, eventId: UUID) {
        val devMapUrl = mapUrl.replace(
            "http://localhost:8080",
            "https://eventdesigner.alexeypostnov.ru"
        )

        val downloadManager = requireContext().getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        val request = DownloadManager.Request(Uri.parse(devMapUrl))
            .setTitle("Карта мероприятия")
            .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "map.jpg")
            .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)

        downloadManager.enqueue(request)

        showDownloadingToast("Скачивание началось")
    }

    private fun showDownloadingToast(message: String) {
        Toast.makeText(requireContext(), message, Toast.LENGTH_SHORT).show()
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