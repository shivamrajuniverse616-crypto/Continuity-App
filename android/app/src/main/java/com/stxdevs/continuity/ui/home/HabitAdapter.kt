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
        val tvTitle: TextView = view.findViewById(R.id.tvTaskTitle)
        val cbCompleted: CheckBox = view.findViewById(R.id.cbTaskCompleted)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): HabitViewHolder {
        // Reuse item_task for simplicity for now, or create separate one
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_task, parent, false)
        return HabitViewHolder(view)
    }

    override fun onBindViewHolder(holder: HabitViewHolder, position: Int) {
        val habit = habits[position]
        
        holder.tvTitle.text = habit.title
        holder.cbCompleted.isChecked = habit.isCompleted
        
        holder.cbCompleted.setOnCheckedChangeListener { _, isChecked ->
            onHabitChecked(habit, isChecked)
        }
    }

    override fun getItemCount() = habits.size
    
    fun updateData(newHabits: List<Habit>) {
        habits = newHabits
        notifyDataSetChanged()
    }
}
