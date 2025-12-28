package com.stxdevs.continuity.ui.home

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.stxdevs.continuity.R
import com.stxdevs.continuity.model.Goal

class GoalAdapter(
    private var goals: List<Goal>
) : RecyclerView.Adapter<GoalAdapter.GoalViewHolder>() {

    class GoalViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        // reuse onboarding logic temporarily or generic text
        val tvTitle: TextView = view.findViewById(R.id.tvTitle)
        val tvDesc: TextView = view.findViewById(R.id.tvDescription)
        val ivImage: ImageView = view.findViewById(R.id.ivOnboardingImage)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GoalViewHolder {
        // Reusing item_onboarding for now as it has image + title + desc
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_onboarding, parent, false)
            
        // Adjust width to be card-like
        // This is a hack for speed, ideally we make item_goal.xml 
        return GoalViewHolder(view)
    }

    override fun onBindViewHolder(holder: GoalViewHolder, position: Int) {
        val goal = goals[position]
        holder.tvTitle.text = goal.title
        holder.tvDesc.text = goal.subtitle
        // Image loading logic would go here
    }

    override fun getItemCount() = goals.size
    
    fun updateData(newGoals: List<Goal>) {
        goals = newGoals
        notifyDataSetChanged()
    }
}
