import { Person } from './person';
export interface Roll {
  id: number
  name: string
  completed_at: Date
  student_roll_states: Person[]
}

export interface RollInput {
  student_roll_states: { student_id: number; roll_state: RolllStateType, first_name: string,  last_name: string, }[]
}

export type RolllStateType = "unmark" | "present" | "absent" | "late"
