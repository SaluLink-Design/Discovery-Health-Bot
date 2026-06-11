import { useEffect, useMemo, useRef, useState } from 'react';
import { submitModuleResult } from '../lib/campaignApi';
import { completeModuleQuiz, skipModuleQuiz } from '../lib/campaignStore';
import {
  buildSpokenModuleIntro,
  speakModuleIntro,
} from '../lib/literacyIntroSpeech';
import { isSpeechSupported, stopSpeaking } from '../lib/speech';
import { PATIENT_CLASSES } from '../lib/authiTheme';
import LiteracyQuiz from './LiteracyQuiz';
import { PatientButtonPrimary, PatientButtonSecondary } from './PatientButton';

/**
 * Story intro → quiz or skip → unlock feature view.
 * CTAs appear after Authi finishes one combined intro + quiz invitation.
 */
export default function LiteracyModuleQuickCheck({
  moduleId,
  profile,
  conditionId,
  refreshKey = 0,
  onUnlock,
  introSpeech,
  moduleIntroQuizPitch,
  startQuizLabel = 'Test what I know',
  skipLabel,
  eyebrowLabel,
}) {
  const [quizStarted, setQuizStarted] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const introCompleteKeyRef = useRef(null);

  const spokenIntro = useMemo(
    () => buildSpokenModuleIntro(introSpeech, moduleIntroQuizPitch),
    [introSpeech, moduleIntroQuizPitch]
  );

  const introSessionKey = `${moduleId}|${conditionId ?? ''}|${refreshKey}|${spokenIntro}`;

  useEffect(() => {
    setQuizStarted(false);
    introCompleteKeyRef.current = null;
  }, [refreshKey, conditionId]);

  useEffect(() => {
    if (quizStarted) return undefined;

    if (!spokenIntro) {
      setIntroReady(true);
      return undefined;
    }

    if (introCompleteKeyRef.current === introSessionKey) {
      setIntroReady(true);
      return undefined;
    }

    let cancelled = false;
    setIntroReady(false);

    speakModuleIntro({
      text: spokenIntro,
      onComplete: () => {
        if (cancelled) return;
        introCompleteKeyRef.current = introSessionKey;
        setIntroReady(true);
      },
    });

    return () => {
      cancelled = true;
    };
  }, [quizStarted, introSessionKey, spokenIntro]);

  const unlock = () => {
    stopSpeaking();
    onUnlock?.();
  };

  const handleSkip = () => {
    skipModuleQuiz(moduleId);
    submitModuleResult({
      moduleId,
      profile,
      result: { score: 0, total: 0, answers: [], skipped: true },
    }).catch(() => {});
    setQuizStarted(false);
    unlock();
  };

  const handleComplete = (result) => {
    completeModuleQuiz(moduleId, result);
    submitModuleResult({ moduleId, profile, result }).catch(() => {});
    setQuizStarted(false);
    unlock();
  };

  if (quizStarted) {
    return (
      <LiteracyQuiz
        moduleId={moduleId}
        profile={profile}
        conditionId={conditionId}
        embedded
        skipIntro
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    );
  }

  return (
    <div
      className={`${PATIENT_CLASSES.card} border-[#E9D5FF] bg-gradient-to-br from-[#FAF5FF] to-white`}
    >
      {eyebrowLabel && (
        <p className="text-xs font-semibold uppercase tracking-wide text-[#9F62ED]">
          {eyebrowLabel}
        </p>
      )}
      {introSpeech && (
        <p className={`text-sm leading-relaxed text-[#374151] ${eyebrowLabel ? 'mt-2' : ''}`}>
          {introSpeech}
        </p>
      )}
      {moduleIntroQuizPitch && (
        <p
          className={`text-sm leading-relaxed text-[#374151] ${introSpeech ? 'mt-3' : eyebrowLabel ? 'mt-2' : ''}`}
        >
          {moduleIntroQuizPitch}
        </p>
      )}
      {!introReady && spokenIntro && isSpeechSupported() && (
        <p className="mt-3 flex items-center gap-2 text-xs font-medium text-[#9F62ED]">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#9F62ED]" />
          Authi is explaining…
        </p>
      )}
      {introReady && (
        <div className="mt-4 flex flex-wrap gap-3 transition-all duration-300">
          <PatientButtonPrimary type="button" onClick={() => setQuizStarted(true)}>
            {startQuizLabel}
          </PatientButtonPrimary>
          <PatientButtonSecondary type="button" onClick={handleSkip}>
            {skipLabel}
          </PatientButtonSecondary>
        </div>
      )}
    </div>
  );
}
