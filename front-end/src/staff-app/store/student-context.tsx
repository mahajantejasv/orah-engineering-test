import React, { useReducer, useState } from "react"
import { Person } from "shared/models/person"
import { RolllStateType } from "shared/models/roll"
import { ToolbarAction } from "staff-app/daily-care/home-board.page"

export enum StudentActionFieldsEnum {
  addStudents = "addStudents",
  firstName = "firstName",
  lastName = "lastName",
  ascendingOrder = "ascendingOrder",
  descendingOrder = "descendingOrder",
  sort = "sort",
  roll = "roll",
  search = "search",
}

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

const StudentContext = React.createContext({
  studentState: _initStudentState,
  saveStudentData: (students: Person[]) => {},
  handleToolbarAction: (action: ToolbarAction) => {},
  switchRollStateForStudent: (studentId: number, rollState: RolllStateType) => {},
})

const studentReducerFn = (state: StudentStateModel = _initStudentState, action: SortActionModel): StudentStateModel => {
  if (action.type === StudentActionFieldsEnum.addStudents) return { students: action.students, sortOrder: action.sortOrder, fieldName: action.fieldName }
  if (action.type === StudentActionFieldsEnum.sort) return { students: action.students, sortOrder: action.sortOrder, fieldName: action.fieldName }
  if (action.type === StudentActionFieldsEnum.search) return { students: action.students, sortOrder: action.sortOrder, fieldName: action.fieldName }
  return state
}

export const StudentContextProvider = (props: any) => {
  let students: Person[] = []
  const [studentState, studentDispatcherFn] = useReducer(studentReducerFn, _initStudentState)
  
  const saveStudentData = (studentList: Person[]) => {
    students = studentList ? studentList : []
    studentDispatcherFn({
      type: StudentActionFieldsEnum.addStudents,
      students: students,
      fieldName: studentState.fieldName,
      sortOrder: studentState.sortOrder,
    })
  }

  const handleToolbarAction = (action: ToolbarAction) => {
    if (action.type === StudentActionFieldsEnum.sort) {
      studentDispatcherFn({
        type: StudentActionFieldsEnum.sort,
        fieldName: action.payload.field,
        sortOrder: action.payload.order,
        students: filterStudentData(action),
      })
    }

    if (action.type === StudentActionFieldsEnum.search) {
      studentDispatcherFn({
        type: StudentActionFieldsEnum.search,
        fieldName: action.payload.field,
        sortOrder: action.payload.order,
        students: filterStudentData(action),
      })
    }
  }

  const filterStudentData = (action: ToolbarAction) => {
    let sortedData = students
    if (action.payload.field != "") sortedData = sortStudentsByFieldName(action.payload.field, action.payload.order)
    return action.payload.searchText
      ? sortedData.filter((student: Person) => {
          return (
            student.first_name.toLowerCase().includes(action.payload.searchText.toLowerCase()) || student.last_name.toLowerCase().includes(action.payload.searchText.toLowerCase())
          )
        })
      : sortedData
  }

  const sortStudentsByFieldName = (fieldName: string, sortOrder: string) => {
    return fieldName === StudentActionFieldsEnum.firstName
      ? sortStudentsByFirstName(sortOrder)
      : fieldName === StudentActionFieldsEnum.lastName
      ? sortStudentByLastName(sortOrder)
      : studentState.students
  }

  const sortStudentsByFirstName = (sortOrder: string) => {
    if (sortOrder === StudentActionFieldsEnum.descendingOrder) {
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
    if (sortOrder === StudentActionFieldsEnum.descendingOrder) {
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

  const handleSwitchRollStateForStudent = (studentId: number, rollState: RolllStateType) => {
    let students = [...studentState.students]
    let index = students.findIndex((student) => student.id === studentId)
    students[index].roll_State = rollState
    saveStudentData(students);
  }

  return (
    <StudentContext.Provider
      value={{
        studentState: studentState,
        saveStudentData: saveStudentData,
        handleToolbarAction: handleToolbarAction,
        switchRollStateForStudent: handleSwitchRollStateForStudent,
      }}
    >
      {props.children}
    </StudentContext.Provider>
  )
}
export default StudentContext
