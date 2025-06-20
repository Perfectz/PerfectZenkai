export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      exercises: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          equipment: string[] | null
          id: string
          instructions: string | null
          is_custom: boolean
          muscle_groups: string[] | null
          name: string
          type: Database["public"]["Enums"]["exercise_type"]
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          equipment?: string[] | null
          id?: string
          instructions?: string | null
          is_custom?: boolean
          muscle_groups?: string[] | null
          name: string
          type: Database["public"]["Enums"]["exercise_type"]
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          equipment?: string[] | null
          id?: string
          instructions?: string | null
          is_custom?: boolean
          muscle_groups?: string[] | null
          name?: string
          type?: Database["public"]["Enums"]["exercise_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: Database["public"]["Enums"]["goal_category"]
          color: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          target_date: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["goal_category"]
          color?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          target_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["goal_category"]
          color?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          target_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          created_at: string | null
          entry_date: string
          entry_type: Database["public"]["Enums"]["journal_entry_type"]
          evening_entry: Json | null
          id: string
          morning_entry: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entry_date: string
          entry_type: Database["public"]["Enums"]["journal_entry_type"]
          evening_entry?: Json | null
          id?: string
          morning_entry?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entry_date?: string
          entry_type?: Database["public"]["Enums"]["journal_entry_type"]
          evening_entry?: Json | null
          id?: string
          morning_entry?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          offset_minutes: number
          sent: boolean | null
          todo_id: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          offset_minutes: number
          sent?: boolean | null
          todo_id: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          offset_minutes?: number
          sent?: boolean | null
          todo_id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_todo_id_fkey"
            columns: ["todo_id"]
            isOneToOne: false
            referencedRelation: "todos"
            referencedColumns: ["id"]
          },
        ]
      }
      subtasks: {
        Row: {
          created_at: string | null
          done: boolean | null
          id: string
          text: string
          todo_id: string
        }
        Insert: {
          created_at?: string | null
          done?: boolean | null
          id?: string
          text: string
          todo_id: string
        }
        Update: {
          created_at?: string | null
          done?: boolean | null
          id?: string
          text?: string
          todo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_todo_id_fkey"
            columns: ["todo_id"]
            isOneToOne: false
            referencedRelation: "todos"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          description_format: string | null
          done: boolean | null
          due_date: string | null
          due_date_time: string | null
          goal_id: string | null
          id: string
          points: number | null
          priority: string | null
          summary: string
          text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          description_format?: string | null
          done?: boolean | null
          due_date?: string | null
          due_date_time?: string | null
          goal_id?: string | null
          id?: string
          points?: number | null
          priority?: string | null
          summary: string
          text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          description_format?: string | null
          done?: boolean | null
          due_date?: string | null
          due_date_time?: string | null
          goal_id?: string | null
          id?: string
          points?: number | null
          priority?: string | null
          summary?: string
          text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "todos_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      weight_entries: {
        Row: {
          created_at: string | null
          date_iso: string
          id: string
          kg: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_iso: string
          id?: string
          kg: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_iso?: string
          id?: string
          kg?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      weight_goals: {
        Row: {
          created_at: string | null
          goal_type: string
          id: string
          is_active: boolean | null
          starting_weight: number | null
          target_date: string | null
          target_weight: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          goal_type: string
          id?: string
          is_active?: boolean | null
          starting_weight?: number | null
          target_date?: string | null
          target_weight: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          goal_type?: string
          id?: string
          is_active?: boolean | null
          starting_weight?: number | null
          target_date?: string | null
          target_weight?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workout_entries: {
        Row: {
          calories: number | null
          created_at: string | null
          distance: number | null
          duration: number
          exercise_id: string
          exercise_name: string
          exercise_type: Database["public"]["Enums"]["exercise_type"]
          id: string
          intensity: Database["public"]["Enums"]["intensity_level"]
          notes: string | null
          reps: number | null
          sets: number | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          calories?: number | null
          created_at?: string | null
          distance?: number | null
          duration: number
          exercise_id: string
          exercise_name: string
          exercise_type: Database["public"]["Enums"]["exercise_type"]
          id?: string
          intensity: Database["public"]["Enums"]["intensity_level"]
          notes?: string | null
          reps?: number | null
          sets?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          calories?: number | null
          created_at?: string | null
          distance?: number | null
          duration?: number
          exercise_id?: string
          exercise_name?: string
          exercise_type?: Database["public"]["Enums"]["exercise_type"]
          id?: string
          intensity?: Database["public"]["Enums"]["intensity_level"]
          notes?: string | null
          reps?: number | null
          sets?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      workout_goals: {
        Row: {
          created_at: string | null
          description: string
          id: string
          is_active: boolean
          period: Database["public"]["Enums"]["workout_goal_period"]
          target: number
          type: Database["public"]["Enums"]["workout_goal_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          is_active?: boolean
          period: Database["public"]["Enums"]["workout_goal_period"]
          target: number
          type: Database["public"]["Enums"]["workout_goal_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean
          period?: Database["public"]["Enums"]["workout_goal_period"]
          target?: number
          type?: Database["public"]["Enums"]["workout_goal_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      workout_templates: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["intensity_level"]
          estimated_duration: number
          exercises: Json
          id: string
          is_custom: boolean
          name: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty: Database["public"]["Enums"]["intensity_level"]
          estimated_duration: number
          exercises: Json
          id?: string
          is_custom?: boolean
          name: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["intensity_level"]
          estimated_duration?: number
          exercises?: Json
          id?: string
          is_custom?: boolean
          name?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      daily_points_stats: {
        Row: {
          average_points: number | null
          completed_tasks: number | null
          completion_date: string | null
          total_points: number | null
          user_id: string | null
        }
        Relationships: []
      }
      user_lookup: {
        Row: {
          email: string | null
          id: string | null
          username: string | null
        }
        Insert: {
          email?: string | null
          id?: string | null
          username?: string | null
        }
        Update: {
          email?: string | null
          id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_points_summary: {
        Row: {
          average_task_points: number | null
          completed_tasks: number | null
          total_earned_points: number | null
          total_possible_points: number | null
          total_tasks: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_active_weight_goal: {
        Args: { user_uuid: string }
        Returns: {
          id: string
          target_weight: number
          goal_type: string
          target_date: string
          starting_weight: number
          created_at: string
        }[]
      }
    }
    Enums: {
      exercise_type: "cardio" | "strength" | "flexibility" | "sports" | "other"
      goal_category:
        | "health"
        | "career"
        | "learning"
        | "personal"
        | "finance"
        | "relationships"
        | "other"
      intensity_level: "light" | "moderate" | "intense"
      journal_entry_type: "morning" | "evening" | "both"
      workout_goal_period: "daily" | "weekly" | "monthly"
      workout_goal_type: "duration" | "frequency" | "calories" | "streak"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      exercise_type: ["cardio", "strength", "flexibility", "sports", "other"],
      goal_category: [
        "health",
        "career",
        "learning",
        "personal",
        "finance",
        "relationships",
        "other",
      ],
      intensity_level: ["light", "moderate", "intense"],
      journal_entry_type: ["morning", "evening", "both"],
      workout_goal_period: ["daily", "weekly", "monthly"],
      workout_goal_type: ["duration", "frequency", "calories", "streak"],
    },
  },
} as const
