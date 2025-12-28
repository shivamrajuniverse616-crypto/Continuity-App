package com.stxdevs.continuity.ui.flow

import android.graphics.Paint
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.CheckBox
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.stxdevs.continuity.R
import com.stxdevs.continuity.model.Task

class TaskAdapter(
    private var tasks: List<Task>,
    private val onTaskChecked: (Task, Boolean) -> Unit
) : RecyclerView.Adapter<TaskAdapter.TaskViewHolder>() {

    class TaskViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val cbTaskCompleted: CheckBox = view.findViewById(R.id.cbTaskCompleted)
        val tvTaskTitle: TextView = view.findViewById(R.id.tvTaskTitle)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TaskViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_task, parent, false)
        return TaskViewHolder(view)
    }

    override fun onBindViewHolder(holder: TaskViewHolder, position: Int) {
        val task = tasks[position]
        holder.tvTaskTitle.text = task.title
        
        // Remove listener temporarily to avoid trigger during binding
        holder.cbTaskCompleted.setOnCheckedChangeListener(null)
        holder.cbTaskCompleted.isChecked = task.isCompleted
        
        if (task.isCompleted) {
            holder.tvTaskTitle.paintFlags = holder.tvTaskTitle.paintFlags or Paint.STRIKE_THRU_TEXT_FLAG
            holder.tvTaskTitle.alpha = 0.5f
        } else {
            holder.tvTaskTitle.paintFlags = holder.tvTaskTitle.paintFlags and Paint.STRIKE_THRU_TEXT_FLAG.inv()
            holder.tvTaskTitle.alpha = 1.0f
        }

        holder.cbTaskCompleted.setOnCheckedChangeListener { _, isChecked ->
            onTaskChecked(task, isChecked)
        }
    }

    override fun getItemCount(): Int = tasks.size
    
    fun updateData(newTasks: List<Task>) {
        tasks = newTasks
        notifyDataSetChanged()
    }
}
