import React, { useState, useEffect, useReducer } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"

interface StudentStateModel {
  students: Person[]
  fieldName: string
  sortOrder: string
}

interface SortActionModel {
  type: string
  fieldName: string
  sortOrder: string
  students: Person[]
}

const _initStudentState: StudentStateModel = {
  students: [],
  sortOrder: "",
  fieldName: "",
}

enum studentActionFieldsEnum {
  addStudents = "addStudents",
  firstName = "firstName",
  lastName = "lastName",
  ascendingOrder = "ascendingOrder",
  descendingOrder = "descendingOrder",
  sort = "sort",
  roll = "roll"
}
const reducerFn = (state: StudentStateModel = _initStudentState, action: SortActionModel): StudentStateModel => {
  if (action.type === studentActionFieldsEnum.addStudents.toString()) return { students: action.students, sortOrder: action.sortOrder, fieldName: action.fieldName }
  if (action.type === studentActionFieldsEnum.sort.toString()) {
    if (action.fieldName === studentActionFieldsEnum.firstName.toString() && action.sortOrder === studentActionFieldsEnum.descendingOrder.toString())
      return { students: action.students, sortOrder: studentActionFieldsEnum.descendingOrder.toString(), fieldName: studentActionFieldsEnum.firstName.toString() }
    if (action.fieldName === studentActionFieldsEnum.firstName.toString() && action.sortOrder === studentActionFieldsEnum.ascendingOrder.toString())
      return { students: action.students, sortOrder: studentActionFieldsEnum.ascendingOrder.toString(), fieldName: studentActionFieldsEnum.firstName.toString() }
    if (action.fieldName === studentActionFieldsEnum.lastName.toString() && action.sortOrder === studentActionFieldsEnum.descendingOrder.toString())
      return { students: action.students, sortOrder: studentActionFieldsEnum.descendingOrder.toString(), fieldName: studentActionFieldsEnum.firstName.toString() }
    if (action.fieldName === studentActionFieldsEnum.lastName.toString() && action.sortOrder === studentActionFieldsEnum.ascendingOrder.toString())
      return { students: action.students, sortOrder: studentActionFieldsEnum.ascendingOrder.toString(), fieldName: studentActionFieldsEnum.lastName.toString() }
  }
  return _initStudentState
}

export const HomeBoardPage: React.FC = () => {
  const [studentState, dispatcherFn] = useReducer(reducerFn, _initStudentState)
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    dispatcherFn({
      type: studentActionFieldsEnum.addStudents.toString(),
      students: data?.students ? data?.students : [],
      fieldName: "",
      sortOrder: "",
    })
  }, [data?.students])

  const onToolbarAction = (action: ToolbarAction) => {
    if (action.type === studentActionFieldsEnum.roll.toString()) {
      setIsRollMode(true)
    }
    if (action.type === studentActionFieldsEnum.sort.toString()) {
      dispatcherFn({
        type: studentActionFieldsEnum.sort.toString(),
        fieldName: action.field,
        sortOrder: action.order,
        students: sortStudentsByFieldName(action.field, action.order),
      })
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }
  }

  const sortStudentsByFieldName = (fieldName: string, sortOrder: string) => { 
    return (fieldName === studentActionFieldsEnum.firstName.toString()) ?
    sortStudentsByFirstName(sortOrder) : sortStudentByLastName(sortOrder) 

  }

  const sortStudentsByFirstName = (sortOrder: string) => {
    if (sortOrder === studentActionFieldsEnum.descendingOrder.toString()) {
      return studentState.students.sort((a: Person, b: Person) => {
        if (a.first_name < b.first_name) {
          return 1
        }
        if (a.first_name > b.first_name) {
          return -1
        }
        return 0
      })
    } else {
      return studentState.students.sort((a: Person, b: Person) => {
        if (a.first_name < b.first_name) {
          return -1
        }
        if (a.first_name > b.first_name) {
          return 1
        }
        return 0
      })
    }
  }

  
  const sortStudentByLastName = (sortOrder: string) => {
    if (sortOrder === studentActionFieldsEnum.descendingOrder.toString()) {
      return studentState.students.sort((a: Person, b: Person) => {
        if (a.last_name < b.last_name) {
          return 1
        }
        if (a.last_name > b.last_name) {
          return -1
        }
        return 0
      })
    } else {
      return studentState.students.sort((a: Person, b: Person) => {
        if (a.last_name < b.last_name) {
          return -1
        }
        if (a.last_name > b.last_name) {
          return 1
        }
        return 0
      })
    }
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && studentState && studentState.students && (
          <>
            {studentState.students.map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} />
            ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} />
    </>
  )
}

interface ToolbarAction {
  type: string
  field: string
  order: string
}
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick } = props
  return (
    <S.ToolbarContainer>
      <S.Button onClick={() => onItemClick({ 
        type: studentActionFieldsEnum.sort.toString(),
        field: studentActionFieldsEnum.firstName.toString(), 
        order: studentActionFieldsEnum.descendingOrder.toString() })}>First Name</S.Button>
      <S.Button onClick={() => onItemClick({ 
        type: studentActionFieldsEnum.sort.toString(),
        field: studentActionFieldsEnum.lastName.toString(), 
        order: studentActionFieldsEnum.descendingOrder.toString() })}>Last Name</S.Button>
      <div>Search</div>
      <S.Button onClick={() => onItemClick({ 
        type: studentActionFieldsEnum.roll.toString(),
        field: "", 
        order: ""
       })}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
}
