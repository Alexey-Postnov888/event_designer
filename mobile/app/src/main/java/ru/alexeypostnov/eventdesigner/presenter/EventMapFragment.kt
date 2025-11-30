package ru.alexeypostnov.eventdesigner.presenter

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.navArgs
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import dev.androidbroadcast.vbpd.viewBinding
import ru.alexeypostnov.eventdesigner.R
import ru.alexeypostnov.eventdesigner.databinding.FragmentEventMapBinding

class EventMapFragment: Fragment(R.layout.fragment_event_map) {
    private val binding: FragmentEventMapBinding by viewBinding(FragmentEventMapBinding::bind)

    private val args: EventMapFragmentArgs by navArgs()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupPhotoView()
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
}