package ru.alexeypostnov.eventdesigner.presenter

import android.content.Context
import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.navArgs
import coil.load
import coil.request.CachePolicy
import coil.transform.RoundedCornersTransformation
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import dev.androidbroadcast.vbpd.viewBinding
import ru.alexeypostnov.eventdesigner.R
import ru.alexeypostnov.eventdesigner.appComponent
import ru.alexeypostnov.eventdesigner.databinding.FragmentEventMapBinding
import ru.alexeypostnov.eventdesigner.di.viewModel.ViewModelFactory
import java.util.UUID
import javax.inject.Inject
import kotlin.getValue

class EventMapFragment: Fragment(R.layout.fragment_event_map) {
    private val binding: FragmentEventMapBinding by viewBinding(FragmentEventMapBinding::bind)
    @Inject
    lateinit var viewModelFactory: ViewModelFactory
    private val viewModel: EventInfoViewModel by viewModels { viewModelFactory }

    private val args: EventMapFragmentArgs by navArgs()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val eventIdString = args.eventId

        try {
            if (!eventIdString.isNullOrEmpty()) {
                try {
                    val eventId = UUID.fromString(eventIdString)
                    viewModel.loadEventMap(eventId)
                    viewModel.eventMap.observe(viewLifecycleOwner) {
                        if (it != null) {
                            loadEventMap(it.mapUrl)
                        } else {
                            MaterialAlertDialogBuilder(requireContext())
                                .setTitle("Карта мероприятия не найдена")
                                .setMessage("Карта с ID мероприятия ${args.eventId} не найдена")
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

    private fun loadEventMap(mapUrl: String) {
        binding.mapView.load(mapUrl) {
            crossfade(true)
            placeholder(R.drawable.card_image)
            memoryCachePolicy(CachePolicy.ENABLED)
            diskCachePolicy(CachePolicy.ENABLED)
            transformations(RoundedCornersTransformation(16f))
            listener(
                onSuccess = { _, _ ->
                    setupPhotoView()
                }
            )
        }
    }

    private fun setupPhotoView() {
        binding.mapView.setOnPhotoTapListener { _, x, y ->
            showTapInfo(x, y)
        }
    }

    private fun showTapInfo(x: Float, y: Float) {
        val info = "Тап по координатам: ${"%.2f".format(x)}, ${"%.2f".format(y)}"
        MaterialAlertDialogBuilder(requireContext())
            .setTitle("Информация")
            .setMessage(info)
            .setPositiveButton("OK", null)
            .show()
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