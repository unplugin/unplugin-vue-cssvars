export function runAsyncTaskList(
  taskNum: number,
  taskFunc: (index: number) => Promise<Record<any, any> | void>) {
  const taskList = [] as Array<Promise<any>>
  for (let i = 0; i < taskNum; i++) {
    taskList.push(new Promise((resolve) => {
      resolve(taskFunc(i))
    }))
  }
  return taskList
}
