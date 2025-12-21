package ru.alexeypostnov.eventdesigner

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.navigation.NavController
import androidx.navigation.findNavController
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.NavHostFragment
import dev.androidbroadcast.vbpd.viewBinding
import ru.alexeypostnov.eventdesigner.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity(R.layout.activity_main) {
    private val binding: ActivityMainBinding by viewBinding(ActivityMainBinding::bind)
    private lateinit var navController: NavController

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(binding.root)

        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.main) as? NavHostFragment
        navController = navHostFragment?.navController!!

        handleDeepLink(intent)

        navController.addOnDestinationChangedListener { _, destination, _ ->
            binding.btnToBack.visibility = if (destination.id == R.id.authFragment || destination.id == R.id.eventListFragment) {
                View.GONE
            } else {
                View.VISIBLE
            }
        }

        binding.btnToBack.setOnClickListener {
            navController.popBackStack()
        }

        ViewCompat.setOnApplyWindowInsetsListener(binding.main) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleDeepLink(intent)
    }

    private fun handleDeepLink(intent: Intent?) {
        val uri = intent?.data
        navController.handleDeepLink(intent)
    }
}