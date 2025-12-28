package com.stxdevs.continuity.ui.home

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.stxdevs.continuity.ProfileActivity
import com.stxdevs.continuity.R
import com.stxdevs.continuity.model.Goal
import com.stxdevs.continuity.model.Habit
import com.stxdevs.continuity.model.Pulse
import com.stxdevs.continuity.model.Task
import com.stxdevs.continuity.ui.flow.TaskAdapter

class HomeFragment : Fragment() {

    private lateinit var firestore: FirebaseFirestore
    private lateinit var auth: FirebaseAuth

    // Pulse Views
    private lateinit var moodLow: ImageView
    private lateinit var moodNeutral: ImageView
    private lateinit var moodHigh: ImageView
    private lateinit var layoutPulseFeedback: LinearLayout
    private lateinit var tvPulseStatus: TextView

    // Flow Views
    private lateinit var tvFlowCount: TextView
    private lateinit var etQuickTask: EditText
    private lateinit var btnAddQuickTask: ImageView
    private lateinit var rvFlowList: RecyclerView
    private lateinit var flowAdapter: TaskAdapter

    // Sequence Views
    private lateinit var rvSequenceList: RecyclerView
    private lateinit var habitAdapter: HabitAdapter

    // Horizon Views
    private lateinit var rvHorizonList: RecyclerView
    private lateinit var goalAdapter: GoalAdapter
    
    // Avatar
    private lateinit var ivUserAvatar: ImageView

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val root = inflater.inflate(R.layout.fragment_home, container, false)
        
        firestore = FirebaseFirestore.getInstance()
        auth = FirebaseAuth.getInstance()

        initializeViews(root)
        setupPulse()
        setupFlow()
        setupSequence()
        setupHorizon()
        setupAvatar()

        return root
    }

    private fun initializeViews(root: View) {
        // Pulse
        moodLow = root.findViewById(R.id.moodLow)
        moodNeutral = root.findViewById(R.id.moodNeutral)
        moodHigh = root.findViewById(R.id.moodHigh)
        layoutPulseFeedback = root.findViewById(R.id.layoutPulseFeedback)
        tvPulseStatus = root.findViewById(R.id.tvPulseStatus)
        layoutPulseFeedback.visibility = View.GONE // Hide initially

        // Flow
        tvFlowCount = root.findViewById(R.id.tvFlowCount)
        etQuickTask = root.findViewById(R.id.etQuickTask)
        btnAddQuickTask = root.findViewById(R.id.btnAddQuickTask)
        rvFlowList = root.findViewById(R.id.rvFlowList)

        // Sequence
        rvSequenceList = root.findViewById(R.id.rvSequenceList)

        // Horizon
        rvHorizonList = root.findViewById(R.id.rvHorizonList)
        
        // Avatar
        ivUserAvatar = root.findViewById(R.id.ivUserAvatar)
    }
    
    private fun setupAvatar() {
        ivUserAvatar.setOnClickListener {
            startActivity(Intent(requireContext(), ProfileActivity::class.java))
        }
    }

    // --- PULSE LOGIC ---
    private fun setupPulse() {
        moodLow.setOnClickListener { logPulse("Low", "Drained ⛈️") }
        moodNeutral.setOnClickListener { logPulse("Neutral", "Feeling decent 😛") }
        moodHigh.setOnClickListener { logPulse("High", "Energized ⚡") }
    }

    private fun logPulse(mood: String, statusText: String) {
        val uid = auth.currentUser?.uid ?: return
        val pulse = Pulse(mood = mood, note = "Quick Log")

        // Visual Feedback immediately
        tvPulseStatus.text = statusText
        layoutPulseFeedback.visibility = View.VISIBLE
        
        // Tint icons to show selection (reset others)
        resetMoodIcons()
        when (mood) {
            "Low" -> moodLow.setColorFilter(ContextCompat.getColor(requireContext(), R.color.red_600))
            "Neutral" -> moodNeutral.setColorFilter(ContextCompat.getColor(requireContext(), R.color.pastel_green_text))
            "High" -> moodHigh.setColorFilter(ContextCompat.getColor(requireContext(), R.color.pastel_orange_text))
        }

        firestore.collection("users").document(uid).collection("pulses")
            .add(pulse)
            .addOnFailureListener {
                Toast.makeText(context, "Failed to log pulse", Toast.LENGTH_SHORT).show()
            }
    }
    
    private fun resetMoodIcons() {
        val gray = 0xFF9CA3AF.toInt()
        moodLow.setColorFilter(gray)
        moodNeutral.setColorFilter(gray)
        moodHigh.setColorFilter(gray)
    }

    // --- FLOW LOGIC ---
    private fun setupFlow() {
        rvFlowList.layoutManager = LinearLayoutManager(context)
        flowAdapter = TaskAdapter(emptyList()) { task, isChecked ->
             updateTaskStatus(task, isChecked)
        }
        rvFlowList.adapter = flowAdapter

        val uid = auth.currentUser?.uid ?: return
        
        // Fetch pending tasks
        firestore.collection("users").document(uid).collection("tasks")
            .whereEqualTo("isCompleted", false)
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .addSnapshotListener { value, error ->
                if (error != null) return@addSnapshotListener
                if (value != null) {
                    val tasks = ArrayList<Task>()
                    for (doc in value) {
                        val task = doc.toObject(Task::class.java)
                        task.id = doc.id
                        tasks.add(task)
                    }
                    flowAdapter.updateData(tasks)
                    tvFlowCount.text = "${tasks.size} Pending"
                }
            }
            
        btnAddQuickTask.setOnClickListener {
            val title = etQuickTask.text.toString().trim()
            if (title.isNotEmpty()) {
                val task = Task(title = title)
                firestore.collection("users").document(uid).collection("tasks").add(task)
                etQuickTask.setText("")
            }
        }
    }
    
    private fun updateTaskStatus(task: Task, isCompleted: Boolean) {
      val uid = auth.currentUser?.uid ?: return
      if (task.id.isEmpty()) return
      firestore.collection("users").document(uid).collection("tasks")
          .document(task.id)
          .update("isCompleted", isCompleted)
    }

    // --- SEQUENCE LOGIC ---
    private fun setupSequence() {
        rvSequenceList.layoutManager = LinearLayoutManager(context)
        habitAdapter = HabitAdapter(emptyList()) { habit, isChecked ->
             // Update habit status
             val uid = auth.currentUser?.uid ?: return@HabitAdapter
             if (habit.id.isNotEmpty()) {
                 firestore.collection("users").document(uid).collection("habits")
                     .document(habit.id).update("isCompleted", isChecked)
             }
        }
        rvSequenceList.adapter = habitAdapter
        
        val uid = auth.currentUser?.uid ?: return
         firestore.collection("users").document(uid).collection("habits")
            .orderBy("timestamp", Query.Direction.ASCENDING)
            .addSnapshotListener { value, error ->
                if (value != null) {
                    val habits = ArrayList<Habit>()
                    for (doc in value) {
                        val h = doc.toObject(Habit::class.java)
                        h.id = doc.id
                        habits.add(h)
                    }
                    if (habits.isEmpty()) {
                        // Create dummy habits if empty for demo
                        createDummyHabits(uid)
                    } else {
                        habitAdapter.updateData(habits)
                    }
                }
            }
    }
    
    private fun createDummyHabits(uid: String) {
        val h1 = Habit(title = "Read 2 pages", fireCount = 2)
        val h2 = Habit(title = "Morning Meditation", fireCount = 5)
        firestore.collection("users").document(uid).collection("habits").add(h1)
        firestore.collection("users").document(uid).collection("habits").add(h2)
    }

    // --- HORIZON LOGIC ---
    private fun setupHorizon() {
        rvHorizonList.layoutManager = LinearLayoutManager(context, LinearLayoutManager.HORIZONTAL, false)
        goalAdapter = GoalAdapter(emptyList())
        rvHorizonList.adapter = goalAdapter
        
        val uid = auth.currentUser?.uid ?: return
         firestore.collection("users").document(uid).collection("goals")
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .addSnapshotListener { value, error ->
                if (value != null) {
                    val goals = ArrayList<Goal>()
                    for (doc in value) {
                        val g = doc.toObject(Goal::class.java)
                        g.id = doc.id
                        goals.add(g)
                    }
                    if (goals.isEmpty()) {
                        createDummyGoals(uid)
                    } else {
                        goalAdapter.updateData(goals)
                    }
                }
            }
    }
    
    private fun createDummyGoals(uid: String) {
        val g1 = Goal(title = "Watch Odyssey", subtitle = "in IMAX", imageRes = "onboarding_focus")
        val g2 = Goal(title = "Visit Japan", subtitle = "Spring 2025", imageRes = "onboarding_vision")
        firestore.collection("users").document(uid).collection("goals").add(g1)
        firestore.collection("users").document(uid).collection("goals").add(g2)
    }
}
