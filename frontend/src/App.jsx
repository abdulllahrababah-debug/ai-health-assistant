import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import DisclaimerBanner from './components/DisclaimerBanner';
import EmergencyButton from './components/EmergencyButton';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

import Home from './pages/Home';
import Assessment from './pages/Assessment';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import History from './pages/History';
import Chat from './pages/Chat';
import MedicalDictionary from './pages/MedicalDictionary';
import MedicineGuide from './pages/MedicineGuide';
import Admin from './pages/Admin';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              {/* Default first page is Login / Create Account */}
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Login defaultRegister={true} />} />
              <Route path="/home" element={<Home />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Main Medical Tools */}
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/dictionary" element={<MedicalDictionary />} />
              <Route path="/medicines" element={<MedicineGuide />} />
              
              {/* User History & Profile */}
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Protected Admin Dashboard */}
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <Admin />
                  </ProtectedAdminRoute>
                }
              />
            </Routes>
          </main>

          {/* Global Floating SOS Button for Jordan */}
          <EmergencyButton />

          <DisclaimerBanner variant="footer" />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}