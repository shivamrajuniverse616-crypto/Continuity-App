package com.stxdevs.continuity.ui.pulse

import android.text.format.DateFormat
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.stxdevs.continuity.R
import com.stxdevs.continuity.model.Pulse
import java.util.Locale

class PulseAdapter(private var pulses: List<Pulse>) :
    RecyclerView.Adapter<PulseAdapter.PulseViewHolder>() {

    class PulseViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val ivMoodIcon: ImageView = view.findViewById(R.id.ivMoodIcon)
        val tvMoodTitle: TextView = view.findViewById(R.id.tvMoodTitle)
        val tvMoodNote: TextView = view.findViewById(R.id.tvMoodNote)
        val tvTimestamp: TextView = view.findViewById(R.id.tvTimestamp)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PulseViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_pulse, parent, false)
        return PulseViewHolder(view)
    }

    override fun onBindViewHolder(holder: PulseViewHolder, position: Int) {
        val pulse = pulses[position]
        holder.tvMoodTitle.text = pulse.mood
        holder.tvMoodNote.text = pulse.note
        
        val date = pulse.timestamp.toDate()
        val formattedTime = DateFormat.format("h:mm a", date).toString()
        holder.tvTimestamp.text = formattedTime

        // Style based on mood
        val context = holder.itemView.context
        when (pulse.mood) {
            "High" -> {
                holder.ivMoodIcon.setColorFilter(ContextCompat.getColor(context, R.color.green_600))
                holder.ivMoodIcon.background?.setTint(ContextCompat.getColor(context, R.color.green_100))
            }
            "Neutral" -> {
                holder.ivMoodIcon.setColorFilter(ContextCompat.getColor(context, R.color.yellow_600))
                holder.ivMoodIcon.background?.setTint(ContextCompat.getColor(context, R.color.yellow_100))
            }
            "Low" -> {
                holder.ivMoodIcon.setColorFilter(ContextCompat.getColor(context, R.color.red_600))
                holder.ivMoodIcon.background?.setTint(ContextCompat.getColor(context, R.color.red_100))
            }
        }
    }

    override fun getItemCount(): Int = pulses.size
    
    fun updateData(newPulses: List<Pulse>) {
        pulses = newPulses
        notifyDataSetChanged()
    }
}
