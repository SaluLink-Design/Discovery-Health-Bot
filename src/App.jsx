import { useState } from 'react';
import DashboardView from './components/DashboardView';
import DoctorView from './components/DoctorView';
import HospitalNetworkView from './components/HospitalNetworkView';
import MedicationView from './components/MedicationView';
import PatientProfilePanel from './components/PatientProfilePanel';
import TopNav from './components/TopNav';
import TreatmentView from './components/TreatmentView';
import { loadProfile, saveProfile } from './lib/profileStore';
import { loadPrescriptions, savePrescriptions, seedDemoData } from './lib/prescriptionStore';

export default function App() {
  const [profile, setProfile] = useState(() => loadProfile());
  const [isEditingProfile, setIsEditingProfile] = useState(!loadProfile());
  const [currentView, setCurrentView] = useState('dashboard');
  const [prescriptions, setPrescriptions] = useState(() => {
    const p = loadProfile();
    const existing = loadPrescriptions();
    const isEmpty = Object.keys(existing).length === 0;
    return isEmpty && p ? seedDemoData(p) : existing;
  });

  const handlePrescriptionsChange = (updated) => {
    savePrescriptions(updated);
    setPrescriptions(updated);
  };

  const handleProfileSave = (newProfile) => {
    saveProfile(newProfile);
    setProfile(newProfile);
    setPrescriptions(seedDemoData(newProfile));
    setIsEditingProfile(false);
    setCurrentView('dashboard');
  };

  const handleProfileCancel = () => {
    setIsEditingProfile(false);
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  if (!profile || isEditingProfile) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#164e63,_#020617_45%)] text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-12">
          <div className="mb-10 text-center">
            <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Powered by Authi
            </span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
              Discovery Health Benefits
            </h1>
            <p className="mt-2 text-base text-slate-400">
              Set up your profile to explore your personalised coverage.
            </p>
          </div>
          <PatientProfilePanel
            onSave={handleProfileSave}
            onEdit={handleProfileCancel}
            isEditing
            savedProfile={profile}
          />
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
        {currentView === 'dashboard'  && <DashboardView profile={profile} onNavigate={setCurrentView} />}
        {currentView === 'hospitals'  && (
          <HospitalNetworkView profile={profile} onNavigate={setCurrentView} />
        )}
        {currentView === 'treatment'  && (
          <TreatmentView
            profile={profile}
            onNavigate={setCurrentView}
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
