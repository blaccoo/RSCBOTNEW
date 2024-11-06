import React, { useState, useEffect, useMemo } from 'react';
import { doc, updateDoc, arrayUnion, increment, getDoc } from 'firebase/firestore';
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
  const userReferralCode = `https://t.me/Risingcoin_appbot?start=r${userId}`;
  const [lastShareDate, setLastShareDate] = useState(null);

  useEffect(() => {
    const fetchLastShareDate = async () => {
      const userDocRef = doc(db, 'telegramUsers', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setLastShareDate(data.lastShareDate || null);
      }
    };
    fetchLastShareDate();
  }, [userId]);

  const performTask = (taskId) => {
    const task = manualTasks.find(task => task.id === taskId);
    if (task) {
      task.title === "Share on WhatsApp Status" ? handleWhatsAppShare() : window.open(task.link, '_blank');
      setTimeout(() => setShowVerifyButtons(prev => ({ ...prev, [taskId]: true })), 2000);
    }
  };

  const handleWhatsAppShare = async () => {
    const referralImageUrl = `/share-image.jpg`;
    const shareText = `100,000+ Members already joined. Join me in Rising Coin Now! 👇 ${userReferralCode}`;
    
    try {
      const response = await fetch(referralImageUrl);
      const blob = await response.blob();
      const file = new File([blob], "referral.jpg", { type: "image/jpeg" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: "Join Our Community!", text: shareText, files: [file] });
      } else {
        throw new Error("Image sharing not supported");
      }
    } catch (error) {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const startCountdown = (taskId) => {
    setCountdowns(prev => ({ ...prev, [taskId]: 5 }));
    setButtonText(prev => ({ ...prev, [taskId]: 'Verifying...' }));
    const countdownInterval = setInterval(() => {
      setCountdowns(prev => {
        const newCount = prev[taskId] - 1;
        if (newCount <= 0) {
          clearInterval(countdownInterval);
          setCountdowns(prev => ({ ...prev, [taskId]: null }));
          setButtonText(prev => ({ ...prev, [taskId]: 'Verifying' }));
          setModalOpen(true);
          setModalMessage(
            <div>
              <CiNoWaitingSign size={32} />
              <p>Wait 30 minutes for moderation check to claim bonus!</p>
              <p>If you haven't completed this task, do it soon to claim your bonus!</p>
            </div>
          );
          saveTaskToUser(taskId);
          setSubmitted(prev => ({ ...prev, [taskId]: true }));
          localStorage.setItem(`submitted_${taskId}`, true);
        }
        return { ...prev, [taskId]: newCount };
      });
    }, 1000);
  };

  const saveTaskToUser = async (taskId) => {
    try {
      const userDocRef = doc(db, 'telegramUsers', userId);
      await updateDoc(userDocRef, { manualTasks: arrayUnion({ taskId, completed: false }) });
    } catch (error) {
      console.error("Error adding task to user's document: ", error);
    }
  };

  const claimTask = async (taskId) => {
    setClaiming(prev => ({ ...prev, [taskId]: true }));
    try {
      const task = manualTasks.find(task => task.id === taskId);
      const userDocRef = doc(db, 'telegramUsers', userId);
      await updateDoc(userDocRef, {
        manualTasks: userManualTasks.map(t => t.taskId === taskId ? { ...t, completed: true } : t),
        balance: increment(task.bonus),
        taskPoints: increment(task.bonus),
        ...(task.title === "Share on WhatsApp Status" && { lastShareDate: new Date().toISOString().split('T')[0] }),
      });
      setClaimedBonus(task.bonus);
      setCongrats(true);
      setTimeout(() => setCongrats(false), 4000);
    } catch (error) {
      console.error("Error updating task status to completed: ", error);
    }
    setClaiming(prev => ({ ...prev, [taskId]: false }));
  };

  const closeModal = () => setModalOpen(false);

  const submittedStates = useMemo(() => 
    manualTasks.reduce((acc, task) => {
      acc[task.id] = localStorage.getItem(`submitted_${task.id}`) === 'true';
      return acc;
    }, {}), [manualTasks]
  );

  return (
<div>
  
</div>
  );
};

export default ManualTasks;
