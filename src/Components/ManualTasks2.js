import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, increment, getDoc  } from 'firebase/firestore';
import { db } from '../firebase/firestore'; 
import { useUser } from "../context/userContext"; 
import { IoCheckmarkCircleSharp } from 'react-icons/io5';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { CiNoWaitingSign } from "react-icons/ci";
import { differenceInDays, parseISO } from 'date-fns';




const ManualTasks = () => {
  const [showVerifyButtons, setShowVerifyButtons] = useState({});
  const [countdowns, setCountdowns] = useState({});
  const [buttonText, setButtonText] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [claiming, setClaiming] = useState({});
  const [submitted, setSubmitted] = useState({});
  const { id: userId, manualTasks, userManualTasks, setTaskPoints, setUserManualTasks, setBalance } = useUser(); // Assuming 'id' is the user's document ID in Firestore
  const [claimedBonus, setClaimedBonus] = useState(0); // New state to store the claimed bonus amount
  const [congrats, setCongrats] = useState(false);
  const userReferralCode = `https://t.me/Risingcoin_appbot?start=r${userId}\n\ `;
  const [lastShareDate, setLastShareDate] = useState(null);
  

  

  useEffect(() => {
    const fetchLastShareDate = async () => {
      try {
        const userDocRef = doc(db, 'telegramUsers', userId);
        const userDoc = await getDoc(userDocRef); // Use getDoc to retrieve the document
        setClaiming(prevState => ({ ...prevState, [9]: false }));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setLastShareDate(data.lastShareDate || null);
           console.log(lastShareDate)
          // Check if the last share date is more than a day ago
          const today = new Date();
          if (data.lastShareDate) {
            const lastShareDateObj = parseISO(data.lastShareDate);
            const daysDifference = differenceInDays(today, lastShareDateObj);
            console.log(daysDifference)
            // Call getWhatsAppTask if more than a day has passed
            saveTaskToUser2()
            if (daysDifference == 0) {
              
            }
          } else {
            // If lastShareDate doesn't exist, call getWhatsAppTask for the first share
            // await getWhatsAppTask();
          }
        }
      } catch (error) {
        console.error("Error fetching last share date: ", error);
      }
    };

    fetchLastShareDate();
  }, [userId]);
  
  const saveTaskToUser2 = async () => {
    try {
      
      const userDocRef = doc(db, 'telegramUsers', userId);
      
      // Fetch the current user's data
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        console.log('User document not found');
        return;
      }
  
      // Get the current manualTasks array
      const data = userDoc.data();
      const currentTasks = data.manualTasks || [];
  
      // Find the task that needs to be updated
      const taskIndex = currentTasks.findIndex(task => task.taskId === 9); // Assuming taskId is unique
      
      if (taskIndex === -1) {
        console.log('Task not found');
        return;
      }
  
      // Update the existing task (modify the task properties as needed)
      const updatedTask = { ...currentTasks[taskIndex], completed: false }; // example update
  
      // Replace the task in the array with the updated one
      currentTasks[taskIndex] = updatedTask;
  
      // Update the document with the modified tasks array
      await updateDoc(userDocRef, {
        manualTasks: currentTasks, // Replace the array with the updated one
      });
  
      // Update the `lastShareDate`
      const today = new Date().toISOString().split('T')[0]; // Get current date
      await updateDoc(userDocRef, {
        lastShareDate: today // Save the current date
      });
  
      // Update local state for the task
      setLastShareDate(today);
      console.log('Task updated in user\'s manualTasks collection');

      setUserManualTasks(prevTasks =>
        prevTasks.map(task =>
          task.taskId === taskIndex ? { ...task, completed: false } : task
        )
      );
  
      // Sync the updated task status with local storage and state
      setSubmitted(prevState => ({ ...prevState, [updatedTask.taskId]: false }));
  
      // Update item in localStorage instead of setting it
      let storedSubmittedTasks = JSON.parse(localStorage.getItem('submittedTasks')) || {};
      storedSubmittedTasks[updatedTask.taskId] = false;  // Update the task status to false
  
      // Save the updated object back to localStorage
      localStorage.setItem('submittedTasks', JSON.stringify(storedSubmittedTasks));
  
      // Save the updated tasks to the user manual tasks in local storage
   
 
      
  
    } catch (error) {
      console.error('Error updating task in user\'s document: ', error);
    }
  };
  
  

  const getWhatsAppTask = async () => {
    const task = manualTasks.find(task => task.title === "Share on WhatsApp Status");
    console.log(manualTasks)
    if (task ) {
  console.log(manualTasks)

      // Update the task in Firebase
      await updateDoc(doc(db, 'telegramUsers', userId), {
        userManualTasks: arrayUnion({
          taskId: task.id,
          completed: false,
      
        })
      });

      // Update local user manual tasks to reflect the change
      setUserManualTasks(prevTasks => [
        ...prevTasks.filter(t => t.taskId !== task.id),
        { taskId: task.id, completed: false }
      ]);
    }
    return task;
  };



  const performTask = (taskId) => {
    const task = manualTasks.find(task => task.id === taskId);
    if (task) {
      if (task.title === "Share on WhatsApp Status") {
        // Call the WhatsApp sharing function
        handleWhatsAppShare();
      } else {
        // Open the task link in a new tab
        window.open(task.link, '_blank');
      }
  
      // Set a delay before enabling the verify button
      setTimeout(() => {
        setShowVerifyButtons(prevState => ({ ...prevState, [taskId]: true }));
      }, 2000); // Enable the verify button after 2 seconds
    }
  };
  


  const handleWhatsAppShare = async () => {
    const referralImageUrl = `/share-image.jpg`;
    const shareText = `100,000+ Members already joined. 
Join me in Rising Coin Now and earn exclusive free airdrop reward.

Ending Soon.
Join now
👇👇👇👇 ${userReferralCode}`;
  
    try {
      const response = await fetch(referralImageUrl);
      const blob = await response.blob();
      const file = new File([blob], "referral.jpg", { type: "image/jpeg" });
  
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Join Our Community!",
          text: shareText,
          files: [file],
        });
      } else {
        throw new Error("Image sharing not supported");
      }
    } catch (error) {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
    }

    // Update last share date

  };


  const startCountdown = (taskId) => {
    setCountdowns(prevState => ({ ...prevState, [taskId]: 5 }));
    setButtonText(prevState => ({ ...prevState, [taskId]: 'Verifying...' }));

    const countdownInterval = setInterval(() => {
      setCountdowns(prevCountdowns => {
        const newCountdown = prevCountdowns[taskId] - 1;
        if (newCountdown <= 0) {
          clearInterval(countdownInterval);
          setCountdowns(prevState => ({ ...prevState, [taskId]: null })); // Hide the timer
          setButtonText(prevState => ({ ...prevState, [taskId]: 'Verifying' }));
          setModalMessage(
            <div className="w-full flex justify-center flex-col items-center space-y-3">
            <div className="w-full items-center justify-center flex flex-col space-y-2">
              <CiNoWaitingSign size={32} className={`text-accent`}/>
              <p className='font-medium text-center'>Wait 30 minutes for moderation check to claim bonus!!</p>
            </div>
            <p className="pb-6 text-[#9a96a6] text-[15px] w-full text-center">
              If you have not performed this task make sure you do so within 30 minutes to claim your bonus!
            </p>
          </div>
          );
          setModalOpen(true);

          // Save the task to the user's document
          const saveTaskToUser = async () => {
            try {
              const userDocRef = doc(db, 'telegramUsers', userId);
              await updateDoc(userDocRef, {
                manualTasks: arrayUnion({ taskId: taskId, completed: false })
              });
          
              console.log(`Task ${taskId} added to user's manualTasks collection`);
            } catch (error) {
              console.error("Error adding task to user's document: ", error);
            }
          };

          saveTaskToUser();

          // Set submitted to true and save to local storage
          setSubmitted(prevState => ({ ...prevState, [taskId]: true }));
          localStorage.setItem(`submitted_${taskId}`, true);

          return { ...prevCountdowns, [taskId]: null };
        }
        return { ...prevCountdowns, [taskId]: newCountdown };
      });
    }, 1000);
  };

  const claimTask = async (taskId) => {
    setClaiming(prevState => ({ ...prevState, [taskId]: true }));
    try {
      const task = manualTasks.find(task => task.id === taskId);
      const userDocRef = doc(db, 'telegramUsers', userId);
      await updateDoc(userDocRef, {
        manualTasks: userManualTasks.map(task =>
          task.taskId === taskId ? { ...task, completed: true } : task
        ),
        balance: increment(task.bonus),
        taskPoints: increment(task.bonus),
      });
      setBalance(prevBalance => prevBalance + task.bonus);
      setTaskPoints(prevTaskPoints => prevTaskPoints + task.bonus);
      console.log(`Task ${taskId} marked as completed`);
      setUserManualTasks(prevTasks =>
        prevTasks.map(task =>
          task.taskId === taskId ? { ...task, completed: true } : task
        )
      );

      setModalMessage(
        <div className="w-full flex justify-center flex-col items-center space-y-3">
        <div className="w-full items-center justify-center flex flex-col space-y-2">
          <IoCheckmarkCircleSharp size={32} className={`text-accent`}/>
          <p className='font-medium text-center'>Let's go!!</p>
        </div>
        <h3 className="font-medium text-[20px] text-[#ffffff] pt-2 pb-2">
          <span className={`text-accent`}>+{formatNumber(task.bonus)}</span> RSC CLAIMED
        </h3>
        <p className="pb-6 text-[15px] w-full text-center">
          Keep performing new tasks! something huge is coming! Perform more and earn more RSC now! 
        </p>
      </div>
    );
      setModalOpen(true);
      setClaimedBonus(task.bonus);
      setCongrats(true);

      setTimeout(() => {
        setCongrats(false);
      }, 4000);

    } catch (error) {
      console.error("Error updating task status to completed: ", error);
    }
    setClaiming(prevState => ({ ...prevState, [taskId]: false }));
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    const submittedStates = manualTasks.reduce((acc, task) => {
      const submittedState = localStorage.getItem(`submitted_${task.id}`) === 'true';
      acc[task.id] = submittedState;
      return acc;
    }, {});
    setSubmitted(submittedStates);
  }, [manualTasks]);

 
  const formatNumber = (num) => {
    if (num < 100000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    } else if (num < 1000000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    } else {
      return (num / 1000000).toFixed(3).replace(".", ".") + " M";
    }
  };



  return (
    <>

{manualTasks
  .sort((a, b) => a.id - b.id) // Sort tasks by id in ascending order
  .map(task => {
    const userTask = userManualTasks.find(t => t.taskId === task.id);
    const isTaskCompleted = userTask ? userTask.completed : false;
    const isTaskSaved = !!userTask;

 

        return (
          !isTaskCompleted && <div key={task.id} className="w-full rounded-[16px] py-3 flex items-center justify-between space-x-1">
              
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

                  {!isTaskSaved && !isTaskCompleted && (
                    <>
                      <button
                        onClick={() => performTask(task.id)}
                        className={`${showVerifyButtons[task.id] ? '!w-[45px] py-[10px] !px-[6px] text-[12px] !rounded-[12px]' : ''} w-[78px] py-[10px] text-center font-semibold rounded-[30px] px-3 bg-[#1f2023] hover:bg-[#36373c] text-[#fff]`}
                      >
                        Start
                      </button>
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


                  {isTaskSaved && !isTaskCompleted && (
                    <>
 
                    <button
                      onClick={() => claimTask(task.id)}
                      className={`${claiming[task.id] ? 'w-[84px]' : ' w-[78px]'} py-[10px] text-center font-semibold absolute rounded-[30px] px-3 bg-btn text-[#000]`}
                      disabled={claiming[task.id]}
                    >
                      {claiming[task.id] ? 'Claiming' : 'Claim'}
                    </button>
                    </>
                  )}

                  {countdowns[task.id] !== null && countdowns[task.id] !== undefined && (
                    <span className="w-[42px] h-[34px] flex items-center justify-between rounded-[12px] px-[8px] font-medium bg-[#1f2023]">
                    <div className='w-full flex items-center justify-center relative'>
                    <AiOutlineLoading3Quarters size={20} className='absolute animate-spin text-secondary'/>
                      <span className='absolute text-[8px]'>
                       {countdowns[task.id]}s
                       </span>
                    </div>

                   </span>
                  )}

                  {countdowns[task.id] === null && (
                    <button
                      className={`w-fit text-[10px] py-[10px] text-center font-semibold rounded-[12px] px-[8px] bg-btn4 text-[#000]`}
                    >
                     Checking
                    </button>
                  )}

                  {isTaskCompleted && (
                    <>
                          <span className=''>
                            <IoCheckmarkCircleSharp size={28} className={`text-accent`} />
                          </span>
                    </>
                    
                  )}

                </div>
          </div>
        );
      })}

<div className='w-full absolute top-[50px] left-0 right-0 flex justify-center z-50 pointer-events-none select-none'>
      {congrats ? (<img src='/congrats.gif' alt="congrats" className="w-[80%]"/>) : (<></>)}
      </div>

      <div
        className={`${modalOpen === true ? "visible" : "invisible"} fixed top-[-12px] bottom-0 left-0 z-40 right-0 h-[100vh] bg-[#00000042] flex justify-center items-center backdrop-blur-[6px] px-4`}
      >
        <div className={`${modalOpen === true ? "opacity-100 mt-0 ease-in duration-300" : "opacity-0 mt-[100px]"} w-full bg-modal relative rounded-[16px] flex flex-col justify-center p-8`}>
          
          
            {modalMessage}
        

          <div className="w-full flex justify-center">
            <button
              onClick={closeModal}
              className={`bg-btn4 w-fit py-[10px] px-6 flex items-center justify-center text-center rounded-[12px] font-medium text-[16px]`}
            >
              Continue tasks
            </button>
          </div>
        </div>
      </div>
      {claimedBonus ? (
        <div className='hidden'>
      
        </div>
      ) : (
        <>
                <div className='hidden'>
       
        </div>
        </>
      )}
    </>
  );
};

export default ManualTasks;