import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../firebase/firestore'; 
import { useUser } from "../context/userContext"; 
import { IoCheckmarkCircleSharp } from 'react-icons/io5';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { CiNoWaitingSign } from "react-icons/ci";

const ManualTasks = () => {
  const [showVerifyButtons, setShowVerifyButtons] = useState({});
  const [countdowns, setCountdowns] = useState({});
  const [buttonText, setButtonText] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [claiming, setClaiming] = useState({});
  const [submitted, setSubmitted] = useState({});
  const { id: userId, manualTasks, userManualTasks, setTaskPoints, setUserManualTasks, setBalance } = useUser(); 
  const [claimedBonus, setClaimedBonus] = useState(0);
  const [congrats, setCongrats] = useState(false);
  const userReferralCode = `https://t.me/Risingcoin_appbot?start=r${userId}\n\ `;
  
  // New state to track last share date
  const [lastShareDate, setLastShareDate] = useState(null);

  useEffect(() => {
    // Fetch the last share date from the database when the component mounts
    const fetchLastShareDate = async () => {
      const userDocRef = doc(db, 'telegramUsers', userId);
      const userDoc = await userDocRef.get();
      if (userDoc.exists()) {
        const data = userDoc.data();
        setLastShareDate(data.lastShareDate || null);
      }
    };

    fetchLastShareDate();
  }, [userId]);

  const performTask = async (taskId) => {
    const task = manualTasks.find(task => task.id === taskId);
    if (task) {
      if (task.title === "Share on WhatsApp Status") {
        await handleWhatsAppShare();
      } else {
        window.open(task.link, '_blank');
      }
      setTimeout(() => {
        setShowVerifyButtons(prevState => ({ ...prevState, [taskId]: true }));
      }, 2000);
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
    const today = new Date().toISOString().split('T')[0]; // Get current date
    await updateDoc(doc(db, 'telegramUsers', userId), {
      lastShareDate: today // Save the current date
    });
    setLastShareDate(today);
  };

  const startCountdown = (taskId) => {
    setCountdowns(prevState => ({ ...prevState, [taskId]: 5 }));
    setButtonText(prevState => ({ ...prevState, [taskId]: 'Verifying...' }));

    const countdownInterval = setInterval(() => {
      setCountdowns(prevCountdowns => {
        const newCountdown = prevCountdowns[taskId] - 1;
        if (newCountdown <= 0) {
          clearInterval(countdownInterval);
          setCountdowns(prevState => ({ ...prevState, [taskId]: null }));
          setButtonText(prevState => ({ ...prevState, [taskId]: 'Verifying' }));
          setModalMessage(
            <div className="w-full flex justify-center flex-col items-center space-y-3">
              <div className="w-full items-center justify-center flex flex-col space-y-2">
                <CiNoWaitingSign size={32} className={`text-accent`} />
                <p className='font-medium text-center'>Wait 30 minutes for moderation check to claim bonus!!</p>
              </div>
              <p className="pb-6 text-[#9a96a6] text-[15px] w-full text-center">
                If you have not performed this task make sure you do so within 30 minutes to claim your bonus!
              </p>
            </div>
          );
          setModalOpen(true);

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
            <IoCheckmarkCircleSharp size={32} className={`text-accent`} />
            <p className='font-medium text-center'>Let's go!!</p>
          </div>
          <h3 className="font-medium text-[20px] text-[#ffffff] pt-2 pb-2">
            <span className={`text-accent`}>+{formatNumber(task.bonus)}</span> RSC CLAIMED
          </h3>
          <p className="pb-6 text-[15px] w-full text-center">
            Keep performing new tasks! Something huge is coming! Perform more and earn more RSC now! 
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
      return new Intl.NumberFormat().format(num / 1000000).replace(/,/g, " ") + 'M';
    }
  };

  return (
    <>
      {manualTasks.map((task) => {
        const isTaskCompleted = submitted[task.id] || (lastShareDate && lastShareDate === new Date().toISOString().split('T')[0] && task.title === "Share on WhatsApp Status");

        return (
          !isTaskCompleted && (
            <div key={task.id} className={`border border-[#3d3d3d] rounded-md p-4 mb-4`}>
              <div className='flex items-center justify-between'>
                <h4 className={`text-[#ffffff] text-[14px] font-medium`}>
                  {task.title}
                </h4>
                {isTaskCompleted && <span className="text-green-500">Completed</span>}
              </div>
              <p className='text-[#b8b8b8] text-[12px]'>{task.description}</p>
              <div className={`flex h-full flex-col justify-center items-end`}>
                {!isTaskCompleted && !submitted[task.id] && (
                  <button
                    className={`bg-accent h-[36px] rounded-[20px] text-[12px] text-[#ffffff] px-3 ${showVerifyButtons[task.id] ? 'hidden' : ''}`}
                    onClick={() => {
                      performTask(task.id);
                      startCountdown(task.id);
                    }}
                  >
                    Perform Task
                  </button>
                )}
                {showVerifyButtons[task.id] && (
                  <button
                    className={`bg-accent h-[36px] rounded-[20px] text-[12px] text-[#ffffff] px-3 ${isTaskCompleted ? 'hidden' : ''}`}
                    onClick={() => claimTask(task.id)}
                    disabled={claiming[task.id]}
                  >
                    {claiming[task.id] ? (
                      <AiOutlineLoading3Quarters className="animate-spin" />
                    ) : (
                      buttonText[task.id] || `Claim Bonus`
                    )}
                  </button>
                )}
                {submitted[task.id] && (
                  <span className="text-gray-500 text-[12px]">Task submitted! Claim after 30 minutes</span>
                )}
              </div>
            </div>
          )
        );
      })}
    </>
  );
};

export default ManualTasks;
