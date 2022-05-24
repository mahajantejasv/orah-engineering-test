import React, { useEffect } from "react"
import styled from "styled-components"
import { BorderRadius, FontWeight, Spacing } from "shared/styles/styles"
import { useApi } from "shared/hooks/use-api"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { Activity } from "shared/models/activity"
import { Colors } from "shared/styles/colors"

export const ActivityPage: React.FC = () => {
  
  const [getStudents, data, loadState] = useApi<{ success: boolean; activity:  Activity[] }>({ url: "get-activities" })

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    if (loadState === "loaded") console.log(data)
  }, [loadState])

  return (
    <S.PageContainer>
      {loadState === "loading" && (
        <CenteredContainer>
          <FontAwesomeIcon icon="spinner" size="2x" spin />
        </CenteredContainer>
      )}

      {loadState === "loaded" && data && data.activity && (
        data.activity.map(activityLog=> {
          return (
            
            <S.Container key={Math.round(Math.random()*10000)}>
            <ActivityHeader name={activityLog.entity.name} date={activityLog.date}></ActivityHeader>
             {
               activityLog.entity && activityLog.entity.student_roll_states && activityLog.entity.student_roll_states && 
               activityLog.entity.student_roll_states.map((student) => {
                return <StudentListTile 
                  key={Math.round(Math.random()*10000)} 
                  isRollMode={true} 
                  student={student} 
                  isReadOnly={true}/>   
               })
             }
          </S.Container>
          )
        })
       
      )}

      {loadState === "error" && (
        <CenteredContainer>
          <div>Failed to load</div>
        </CenteredContainer>
      )}
    </S.PageContainer>
  )
}


interface ActivityHeaderProps {
  name: string,
  date: Date
}
const ActivityHeader: React.FC<ActivityHeaderProps> = ({name, date}) => {

  return (
    <S.ActivityHeaderContainer>
      <div>
        <span>{name}</span>
      </div>
      <div>
        <span>{ new Date(date).toLocaleString() }</span>
      </div>
    </S.ActivityHeaderContainer>
  )
}


const S = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    width: 80%;
    margin: ${Spacing.u4} auto 0;
  `,
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
  ActivityHeaderContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
}