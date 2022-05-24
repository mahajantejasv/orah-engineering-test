import React, { useContext, useEffect, useState } from "react"
import { RolllStateType } from "shared/models/roll"
import { RollStateIcon } from "staff-app/components/roll-state/roll-state-icon.component"
import StudentContext from "staff-app/store/student-context"

interface Props {
  initialState?: RolllStateType
  size?: number
  studentId: number
  onStateChange?: (newState: RolllStateType) => void
  isReadOnly? : boolean
}
export const RollStateSwitcher: React.FC<Props> = ({ size = 40,studentId, onStateChange, isReadOnly= false, initialState}) => {


  const context = useContext(StudentContext)
  const [rollState, setRollState] = useState(initialState ? initialState : "unmark")

  const nextState = () => {
    const states: RolllStateType[] = ["present", "late", "absent"]
    if (rollState === "unmark" || rollState === "absent") return states[0]
    const matchingIndex = states.findIndex((s) => s === rollState)
    return matchingIndex > -1 ? states[matchingIndex + 1] : states[0]
  }

  const onClick = () => {
    if(!isReadOnly) {
      const next = nextState()
      setRollState(next)
      if (onStateChange) onStateChange(next)
      context.switchRollStateForStudent(studentId, next)
    }
  }



  return <RollStateIcon type={rollState} size={size} onClick={onClick} />
}
