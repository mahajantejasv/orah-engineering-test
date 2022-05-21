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
  roll = "roll",
}
const reducerFn = (state: StudentStateModel = _initStudentState, action: SortActionModel): StudentStateModel => {
  if (action.type === studentActionFieldsEnum.addStudents) return { students: action.students, sortOrder: action.sortOrder, fieldName: action.fieldName }
  if (action.type === studentActionFieldsEnum.sort) {
    if (action.fieldName === studentActionFieldsEnum.firstName && action.sortOrder === studentActionFieldsEnum.descendingOrder)
      return { students: action.students, sortOrder: studentActionFieldsEnum.descendingOrder, fieldName: studentActionFieldsEnum.firstName }
    if (action.fieldName === studentActionFieldsEnum.firstName && action.sortOrder === studentActionFieldsEnum.ascendingOrder)
      return { students: action.students, sortOrder: studentActionFieldsEnum.ascendingOrder, fieldName: studentActionFieldsEnum.firstName }
    if (action.fieldName === studentActionFieldsEnum.lastName && action.sortOrder === studentActionFieldsEnum.descendingOrder)
      return { students: action.students, sortOrder: studentActionFieldsEnum.descendingOrder, fieldName: studentActionFieldsEnum.firstName }
    if (action.fieldName === studentActionFieldsEnum.lastName && action.sortOrder === studentActionFieldsEnum.ascendingOrder)
      return { students: action.students, sortOrder: studentActionFieldsEnum.ascendingOrder, fieldName: studentActionFieldsEnum.lastName }
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
    if (data && data?.students)
      dispatcherFn({
        type: studentActionFieldsEnum.addStudents,
        students: data?.students ? data?.students : [],
        fieldName: "",
        sortOrder: "",
      })
  }, [data?.students])

  const onToolbarAction = (action: ToolbarAction) => {
    if (action.type === studentActionFieldsEnum.roll) {
      setIsRollMode(true)
    }
    if (action.type === studentActionFieldsEnum.sort) {
      dispatcherFn({
        type: studentActionFieldsEnum.sort,
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
    return fieldName === studentActionFieldsEnum.firstName ? sortStudentsByFirstName(sortOrder) : sortStudentByLastName(sortOrder)
  }

  const sortStudentsByFirstName = (sortOrder: string) => {
    if (sortOrder === studentActionFieldsEnum.descendingOrder) {
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
    if (sortOrder === studentActionFieldsEnum.descendingOrder) {
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

  const [firstNameSortOrder, setFirstNameSortOrder] = useState("")
  const [lastNameNameSortOrder, setLastNameSortOrder] = useState("")

  const sortData = (fieldName: string) => {
    if (fieldName === studentActionFieldsEnum.firstName) {
      let order =
        firstNameSortOrder === ""
          ? studentActionFieldsEnum.ascendingOrder
          : firstNameSortOrder === studentActionFieldsEnum.ascendingOrder
          ? studentActionFieldsEnum.descendingOrder
          : studentActionFieldsEnum.ascendingOrder
      onItemClick({
        type: studentActionFieldsEnum.sort,
        field: fieldName,
        order: order,
      })
      setFirstNameSortOrder(order)
    } else {
      let order =
        lastNameNameSortOrder === ""
          ? studentActionFieldsEnum.ascendingOrder
          : lastNameNameSortOrder === studentActionFieldsEnum.ascendingOrder
          ? studentActionFieldsEnum.descendingOrder
          : studentActionFieldsEnum.ascendingOrder
      onItemClick({
        type: studentActionFieldsEnum.sort,
        field: fieldName,
        order: order,
      })
      setLastNameSortOrder(order)
    }
  }

  return (
    <S.ToolbarContainer>
      <S.Button onClick={() => sortData(studentActionFieldsEnum.firstName)}>
        <span>First Name &nbsp;</span>
        {firstNameSortOrder === studentActionFieldsEnum.ascendingOrder ? (
          <FontAwesomeIcon icon="sort-down" />
        ) : firstNameSortOrder === studentActionFieldsEnum.descendingOrder ? (
          <FontAwesomeIcon icon="sort-up" />
        ) : (
          ""
        )}
      </S.Button>
      <S.Button onClick={() => sortData(studentActionFieldsEnum.lastName)}>
        <span>Last Name &nbsp;</span>
        {lastNameNameSortOrder === studentActionFieldsEnum.ascendingOrder ? (
          <FontAwesomeIcon icon="sort-down" />
        ) : lastNameNameSortOrder === studentActionFieldsEnum.descendingOrder ? (
          <FontAwesomeIcon icon="sort-up" />
        ) : (
          ""
        )}
      </S.Button>
      <div>Search</div>
      <S.Button
        onClick={() =>
          onItemClick({
            type: studentActionFieldsEnum.roll,
            field: "",
            order: "",
          })
        }
      >
        Start Roll
      </S.Button>
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
