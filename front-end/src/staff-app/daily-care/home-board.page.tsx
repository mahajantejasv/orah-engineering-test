import React, { useState, useEffect, useReducer, useRef, useCallback, useContext } from "react"
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
import StudentContext, { StudentActionFieldsEnum } from "staff-app/store/student-context"

export const HomeBoardPage: React.FC = () => {
  const context = useContext(StudentContext)
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ success: boolean; students: Person[] }>({ url: "get-homeboard-students" })

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    if (data && data.success) {
      context.saveStudentData(data?.students)
    }
  }, [data?.success])

  const onToolbarAction = useCallback((action: ToolbarAction) => {
    if (action.type === StudentActionFieldsEnum.roll) setIsRollMode(true)

    if (action.payload.field || action.payload.searchText) context.handleToolbarAction(action)
  }, [])

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") { 
      setIsRollMode(false) 
      context.clearRollState()
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

        {loadState === "loaded" && context.studentState && context.studentState.students && (
          <>
            {context.studentState.students.map((s) => (
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

export interface ToolbarAction {
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
        type: StudentActionFieldsEnum.search,
        payload: {
          field: sortFieldName,
          order: sortFieldName === StudentActionFieldsEnum.firstName ? firstNameSortOrder : sortFieldName === StudentActionFieldsEnum.lastName ? lastNameSortOrder : "",
          searchText: searchValue,
        },
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [searchValue, onItemClick])

  const sortData = (fieldName: string) => {
    if (fieldName === StudentActionFieldsEnum.firstName) {
      let order =
        firstNameSortOrder === ""
          ? StudentActionFieldsEnum.ascendingOrder
          : firstNameSortOrder === StudentActionFieldsEnum.ascendingOrder
          ? StudentActionFieldsEnum.descendingOrder
          : StudentActionFieldsEnum.ascendingOrder
      onItemClick({
        type: StudentActionFieldsEnum.sort,
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
          ? StudentActionFieldsEnum.ascendingOrder
          : lastNameSortOrder === StudentActionFieldsEnum.ascendingOrder
          ? StudentActionFieldsEnum.descendingOrder
          : StudentActionFieldsEnum.ascendingOrder
      onItemClick({
        type: StudentActionFieldsEnum.sort,
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
      <S.Button onClick={() => sortData(StudentActionFieldsEnum.firstName)}>
        <span>First Name &nbsp;</span>
        {firstNameSortOrder === StudentActionFieldsEnum.ascendingOrder ? (
          <FontAwesomeIcon icon="sort-down" />
        ) : firstNameSortOrder === StudentActionFieldsEnum.descendingOrder ? (
          <FontAwesomeIcon icon="sort-up" />
        ) : (
          ""
        )}
      </S.Button>
      <S.Button onClick={() => sortData(StudentActionFieldsEnum.lastName)}>
        <span>Last Name &nbsp;</span>
        {lastNameSortOrder === StudentActionFieldsEnum.ascendingOrder ? (
          <FontAwesomeIcon icon="sort-down" />
        ) : lastNameSortOrder === StudentActionFieldsEnum.descendingOrder ? (
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
            type: StudentActionFieldsEnum.roll,
            payload: {
              field: sortFieldName,
              order: sortFieldName === StudentActionFieldsEnum.firstName ? firstNameSortOrder : sortFieldName === StudentActionFieldsEnum.lastName ? lastNameSortOrder : "",
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
    input {
      display: flex;
      border-radius: ${BorderRadius.default};
      min-height: 20px;
    }
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
