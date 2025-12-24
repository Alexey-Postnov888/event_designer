package ru.alexeypostnov.eventdesigner.presenter

import android.content.Context
import android.os.Bundle
import android.util.Log
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
import javax.inject.Inject

class EventMapFragment: Fragment(R.layout.fragment_event_map) {
    private val binding: FragmentEventMapBinding by viewBinding(FragmentEventMapBinding::bind)
    @Inject
    lateinit var viewModelFactory: ViewModelFactory
    private val viewModel: EventInfoViewModel by viewModels(
        ownerProducer = { requireActivity() },
        factoryProducer = { viewModelFactory }
    )

    private val args: EventMapFragmentArgs by navArgs()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val eventIdString = args.eventId

        val displayMetrics = resources.displayMetrics
        val screenHeight = displayMetrics.heightPixels
        val params = view.layoutParams
        params.height = (screenHeight * 0.65).toInt()
        view.layoutParams = params

        try {
            if (!eventIdString.isNullOrEmpty()) {
                try {
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
        val devMapUrl = mapUrl.replace(
            "http://localhost:8080",
            "https://eventdesigner.alexeypostnov.ru/api"
        )

        binding.mapView.load(devMapUrl) {
            crossfade(true)
            placeholder(R.drawable.card_image)
            memoryCachePolicy(CachePolicy.ENABLED)
            diskCachePolicy(CachePolicy.ENABLED)
            transformations(RoundedCornersTransformation(16f))
            listener(
                onSuccess = { _, _ ->
                    setupPhotoView()
                },
                onError = { _, throwable ->
                    showErrorDialog("Ошибка загрузки карты: ${throwable.throwable.message}")
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