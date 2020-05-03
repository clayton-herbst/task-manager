import React, { useEffect } from "react"
import { Container, List, Typography, Box } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import TaskBrief from "../Presentation/TaskBrief"
import { ITaskState, ITask, IReduxState, IUtilityState } from '../../schema/state'
import { connect, useSelector, batch } from "react-redux"
import { openEditModal } from "../../redux/actions/modalActions"
import { updateProgress, completeTask } from "../../redux/actions/taskActions"
import axios from "axios"
import useDebouncer from "../../hooks/useDebouncer"
import useApiAsync from "../../hooks/useApiAsync"

interface ITodoContainer {
  onProgressChange: any;
  tasks: ITaskState;
  uid: string;
  onEdit: any;
  onComplete: any;
}

const TodoContainer = (props: ITodoContainer) => {
  //const tasks = useSelector(state => state.tasks.list)
  const { updateDbTasks } = useApiAsync() // firebase function:api processor
  const updateDBAsyncDebouncer = useDebouncer(updateDbTasks, 30000); // 2 min debouncer ¿

  return (
    <Container maxWidth="md">
      <Box width="100%" display="flex" flexDirection="column" justifyContent="center">
        {props.tasks.list.map((task: ITask, index: number) => {
          if(!props.tasks.filter.search.on || (props.tasks.filter.search.on && task.filter))
            return (
              <TaskBrief
                task={task} 
                id={index} 
                key={index} 
                onEdit={(id, task) => {
                  props.onEdit(id, task)
                  updateDBAsyncDebouncer({uid: props.uid, tasks: props.tasks.list})
                }}
                onProgressChange={(id, value) => {
                  props.onProgressChange(id, value)
                  updateDBAsyncDebouncer({uid: props.uid, tasks: props.tasks.list})
                }}
                onComplete={(id) => {
                  props.onComplete(id)
                  updateDBAsyncDebouncer({uid: props.uid, tasks: props.tasks.list})
                }}
              />
            )
          else
            return null
        })}
      </Box>
    </Container> 
  )
}


const mapStateToProps = (state: IReduxState) => ({
  tasks: state.tasks,
  uid: state.utility.user.uid
})

const mapDispatchToProps = dispatch => ({
  onEdit: (id: number, task: ITask) => dispatch(openEditModal(id, task)),
  onProgressChange: (id: number = -1, value: number) => dispatch(updateProgress(id, value)),
  onComplete: (id: number) => dispatch(completeTask(id))
})

export default connect(mapStateToProps, mapDispatchToProps)(TodoContainer)


