import { useEffect, useState } from 'react';
import DashboardView from './components/DashboardView';
import MemberLanding from './components/MemberLanding';
import CampaignSetupPanel from './components/CampaignSetupPanel';
import SetupLayout from './components/SetupLayout';
import PlanBreakdownView from './components/PlanBreakdownView';
import DoctorView from './components/DoctorView';
import HospitalNetworkView from './components/HospitalNetworkView';
import MedicationView from './components/MedicationView';
import PatientProfilePanel from './components/PatientProfilePanel';
import PatientSidebar from './components/PatientSidebar';
import PatientTopBar from './components/PatientTopBar';
import TopNav from './components/TopNav';
import { PATIENT_COLORS, PATIENT_FONT } from './lib/authiTheme';
import TreatmentView from './components/TreatmentView';
import { CAMPAIGN_LITERACY_ENABLED, CAMPAIGN_MEMBER_MODE } from './lib/campaignConfig';
import {
  clearCampaignState,
  resetCampaignJourney,
  resetModuleQuiz,
} from './lib/campaignStore';
import { buildDefaultMemberDraft } from './data/demoCharacters';
import { loadProfile, saveProfile, clearProfile } from './lib/profileStore';
import { clearPrescriptions, loadPrescriptions, savePrescriptions, seedDemoData } from './lib/prescriptionStore';

export default function App() {
  const [profile, setProfile] = useState(() => loadProfile());
  const [setupDraft, setSetupDraft] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeConditionId, setActiveConditionId] = useState(() => {
    const p = loadProfile();
    return p?.conditions?.[0] ?? null;
  });
  const [prescriptions, setPrescriptions] = useState(() => {
    if (CAMPAIGN_MEMBER_MODE) return {};
    const p = loadProfile();
    const existing = loadPrescriptions();
    const isEmpty = Object.keys(existing).length === 0;
    return isEmpty && p ? seedDemoData(p) : existing;
  });
  const [campaignRefresh, setCampaignRefresh] = useState(0);
  const [hospitalHighlightOffPlan, setHospitalHighlightOffPlan] = useState(false);
  const [browseAllConditions, setBrowseAllConditions] = useState(false);

  const handlePrescriptionsChange = (updated) => {
    savePrescriptions(updated);
    setPrescriptions(updated);
  };

  useEffect(() => {
    const ids = profile?.conditions ?? [];
    setActiveConditionId((current) => {
      if (ids.length === 0) return null;
      if (current && ids.includes(current)) return current;
      return ids[0];
    });
  }, [profile]);

  const bumpCampaign = () => {
    setCampaignRefresh((n) => n + 1);
  };

  const handleProfileSave = (newProfile) => {
    saveProfile(newProfile);
    setProfile(newProfile);
    setActiveConditionId(newProfile.conditions?.[0] ?? null);
    if (!(newProfile.conditions?.length > 0)) {
      try {
        sessionStorage.setItem('authi_conditions_nudge', '1');
      } catch {
        // ignore
      }
    } else {
      try {
        sessionStorage.removeItem('authi_conditions_nudge');
      } catch {
        // ignore
      }
    }
    if (CAMPAIGN_MEMBER_MODE) {
      clearPrescriptions();
      setPrescriptions({});
    } else {
      setPrescriptions(seedDemoData(newProfile));
    }
    setSetupDraft(null);
    setIsEditingProfile(false);
    setCurrentView('dashboard');
  };

  const handleGetStarted = () => {
    setSetupDraft(buildDefaultMemberDraft());
  };

  const handleProfileCancel = () => {
    if (isEditingProfile && profile) {
      setIsEditingProfile(false);
      return;
    }
    setSetupDraft(null);
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleStartOver = () => {
    clearProfile();
    clearPrescriptions();
    clearCampaignState();
    setProfile(null);
    setSetupDraft(null);
    setPrescriptions({});
    setActiveConditionId(null);
    setIsEditingProfile(false);
    setCampaignRefresh(0);
    setHospitalHighlightOffPlan(false);
    setBrowseAllConditions(false);
    setCurrentView('dashboard');
  };

  const handleRetakeJourney = () => {
    resetCampaignJourney();
    setHospitalHighlightOffPlan(false);
    bumpCampaign();
    setCurrentView('dashboard');
  };

  const handleRetakeModuleQuiz = (moduleId) => {
    resetModuleQuiz(moduleId);
    bumpCampaign();
    setCurrentView(moduleId);
  };

  const showMemberLanding = CAMPAIGN_MEMBER_MODE && !profile && !setupDraft && !isEditingProfile;
  const showProfileSetup = setupDraft || (isEditingProfile && profile) || (!CAMPAIGN_MEMBER_MODE && !profile);

  const profilePanelSeed = isEditingProfile && profile ? profile : setupDraft;

  if (showMemberLanding) {
    return (
      <SetupLayout footer="Powered by Authi · Prototype for member testing">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-[#111827]">
            Know what your scheme covers
          </h1>
          <p className="mt-2 text-base text-[#6B7280]">
            Customise your plan and learn medical scheme literacy step by step.
          </p>
        </div>
        <MemberLanding onGetStarted={handleGetStarted} />
      </SetupLayout>
    );
  }

  const resolveHouseholdMode = () => {
    const seed = profilePanelSeed ?? profile;
    return (seed?.additionalAdults ?? 0) > 0 || (seed?.children ?? 0) > 0 ? 'family' : 'solo';
  };

  if (showProfileSetup) {
    return (
      <SetupLayout footer="Powered by Authi · Prototype for member testing">
        {CAMPAIGN_MEMBER_MODE ? (
          <CampaignSetupPanel
            savedProfile={profilePanelSeed}
            onSave={handleProfileSave}
            onBack={!isEditingProfile && !profile ? handleProfileCancel : undefined}
          />
        ) : (
          <PatientProfilePanel
            key="edit"
            onSave={handleProfileSave}
            onEdit={handleProfileCancel}
            isEditing
            savedProfile={profilePanelSeed}
            householdMode={resolveHouseholdMode()}
          />
        )}
      </SetupLayout>
    );
  }

  if (CAMPAIGN_MEMBER_MODE) {
    return (
      <div
        className="flex h-screen w-full overflow-hidden"
        style={{ fontFamily: PATIENT_FONT, background: PATIENT_COLORS.pageBg }}
      >
        <PatientSidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          browseAllConditions={browseAllConditions}
          onBrowseAllConditionsChange={setBrowseAllConditions}
        />
        <div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
          <PatientTopBar
            profile={profile}
            activeConditionId={activeConditionId}
            onActiveConditionChange={setActiveConditionId}
            onStartOver={handleStartOver}
            onRetakeJourney={handleRetakeJourney}
          />
          <main className="flex-1 px-8 py-7">
            {currentView === 'dashboard' && (
              <DashboardView
                profile={profile}
                activeConditionId={activeConditionId}
                onActiveConditionChange={setActiveConditionId}
                onNavigate={setCurrentView}
                onEditProfile={handleEditProfile}
                campaignRefreshKey={campaignRefresh}
                onRetakeJourney={handleRetakeJourney}
                onRetakeModuleQuiz={handleRetakeModuleQuiz}
              />
            )}
            {currentView === 'plan' && (
              <PlanBreakdownView profile={profile} onNavigate={setCurrentView} />
            )}
            {currentView === 'hospitals' && (
              <HospitalNetworkView
                profile={profile}
                onNavigate={setCurrentView}
                highlightOffPlan={hospitalHighlightOffPlan}
                campaignRefreshKey={CAMPAIGN_LITERACY_ENABLED ? campaignRefresh : undefined}
              />
            )}
            {currentView === 'treatment' && (
              <TreatmentView
                profile={profile}
                focusConditionId={activeConditionId}
                onNavigate={setCurrentView}
                onEditProfile={handleEditProfile}
                prescriptions={prescriptions}
                campaignRefreshKey={CAMPAIGN_LITERACY_ENABLED ? campaignRefresh : undefined}
                browseAllConditions={browseAllConditions}
                onBrowseAllConditionsChange={setBrowseAllConditions}
              />
            )}
            {currentView === 'medication' && (
              <MedicationView
                profile={profile}
                focusConditionId={activeConditionId}
                onNavigate={setCurrentView}
                onEditProfile={handleEditProfile}
                prescriptions={prescriptions}
                campaignRefreshKey={CAMPAIGN_LITERACY_ENABLED ? campaignRefresh : undefined}
                browseAllConditions={browseAllConditions}
                onBrowseAllConditionsChange={setBrowseAllConditions}
              />
            )}
          </main>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#164e63,_#020617_45%)] text-slate-100">
      <TopNav
        currentView={currentView}
        onNavigate={setCurrentView}
        profile={profile}
        onEditProfile={handleEditProfile}
      />
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {currentView === 'dashboard'  && (
          <DashboardView
            profile={profile}
            onNavigate={setCurrentView}
            onEditProfile={handleEditProfile}
          />
        )}
        {currentView === 'plan'       && <PlanBreakdownView profile={profile} onNavigate={setCurrentView} />}
        {currentView === 'hospitals'  && (
          <HospitalNetworkView profile={profile} onNavigate={setCurrentView} />
        )}
        {currentView === 'treatment'  && (
          <TreatmentView
            profile={profile}
            onNavigate={setCurrentView}
            onEditProfile={handleEditProfile}
            prescriptions={prescriptions}
          />
        )}
        {currentView === 'medication' && (
          <MedicationView
            profile={profile}
            onNavigate={setCurrentView}
            onEditProfile={handleEditProfile}
            prescriptions={prescriptions}
          />
        )}
        {currentView === 'doctor' && (
          <DoctorView
            profile={profile}
            onNavigate={setCurrentView}
            prescriptions={prescriptions}
            onPrescriptionsChange={handlePrescriptionsChange}
          />
        )}
      </main>
    </div>
  );
}
