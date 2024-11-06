// Assuming you have a `manualTasks` array and `userManualTasks` for tracking completed tasks.
// Replace `manualTasks` and `userManualTasks` with your actual data source.

{manualTasks
  .sort((a, b) => a.id - b.id) // Sort tasks by id in ascending order
  .filter(task => {
    // Find the user task to check completion status
    const userTask = userManualTasks.find(t => t.taskId === task.id);
    const isTaskCompleted = userTask ? userTask.completed : false;

    // Additional check for WhatsApp-specific task
    const isWhatsAppTask = task.title === "Share on WhatsApp Status";
    const isTaskCompletedToday = lastShareDate === new Date().toISOString().split('T')[0];
    const isTaskCompleted2 = isWhatsAppTask && isTaskCompletedToday;

    // Only include tasks that are not completed
    return !isTaskCompleted2;
  })
  .map(task => {
    const userTask = userManualTasks.find(t => t.taskId === task.id);
    const isTaskCompleted = userTask ? userTask.completed : false;

    // Check if task is for WhatsApp and was completed today
    const isWhatsAppTask = task.title === "Share on WhatsApp Status";
    const isTaskCompletedToday = lastShareDate === new Date().toISOString().split('T')[0];
    const isTaskCompleted2 = isWhatsAppTask && isTaskCompletedToday;

    return (
      <div key={task.id} className="w-full rounded-[16px] py-3 flex items-center justify-between space-x-1">
        <div className='w-fit pr-2'>
          <div className='flex items-center justify-center bg-[#1f2023] h-[45px] w-[45px] rounded-full p-1'>
            <img alt="engy" src={task.icon} className='w-[20px]' />
          </div>
        </div>
        <div className={`flex flex-1 h-full flex-col justify-center relative`}>
          <div className={`${showVerifyButtons[task.id] ? 'w-[90%]' : 'w-full'} flex flex-col justify-between h-full space-y-1`}>
            <h1 className={`text-[15px] line-clamp-1 font-medium`}>
              {task.title}
            </h1>
            <span className='flex text-secondary items-center w-fit text-[15px]'>
              <span className=''>
                +{formatNumber(task.bonus)} $RSC
              </span>
            </span>
          </div>
        </div>

        <div className='w-fit flex items-center space-x-1 justify-end flex-wrap text-[14px] relative'>
          {/* Show 'Start' button if task has not been completed */}
          {!userTask && (
            <>
              <button
                onClick={() => performTask(task.id)}
                className={`${showVerifyButtons[task.id] ? '!w-[45px] py-[10px] !px-[6px] text-[12px] !rounded-[12px]' : ''} w-[78px] py-[10px] text-center font-semibold rounded-[30px] px-3 bg-[#1f2023] hover:bg-[#36373c] text-[#fff]`}
              >
                Start
              </button>
              {/* Show 'Check' button for tasks that are ready for verification */}
              {countdowns[task.id] === undefined && (
                <button
                  onClick={() => startCountdown(task.id)}
                  className={`${submitted[task.id] ? `!bg-[#595959cc] !text-[#fff] !w-fit` : buttonText[task.id] || `bg-btn4 text-[#000]`} ${!showVerifyButtons[task.id] ? "!bg-btn2 !text-[#888] hidden" : `bg-btn4 text-[#000]`} w-[54px] py-[10px] text-center font-semibold text-[12px] rounded-[12px] px-[8px]`}
                  disabled={!showVerifyButtons[task.id] || submitted[task.id]}
                >
                  {submitted[task.id] ? 'Checking' : buttonText[task.id] || 'Check'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  })}
