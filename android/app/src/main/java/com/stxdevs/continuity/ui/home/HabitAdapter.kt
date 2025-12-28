package com.stxdevs.continuity.ui.home

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.CheckBox
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.stxdevs.continuity.R
import com.stxdevs.continuity.model.Habit

class HabitAdapter(
    private var habits: List<Habit>,
    private val onHabitChecked: (Habit, Boolean) -> Unit
) : RecyclerView.Adapter<HabitAdapter.HabitViewHolder>() {

    class HabitViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvTitle: TextView = view.findViewById(R.id.tvCommonTitle) // We will create a generic item layout or reuse
        val cbCompleted: CheckBox = view.findViewById(R.id.cbCommonCompleted)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): HabitViewHolder {
        // Reuse item_task for simplicity for now, or create separate one
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_task, parent, false)
        return HabitViewHolder(view)
    }

    override fun onBindViewHolder(holder: HabitViewHolder, position: Int) {
        val habit = habits[position]
        // Bind logic... reusing item_task IDs which are tvTaskTitle and cbTaskCompleted
        val titleView = holder.itemView.findViewById<TextView>(R.id.tvTaskTitle)
        val checkBox = holder.itemView.findViewById<CheckBox>(R.id.cbTaskCompleted)
        
        titleView.text = habit.title
        checkBox.isChecked = habit.isCompleted
        
        checkBox.setOnCheckedChangeListener { _, isChecked ->
            onHabitChecked(habit, isChecked)
        }
    }

    override fun getItemCount() = habits.size
    
    fun updateData(newHabits: List<Habit>) {
        habits = newHabits
        notifyDataSetChanged()
    }
}
