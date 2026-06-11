import { useEffect, useState } from 'react';
import { submitModuleResult } from '../lib/campaignApi';
import {
  completeModuleQuiz,
  isModuleUnlocked,
  skipModuleQuiz,
} from '../lib/campaignStore';
import LiteracyQuiz from './LiteracyQuiz';

export default function CampaignModuleGate({
  moduleId,
  profile,
  children,
  onUnlocked,
  gateKey = 0,
}) {
  const [unlocked, setUnlocked] = useState(() => isModuleUnlocked(moduleId));

  useEffect(() => {
    setUnlocked(isModuleUnlocked(moduleId));
  }, [moduleId, gateKey]);

  const handleComplete = async (result) => {
    completeModuleQuiz(moduleId, result);
    setUnlocked(true);
    onUnlocked?.(moduleId);
    submitModuleResult({ moduleId, profile, result }).catch(() => {});
  };

  const handleSkip = () => {
    skipModuleQuiz(moduleId);
    setUnlocked(true);
    onUnlocked?.(moduleId);
  };

  if (unlocked) return children;

  return (
    <LiteracyQuiz
      moduleId={moduleId}
      profile={profile}
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}
