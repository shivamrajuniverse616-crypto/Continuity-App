package com.stxdevs.continuity.ui.pulse

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.stxdevs.continuity.R
import com.stxdevs.continuity.model.Pulse

class PulseFragment : Fragment() {

    private lateinit var moodLow: ImageView
    private lateinit var moodNeutral: ImageView
    private lateinit var moodHigh: ImageView
    private lateinit var etMoodNote: EditText
    private lateinit var btnLogPulse: Button
    private lateinit var rvPulseHistory: RecyclerView
    
    private var selectedMood: String = ""
    private lateinit var adapter: PulseAdapter
    private val firestore = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val root = inflater.inflate(R.layout.fragment_pulse, container, false)
        
        moodLow = root.findViewById(R.id.moodLow)
        moodNeutral = root.findViewById(R.id.moodNeutral)
        moodHigh = root.findViewById(R.id.moodHigh)
        etMoodNote = root.findViewById(R.id.etMoodNote)
        btnLogPulse = root.findViewById(R.id.btnLogPulse)
        rvPulseHistory = root.findViewById(R.id.rvPulseHistory)
        
        setupMoodSelection()
        setupPulseHistory()
        
        btnLogPulse.setOnClickListener {
            logPulse()
        }

        return root
    }

    private fun setupMoodSelection() {
        val defaultTint = ContextCompat.getColor(requireContext(), R.color.black) // actually using a gray from hex in xml usually.. let's use gray
        val grayTint = 0xFF9CA3AF.toInt()

        moodLow.setOnClickListener {
            selectMood("Low")
            resetIcons()
            moodLow.setColorFilter(ContextCompat.getColor(requireContext(), R.color.red_600))
            moodLow.scaleX = 1.2f
            moodLow.scaleY = 1.2f
        }
        
        moodNeutral.setOnClickListener {
            selectMood("Neutral")
            resetIcons()
            moodNeutral.setColorFilter(ContextCompat.getColor(requireContext(), R.color.yellow_600))
            moodNeutral.scaleX = 1.2f
            moodNeutral.scaleY = 1.2f
        }
        
        moodHigh.setOnClickListener {
            selectMood("High")
            resetIcons()
            moodHigh.setColorFilter(ContextCompat.getColor(requireContext(), R.color.green_600))
            moodHigh.scaleX = 1.2f
            moodHigh.scaleY = 1.2f
        }
    }
    
    private fun selectMood(mood: String) {
        selectedMood = mood
    }
    
    private fun resetIcons() {
        val grayTint = 0xFF9CA3AF.toInt()
        
        moodLow.setColorFilter(grayTint)
        moodLow.scaleX = 1.0f
        moodLow.scaleY = 1.0f
        
        moodNeutral.setColorFilter(grayTint)
        moodNeutral.scaleX = 1.0f
        moodNeutral.scaleY = 1.0f
        
        moodHigh.setColorFilter(grayTint)
        moodHigh.scaleX = 1.0f
        moodHigh.scaleY = 1.0f
    }
    
    private fun logPulse() {
        if (selectedMood.isEmpty()) {
            Toast.makeText(requireContext(), "Select a mood first", Toast.LENGTH_SHORT).show()
            return
        }
        
        val uid = auth.currentUser?.uid ?: return
        val note = etMoodNote.text.toString().trim()
        
        val pulse = Pulse(
            mood = selectedMood,
            note = note
        )
        
        firestore.collection("users").document(uid).collection("pulses")
            .add(pulse)
            .addOnSuccessListener {
                Toast.makeText(requireContext(), "Pulse logged", Toast.LENGTH_SHORT).show()
                etMoodNote.setText("")
                resetIcons()
                selectedMood = ""
            }
            .addOnFailureListener {
                Toast.makeText(requireContext(), "Failed to log pulse", Toast.LENGTH_SHORT).show()
            }
    }
    
    private fun setupPulseHistory() {
        rvPulseHistory.layoutManager = LinearLayoutManager(requireContext())
        adapter = PulseAdapter(emptyList())
        rvPulseHistory.adapter = adapter
        
        val uid = auth.currentUser?.uid ?: return
        
        firestore.collection("users").document(uid).collection("pulses")
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .limit(20)
            .addSnapshotListener { value, error ->
                if (error != null) {
                    return@addSnapshotListener
                }
                
                if (value != null) {
                    val pulses = value.toObjects(Pulse::class.java)
                    adapter.updateData(pulses)
                }
            }
    }
}
