export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      todo_lists: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          user_id: string | null
          todos: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          user_id?: string | null
          todos: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          user_id?: string | null
          todos?: Json
        }
      }
    }
  }
}