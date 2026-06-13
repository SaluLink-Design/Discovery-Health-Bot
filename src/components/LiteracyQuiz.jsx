import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CAMPAIGN_MODULES,
  getModuleQuestions,
} from '../lib/campaignLiteracy';
import { getNextCampaignModuleAfter } from '../lib/campaignStore';
import { loadHospitalModuleQuestions } from '../lib/quizHospitalData';
import { loadMedicationModuleQuestions } from '../lib/quizMedicationData';
import { loadTreatmentModuleQuestions } from '../lib/quizTreatmentData';
import { pauseBeforeAnswer } from '../lib/quizAudio';
import { buildCorrectionSpeech, buildQuestionSpeech } from '../lib/speechText';
import { ensureSpeechVoices, isSpeechSupported, speakText, stopSpeaking } from '../lib/speech';
import {
  buildSpokenModuleIntro,
  speakModuleIntro,
} from '../lib/literacyIntroSpeech';
import { TREATMENT_BASKET_COPY } from '../lib/literacyContent';
import { HOSPITAL_COVER_COPY, MEDICINE_COVER_COPY } from '../lib/literacyModuleCopy';
import { AUTHI_GRADIENT, AUTHI_GRADIENT_SOFT, PATIENT_COLORS, PATIENT_FONT } from '../lib/authiTheme';
import BrandEyebrow from './BrandEyebrow';
import QuizCountdown from './QuizCountdown';
import QuizResultSummary from './QuizResultSummary';
import ScenarioVisual from './ScenarioVisual';
import { PatientButtonPrimary, PatientButtonSecondary } from './PatientButton';

const STEPS = {
  INTRO: 'intro',
  QUESTION: 'question',
  RESULT: 'result',
};

const ANSWER_SECONDS = 5;

const MODULE_LOADERS = {
  treatment: loadTreatmentModuleQuestions,
  medication: loadMedicationModuleQuestions,
  hospitals: loadHospitalModuleQuestions,
};

const LOADING_COPY = {
  treatment: 'Loading questions…',
  medication: 'Loading questions…',
  hospitals: 'Loading questions…',
};

const SKIP_LABELS = {
  treatment: TREATMENT_BASKET_COPY.skipToBasketLabel,
  medication: MEDICINE_COVER_COPY.skipLabel,
  hospitals: HOSPITAL_COVER_COPY.skipLabel,
};

export default function LiteracyQuiz({
  moduleId,
  profile,
  conditionId,
  onComplete,
  onSkip,
  onNavigate,
  embedded = false,
  skipIntro = false,
}) {
  const moduleMeta = CAMPAIGN_MODULES[moduleId];
  const [questions, setQuestions] = useState([]);
  const [resultSummary, setResultSummary] = useState(null);
  const [questionsLoading, setQuestionsLoading] = useState(Boolean(MODULE_LOADERS[moduleId]));
  const [step, setStep] = useState(skipIntro ? STEPS.QUESTION : STEPS.INTRO);

  useEffect(() => {
    let cancelled = false;
    const loader = MODULE_LOADERS[moduleId];

    if (loader) {
      setQuestionsLoading(true);
      const loadPromise =
        moduleId === 'treatment'
          ? loadTreatmentModuleQuestions(profile, conditionId)
          : loader(profile);

      loadPromise
        .then(({ questions: loaded, resultSummary: summary }) => {
          if (!cancelled) {
            setQuestions(loaded);
            setResultSummary(summary);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setQuestions(getModuleQuestions(moduleId, profile));
            setResultSummary(null);
          }
        })
        .finally(() => {
          if (!cancelled) setQuestionsLoading(false);
        });
    } else {
      setQuestions(getModuleQuestions(moduleId, profile));
      setResultSummary(null);
      setQuestionsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [moduleId, profile, conditionId]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showCorrection, setShowCorrection] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [introReady, setIntroReady] = useState(skipIntro || !moduleMeta?.introSpeech);
  const [answerPhase, setAnswerPhase] = useState('idle');
  const [secondsLeft, setSecondsLeft] = useState(ANSWER_SECONDS);

  const questionRunRef = useRef(0);
  const introCompleteKeyRef = useRef(null);

  const spokenIntro = buildSpokenModuleIntro(
    moduleMeta?.introSpeech,
    moduleMeta?.introQuizPitch
  );
  const introSessionKey = `${moduleId}|${spokenIntro}`;

  const currentQuestion = questions[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;

  const activeVisual = showCorrection && currentQuestion?.visualAfter
    ? currentQuestion.visualAfter
    : currentQuestion?.visual;

  const activeVisualMeta = showCorrection && currentQuestion?.visualAfter
    ? currentQuestion.visualAfterMeta ?? currentQuestion.visualMeta
    : currentQuestion?.visualMeta;

  const openAnswerWindow = useCallback(() => {
    pauseBeforeAnswer(() => {
      setAnswerPhase('open');
      setSecondsLeft(ANSWER_SECONDS);
    });
  }, []);

  useEffect(() => {
    ensureSpeechVoices();
  }, []);

  const submitAnswer = useCallback((optionId, wasTimedOut = false) => {
    if (!currentQuestion || showCorrection) return;

    const correct = !wasTimedOut && optionId === currentQuestion.correct;
    setSelected(optionId);
    setTimedOut(wasTimedOut);
    setShowCorrection(true);
    setAnswerPhase('done');
    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selected: optionId,
        correct,
        timedOut: wasTimedOut,
        correction: currentQuestion.correction,
      },
    ]);
  }, [currentQuestion, showCorrection]);

  useEffect(() => {
    if (step !== STEPS.INTRO || skipIntro || !spokenIntro) {
      setIntroReady(true);
      return undefined;
    }

    if (introCompleteKeyRef.current === introSessionKey) {
      setIntroReady(true);
      return undefined;
    }

    let cancelled = false;
    setIntroReady(false);

    const cancelIntro = speakModuleIntro({
      text: spokenIntro,
      onComplete: () => {
        if (cancelled) return;
        introCompleteKeyRef.current = introSessionKey;
        setIntroReady(true);
      },
    });

    return () => {
      cancelled = true;
      cancelIntro();
    };
  }, [step, introSessionKey, spokenIntro, skipIntro]);

  useEffect(() => {
    if (step !== STEPS.QUESTION || !currentQuestion || showCorrection) return undefined;

    const runId = ++questionRunRef.current;
    setSelected(null);
    setTimedOut(false);
    setAnswerPhase('speaking');

    const beginOpen = () => {
      if (questionRunRef.current !== runId) return;
      openAnswerWindow();
    };

    if (voiceOn) {
      speakText(buildQuestionSpeech(currentQuestion), {
        onEnd: beginOpen,
      });
    } else {
      beginOpen();
    }

    return () => {
      if (questionRunRef.current === runId) stopSpeaking();
    };
  }, [voiceOn, step, questionIndex, currentQuestion?.id, showCorrection, openAnswerWindow]);

  useEffect(() => {
    if (answerPhase !== 'open' || showCorrection || !currentQuestion) return undefined;

    if (secondsLeft <= 0) {
      submitAnswer(null, true);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [answerPhase, secondsLeft, showCorrection, currentQuestion, submitAnswer]);

  useEffect(() => {
    if (!voiceOn || !showCorrection || !currentQuestion) return undefined;

    const timer = window.setTimeout(() => {
      speakText(buildCorrectionSpeech(currentQuestion));
    }, 120);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, [voiceOn, showCorrection, currentQuestion?.id]);

  useEffect(() => {
    if (!voiceOn || step !== STEPS.RESULT || !resultSummary?.speechText) return undefined;
    speakText(resultSummary.speechText, { raw: true });
    return () => stopSpeaking();
  }, [voiceOn, step, resultSummary]);

  useEffect(() => () => stopSpeaking(), []);

  const handleSelect = (optionId) => {
    if (answerPhase !== 'open' || showCorrection) return;
    submitAnswer(optionId, false);
  };

  const handleContinueAfterAnswer = () => {
    if (isLastQuestion) {
      setStep(STEPS.RESULT);
    } else {
      setQuestionIndex((i) => i + 1);
      setSelected(null);
      setShowCorrection(false);
      setTimedOut(false);
      setAnswerPhase('idle');
    }
  };

  const handleFinish = () => {
    const score = answers.filter((a) => a.correct).length;
    onComplete?.({
      score,
      total: questions.length,
      answers,
    });
  };

  const handleFinishAndNavigate = (viewId) => {
    handleFinish();
    onNavigate?.(viewId);
  };

  const score = answers.filter((a) => a.correct).length;
  const nextModuleId = embedded ? getNextCampaignModuleAfter(moduleId, profile) : null;
  const nextModuleMeta = nextModuleId ? CAMPAIGN_MODULES[nextModuleId] : null;
  const optionsLocked = answerPhase !== 'open' || showCorrection;

  if (!moduleMeta) return null;

  if (questionsLoading) {
    return (
      <div
        style={{ fontFamily: PATIENT_FONT }}
        className={`${embedded ? '' : 'mx-auto max-w-2xl'} rounded-2xl border border-[#EAECF0] bg-white p-8 text-center`}
      >
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#9F62ED]/30 border-t-[#9F62ED]" />
        <p className="mt-3 text-sm text-[#6B7280]">{LOADING_COPY[moduleId] ?? 'Loading…'}</p>
      </div>
    );
  }

  if (!questions.length) return null;

  const wrapperClass = embedded ? 'space-y-4' : 'mx-auto max-w-2xl space-y-6';

  return (
    <div style={{ fontFamily: PATIENT_FONT }} className={wrapperClass}>
      {!embedded && (
        <div
          className="rounded-2xl p-8"
          style={{
            background: PATIENT_COLORS.heroBg,
            boxShadow: '0 4px 24px rgba(13,15,28,0.12)',
          }}
        >
          <BrandEyebrow>{moduleMeta.eyebrow}</BrandEyebrow>
          <h1 className="mt-2 text-2xl font-bold text-white">{moduleMeta.title}</h1>
          <p className="mt-2 text-sm text-white/55">
            {questions.length} questions · 5 seconds to answer
          </p>
        </div>
      )}

      {step === STEPS.INTRO && !skipIntro && (
        <div
          className="rounded-2xl p-6"
          style={{
            background: PATIENT_COLORS.cardBg,
            border: `1px solid ${PATIENT_COLORS.cardBorder}`,
          }}
        >
          <p className="text-sm leading-relaxed text-[#374151]">
            {moduleMeta.introSpeech ?? moduleMeta.intro}
          </p>
          {moduleMeta.introQuizPitch && (
            <p className="mt-3 text-sm leading-relaxed text-[#374151]">
              {moduleMeta.introQuizPitch}
            </p>
          )}
          {!introReady && moduleMeta.introSpeech && isSpeechSupported() && (
            <p className="mt-4 flex items-center gap-2 text-xs font-medium text-[#9F62ED]">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#9F62ED]" />
              Authi is explaining…
            </p>
          )}
          {introReady && (
            <div className="mt-6 flex flex-wrap gap-3 transition-all duration-300">
              <PatientButtonPrimary type="button" onClick={() => setStep(STEPS.QUESTION)}>
                {moduleId === 'treatment'
                  ? TREATMENT_BASKET_COPY.startQuizLabel
                  : MEDICINE_COVER_COPY.startQuizLabel}
              </PatientButtonPrimary>
              <PatientButtonSecondary type="button" onClick={onSkip}>
                {SKIP_LABELS[moduleId] ?? 'Skip — explore anyway'}
              </PatientButtonSecondary>
            </div>
          )}
        </div>
      )}

      {step === STEPS.QUESTION && currentQuestion && (
        <div
          className="rounded-2xl p-6"
          style={{
            background: PATIENT_COLORS.cardBg,
            border: `1px solid ${PATIENT_COLORS.cardBorder}`,
          }}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <BrandEyebrow>
              {questionIndex + 1} of {questions.length}
            </BrandEyebrow>
            <button
              type="button"
              onClick={() => setVoiceOn((v) => !v)}
              className="shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-semibold"
              style={{
                border: '1px solid #E5E7EB',
                background: voiceOn ? '#FAF5FF' : '#F9FAFB',
                color: voiceOn ? '#9F62ED' : '#6B7280',
              }}
            >
              {voiceOn ? '🔊 Listen on' : '🔇 Listen'}
            </button>
            <QuizCountdown
              secondsLeft={secondsLeft}
              total={ANSWER_SECONDS}
              active={answerPhase === 'open' && !showCorrection}
            />
            {embedded && onSkip && !showCorrection && (
              <button
                type="button"
                onClick={onSkip}
                className="text-[10px] font-medium text-[#9CA3AF] hover:text-[#9F62ED] hover:underline"
              >
                {SKIP_LABELS[moduleId] ?? 'Skip'}
              </button>
            )}
          </div>

          {answerPhase === 'speaking' && voiceOn && (
            <p className="mb-3 flex items-center gap-2 text-xs font-medium text-[#9F62ED]">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#9F62ED]" />
              Authi is asking…
            </p>
          )}

          {currentQuestion.context && (
            <p className="text-sm font-medium text-[#374151]">{currentQuestion.context}</p>
          )}

          {activeVisual && (
            <div className="my-4">
              <ScenarioVisual visual={activeVisual} meta={activeVisualMeta} />
            </div>
          )}

          <p className="text-base font-semibold text-[#111827]">{currentQuestion.prompt}</p>

          <div className="mt-4 space-y-2">
            {currentQuestion.options.map((opt) => {
              const isSelected = selected === opt.id;
              const isCorrect = opt.id === currentQuestion.correct;
              let border = '#EAECF0';
              let bg = '#F9FAFB';
              if (showCorrection && isCorrect) {
                border = '#86EFAC';
                bg = '#F0FDF4';
              } else if (showCorrection && isSelected && !isCorrect) {
                border = '#FCA5A5';
                bg = '#FEF2F2';
              } else if (isSelected) {
                border = '#C4B5FD';
                bg = AUTHI_GRADIENT_SOFT;
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  disabled={optionsLocked}
                  className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition disabled:opacity-45"
                  style={{
                    border: `1px solid ${border}`,
                    background: bg,
                    color: '#111827',
                    cursor: optionsLocked ? 'not-allowed' : 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {showCorrection && (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm text-[#374151] ${
                selected === currentQuestion.correct && !timedOut
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-amber-200 bg-amber-50'
              }`}
            >
              <p
                className={`font-semibold ${
                  selected === currentQuestion.correct && !timedOut
                    ? 'text-emerald-900'
                    : 'text-amber-900'
                }`}
              >
                {timedOut ? "Time's up" : selected === currentQuestion.correct ? 'Nice' : 'Not quite'}
              </p>
              <p className="mt-1">{currentQuestion.correction}</p>
              <button
                type="button"
                onClick={handleContinueAfterAnswer}
                className="mt-3 text-xs font-semibold text-[#9F62ED] hover:underline"
              >
                {isLastQuestion ? 'See results →' : 'Next →'}
              </button>
            </div>
          )}
        </div>
      )}

      {step === STEPS.RESULT && (
        <div
          className="rounded-2xl p-6"
          style={{
            background: PATIENT_COLORS.cardBg,
            border: `1px solid ${PATIENT_COLORS.cardBorder}`,
          }}
        >
          <p className="text-lg font-semibold text-[#111827]">
            {score === questions.length ? 'Nailed it' : `${score} of ${questions.length}`}
          </p>
          <p className="mt-1 text-sm text-[#6B7280]">
            {embedded && nextModuleMeta
              ? 'Continue to the next quick check, or explore this section below.'
              : embedded && onNavigate
                ? 'You finished the literacy journey — head home for the optional survey, or explore below.'
                : embedded
                  ? 'Your basket is below.'
                  : 'Explore the feature on your profile.'}
          </p>

          <QuizResultSummary summary={resultSummary} moduleId={moduleId} />

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {embedded && nextModuleMeta && onNavigate ? (
              <>
                <PatientButtonPrimary
                  type="button"
                  onClick={() => handleFinishAndNavigate(nextModuleId)}
                  className="w-full sm:w-auto"
                >
                  Next quiz: {nextModuleMeta.title}
                </PatientButtonPrimary>
                <PatientButtonSecondary type="button" onClick={handleFinish} className="w-full sm:w-auto">
                  {moduleId === 'treatment' ? 'See my basket' : moduleMeta.exploreLabel}
                </PatientButtonSecondary>
              </>
            ) : embedded && onNavigate ? (
              <>
                <PatientButtonPrimary
                  type="button"
                  onClick={() => handleFinishAndNavigate('dashboard')}
                  className="w-full sm:w-auto"
                >
                  Finish journey
                </PatientButtonPrimary>
                <PatientButtonSecondary type="button" onClick={handleFinish} className="w-full sm:w-auto">
                  {moduleMeta.exploreLabel}
                </PatientButtonSecondary>
              </>
            ) : (
              <PatientButtonPrimary type="button" onClick={handleFinish} className="w-full sm:w-auto">
                {embedded ? 'See my basket' : moduleMeta.exploreLabel}
              </PatientButtonPrimary>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
