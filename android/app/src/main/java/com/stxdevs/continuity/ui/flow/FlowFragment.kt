package com.stxdevs.continuity.ui.flow

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.stxdevs.continuity.R
import com.stxdevs.continuity.model.Task

class FlowFragment : Fragment() {

    private lateinit var etTaskTitle: EditText
    private lateinit var btnAddTask: Button
    private lateinit var rvTasks: RecyclerView
    private lateinit var adapter: TaskAdapter
    
    private val firestore = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val root = inflater.inflate(R.layout.fragment_flow, container, false)
        
        etTaskTitle = root.findViewById(R.id.etTaskTitle)
        btnAddTask = root.findViewById(R.id.btnAddTask)
        rvTasks = root.findViewById(R.id.rvTasks)
        
        setupTaskList()
        
        btnAddTask.setOnClickListener {
            addTask()
        }

        return root
    }
    
    private fun addTask() {
        val title = etTaskTitle.text.toString().trim()
        if (title.isEmpty()) return
        
        val uid = auth.currentUser?.uid ?: return
        
        val task = Task(title = title)
        
        firestore.collection("users").document(uid).collection("tasks")
            .add(task)
            .addOnSuccessListener {
                etTaskTitle.setText("")
                Toast.makeText(requireContext(), "Task added", Toast.LENGTH_SHORT).show()
            }
            .addOnFailureListener {
                Toast.makeText(requireContext(), "Failed to add task", Toast.LENGTH_SHORT).show()
            }
    }
    
    private fun setupTaskList() {
        rvTasks.layoutManager = LinearLayoutManager(requireContext())
        
        adapter = TaskAdapter(emptyList()) { task, isChecked ->
            updateTaskStatus(task, isChecked)
        }
        rvTasks.adapter = adapter
        
        val uid = auth.currentUser?.uid ?: return
        
        firestore.collection("users").document(uid).collection("tasks")
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
                    adapter.updateData(tasks)
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
}
