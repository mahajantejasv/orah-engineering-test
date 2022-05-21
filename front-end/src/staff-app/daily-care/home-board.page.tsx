import React, { useState, useEffect, useReducer, useRef, useCallback } from "react"
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
  search = "search",
}

const reducerFn = (state: StudentStateModel = _initStudentState, action: SortActionModel): StudentStateModel => {
  if (action.type === studentActionFieldsEnum.addStudents) return { students: action.students, sortOrder: action.sortOrder, fieldName: action.fieldName }
  if (action.type === studentActionFieldsEnum.sort) return { students: action.students, sortOrder: action.sortOrder, fieldName: action.fieldName }
  if (action.type === studentActionFieldsEnum.search) return { students: action.students, sortOrder: action.sortOrder, fieldName: action.fieldName }

  return state
}

export const HomeBoardPage: React.FC = () => {
  let students: Person[] = []
  const [studentState, dispatcherFn] = useReducer(reducerFn, _initStudentState)
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ success: boolean; students: Person[] }>({ url: "get-homeboard-students" })

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    if (data && data.success) {
      students = data?.students ? data?.students : []
      dispatcherFn({
        type: studentActionFieldsEnum.addStudents,
        students: students,
        fieldName: "",
        sortOrder: "",
      })
    }
  }, [data?.success])

  const onToolbarAction = useCallback((action: ToolbarAction) => {
    if (action.type === studentActionFieldsEnum.roll) {
      setIsRollMode(true)
    }
    if (action.type === studentActionFieldsEnum.sort) {
      dispatcherFn({
        type: studentActionFieldsEnum.sort,
        fieldName: action.payload.field,
        sortOrder: action.payload.order,
        students: filterStudentData(action),
      })
    }

    if (action.type === studentActionFieldsEnum.search) {
      dispatcherFn({
        type: studentActionFieldsEnum.search,
        fieldName: action.payload.field,
        sortOrder: action.payload.order,
        students: filterStudentData(action),
      })
    }
  }, [])

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }
  }

  const filterStudentData = (action: ToolbarAction) => {
    let sortedData = students
    if (action.payload.field != "") sortedData = sortStudentsByFieldName(action.payload.field, action.payload.order)
    return action.payload.searchText
      ? sortedData.filter((student: Person) => {
          return student.first_name.toLowerCase().includes(action.payload.searchText.toLowerCase()) || 
          student.last_name.toLowerCase().includes(action.payload.searchText.toLowerCase())
        })
      : sortedData
  }

  const sortStudentsByFieldName = (fieldName: string, sortOrder: string) => {
    return fieldName === studentActionFieldsEnum.firstName
      ? sortStudentsByFirstName(sortOrder)
      : fieldName === studentActionFieldsEnum.lastName
      ? sortStudentByLastName(sortOrder)
      : studentState.students
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
  payload: {
    field: string
    order: string
    searchText: string
  }
}
interface ToolbarProps {
  onItemClick: (action: ToolbarAction) => void
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick } = props
  const [searchValue, setSearchValue] = useState("")
  const [sortFieldName, setSortFieldName] = useState("")
  const [firstNameSortOrder, setFirstNameSortOrder] = useState("")
  const [lastNameSortOrder, setLastNameSortOrder] = useState("")

  useEffect(() => {
    let timer = setTimeout(() => {
        onItemClick({
          type: studentActionFieldsEnum.search,
          payload: {
            field: sortFieldName,
            order: sortFieldName === studentActionFieldsEnum.firstName ? firstNameSortOrder : sortFieldName === studentActionFieldsEnum.lastName ? lastNameSortOrder : "",
            searchText: searchValue,
          },
        })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [searchValue, onItemClick])

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
        payload: {
          field: fieldName,
          order: order,
          searchText: searchValue,
        },
      })
      setFirstNameSortOrder(order)
      setLastNameSortOrder("")
    } else {
      let order =
        lastNameSortOrder === ""
          ? studentActionFieldsEnum.ascendingOrder
          : lastNameSortOrder === studentActionFieldsEnum.ascendingOrder
          ? studentActionFieldsEnum.descendingOrder
          : studentActionFieldsEnum.ascendingOrder
      onItemClick({
        type: studentActionFieldsEnum.sort,
        payload: {
          field: fieldName,
          order: order,
          searchText: searchValue,
        },
      })
      setLastNameSortOrder(order)
      setFirstNameSortOrder("")
    }
    setSortFieldName(fieldName)
  }

  const searchChaneHandler = (event: any) => {
    setSearchValue((prevState) => {
      return event.target.value
    })
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
        {lastNameSortOrder === studentActionFieldsEnum.ascendingOrder ? (
          <FontAwesomeIcon icon="sort-down" />
        ) : lastNameSortOrder === studentActionFieldsEnum.descendingOrder ? (
          <FontAwesomeIcon icon="sort-up" />
        ) : (
          ""
        )}
      </S.Button>
      <div>
        <input type={"text"} placeholder="Search.." onChange={searchChaneHandler} />
      </div>
      <S.Button
        onClick={() =>
          onItemClick({
            type: studentActionFieldsEnum.roll,
            payload: {
              field: sortFieldName,
              order: sortFieldName === studentActionFieldsEnum.firstName ? firstNameSortOrder : sortFieldName === studentActionFieldsEnum.lastName ? lastNameSortOrder : "",
              searchText: searchValue,
            },
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
  Input: styled.input`
    display: flex;
    border-radius: ${BorderRadius.default};
    min-height: 20px;
  `,
}
