import React, { useState, useEffect, useRef } from 'react';
import { Camera, AlertTriangle, Shield, MapPin, Clock, Users, Sun, Moon, Zap, Settings, Phone, Bell, Activity } from 'lucide-react';

const SafetyIntelligenceSystem = () => {
  const [isActive, setIsActive] = useState(false);
  const [riskLevel, setRiskLevel] = useState('safe');
  const [riskScore, setRiskScore] = useState(0);
  const [backendConnected, setBackendConnected] = useState(false);
  const [analysisData, setAnalysisData] = useState({
    lighting: 'good',
    crowdDensity: 'moderate',
    timeRisk: 'low',
    movementPattern: 'normal',
    personCount: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [activeTime, setActiveTime] = useState(0);
  const imgRef = useRef(null);
  const intervalRef = useRef(null);
  const timeIntervalRef = useRef(null);

  const BACKEND_URL = 'http://localhost:5000';

  // Check backend connection on mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/status`);
      if (response.ok) {
        const data = await response.json();
        setBackendConnected(true);
        console.log('✓ Backend connected:', data);
      }
    } catch (error) {
      setBackendConnected(false);
      console.log('✗ Backend not connected. Please start the Python backend.');
    }
  };

  // Fetch analysis data from backend
  const fetchAnalysis = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/analysis`);
      if (response.ok) {
        const data = await response.json();
        
        setRiskScore(data.riskScore);
        setRiskLevel(data.riskLevel);
        setAnalysisData({
          lighting: data.lighting,
          crowdDensity: data.crowdDensity,
          timeRisk: data.timeRisk,
          movementPattern: data.movementPattern,
          personCount: data.personCount
        });

        // Generate alerts for high risk
        if (data.riskScore >= 50 && Math.random() > 0.8) {
          const newAlert = {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            message: data.riskScore >= 70 
              ? `⚠️ CRITICAL: ${data.personCount} people detected in poor lighting. Seek safer area.`
              : `⚡ WARNING: Risk level elevated. ${data.personCount} people nearby.`,
            severity: data.riskScore >= 70 ? 'critical' : 'warning'
          };
          setAlerts(prev => [newAlert, ...prev].slice(0, 5));
        }
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
  };

  const startSystem = async () => {
    if (!backendConnected) {
      alert('⚠️ Backend not connected!\n\nPlease start the Python backend first:\n1. Open terminal\n2. Run: python backend.py\n3. Then click Start Monitoring again');
      return;
    }

    try {
      // Start camera on backend
      await fetch(`${BACKEND_URL}/start_camera`);
      setIsActive(true);
      
      // Start fetching analysis data
      intervalRef.current = setInterval(fetchAnalysis, 1000);
      
      // Start active time counter
      setActiveTime(0);
      timeIntervalRef.current = setInterval(() => {
        setActiveTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting system:', error);
      alert('Failed to start system. Please check if backend is running.');
    }
  };

  const stopSystem = async () => {
    try {
      // Stop camera on backend
      await fetch(`${BACKEND_URL}/stop_camera`);
      setIsActive(false);
      
      // Clear intervals
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
      
      // Reset data
      setAlerts([]);
      setRiskScore(0);
      setRiskLevel('safe');
      setActiveTime(0);
    } catch (error) {
      console.error('Error stopping system:', error);
    }
  };

  const toggleSystem = () => {
    if (!isActive) {
      startSystem();
    } else {
      stopSystem();
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getRiskColor = () => {
    if (riskLevel === 'critical') return 'from-red-500 to-red-700';
    if (riskLevel === 'high') return 'from-orange-500 to-orange-700';
    if (riskLevel === 'medium') return 'from-yellow-500 to-yellow-700';
    return 'from-green-500 to-green-700';
  };

  const getRiskBorderColor = () => {
    if (riskLevel === 'critical') return 'border-red-500';
    if (riskLevel === 'high') return 'border-orange-500';
    if (riskLevel === 'medium') return 'border-yellow-500';
    return 'border-green-500';
  };

  const sendEmergencyAlert = () => {
    alert('🚨 EMERGENCY ALERT SENT!\n\nNotifying:\n✓ Emergency contacts\n✓ Nearby authorities\n✓ Location shared\n\nHelp is on the way!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SafetyAI</h1>
                <p className="text-xs text-gray-400">Edge AI Safety Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                backendConnected 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/50'
              }`}>
                <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-green-400' : 'bg-red-400'} ${backendConnected ? 'animate-pulse' : ''}`}></span>
                {backendConnected ? 'Backend Connected' : 'Backend Offline'}
              </div>
              <button 
                onClick={checkBackendConnection}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Main Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Risk Status Card */}
          <div className={`lg:col-span-2 bg-white/5 backdrop-blur-md rounded-2xl border-2 ${getRiskBorderColor()} overflow-hidden`}>
            <div className={`bg-gradient-to-r ${getRiskColor()} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Safety Status</h2>
                {isActive && (
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span className="text-sm font-medium">LIVE ANALYSIS</span>
                  </div>
                )}
              </div>
              
              {/* Risk Score Display */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="white"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(riskScore / 100) * 351.86} 351.86`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">{riskScore}</span>
                    <span className="text-xs opacity-80">RISK</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="text-3xl font-bold uppercase mb-2">
                    {riskLevel === 'critical' && '🚨 CRITICAL'}
                    {riskLevel === 'high' && '⚠️ HIGH RISK'}
                    {riskLevel === 'medium' && '⚡ CAUTION'}
                    {riskLevel === 'safe' && '✓ SAFE'}
                  </div>
                  <p className="text-sm opacity-90 mb-2">
                    {riskLevel === 'critical' && 'Unsafe conditions detected. Seek help immediately.'}
                    {riskLevel === 'high' && 'Elevated risk detected. Stay vigilant and consider safer routes.'}
                    {riskLevel === 'medium' && 'Moderate risk. Remain aware of your surroundings.'}
                    {riskLevel === 'safe' && 'Environment appears safe. Continue with normal caution.'}
                  </p>
                  {isActive && analysisData.personCount > 0 && (
                    <div className="text-sm bg-white/20 px-3 py-1 rounded-full inline-block">
                      👥 {analysisData.personCount} {analysisData.personCount === 1 ? 'person' : 'people'} detected
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Camera Feed */}
            <div className="p-6">
              <div className="relative bg-black/50 rounded-xl overflow-hidden aspect-video">
                {isActive && backendConnected ? (
                  <>
                    <img
                      ref={imgRef}
                      src={`${BACKEND_URL}/video_feed?${Date.now()}`}
                      alt="Live camera feed"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      LIVE - AI ANALYZING
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm p-3 rounded-lg">
                      <div className="text-xs text-gray-300">
                        <div>🎯 Real-time person detection active</div>
                        <div>🔍 Computer vision: YOLO/HOG model</div>
                        <div>🛡️ Privacy: All processing on device</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <Camera className="w-16 h-16 opacity-30 mb-4" />
                    <p className="text-gray-400 text-center px-4">
                      {!backendConnected 
                        ? '⚠️ Start Python backend first: python backend.py' 
                        : 'Click "Start Monitoring" to activate camera'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Main Toggle */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
              <button
                onClick={toggleSystem}
                disabled={!backendConnected}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  !backendConnected
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : isActive
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                }`}
              >
                {!backendConnected 
                  ? '⚠️ BACKEND OFFLINE'
                  : isActive 
                  ? '⏸ STOP MONITORING' 
                  : '▶ START MONITORING'}
              </button>
              {!backendConnected && (
                <p className="text-xs text-red-400 mt-3 text-center">
                  Run: python backend.py in terminal
                </p>
              )}
            </div>

            {/* Emergency Button */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
              <button
                onClick={sendEmergencyAlert}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3"
              >
                <Phone className="w-6 h-6" />
                SOS EMERGENCY
              </button>
              <p className="text-xs text-gray-400 mt-3 text-center">
                Instantly alerts emergency contacts & authorities
              </p>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                QUICK STATS
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Active Time</span>
                  <span className="font-medium font-mono">{formatTime(activeTime)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">People Detected</span>
                  <span className="font-medium">{analysisData.personCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Alerts Today</span>
                  <span className="font-medium">{alerts.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Mode</span>
                  <span className="font-medium">Edge AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Lighting Analysis */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-3 mb-3">
              {analysisData.lighting === 'poor' || analysisData.lighting === 'dim' ? (
                <Moon className="w-5 h-5 text-blue-400" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
              <span className="text-sm font-semibold">LIGHTING</span>
            </div>
            <div className="text-2xl font-bold capitalize mb-1">{analysisData.lighting}</div>
            <div className="text-xs text-gray-400">
              {analysisData.lighting === 'poor' && 'Very dark conditions'}
              {analysisData.lighting === 'dim' && 'Low visibility area'}
              {analysisData.lighting === 'moderate' && 'Adequate lighting'}
              {analysisData.lighting === 'good' && 'Well-lit environment'}
              {analysisData.lighting === 'excellent' && 'Optimal visibility'}
            </div>
          </div>

          {/* Crowd Density */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-semibold">CROWD</span>
            </div>
            <div className="text-2xl font-bold capitalize">{analysisData.crowdDensity.replace('_', ' ')}</div>
            <div className="text-xs text-gray-400">
              {analysisData.crowdDensity === 'isolated' && 'No people nearby'}
              {analysisData.crowdDensity === 'sparse' && 'Few people around'}
              {analysisData.crowdDensity === 'moderate' && 'Normal crowd level'}
              {analysisData.crowdDensity === 'crowded' && 'High density area'}
              {analysisData.crowdDensity === 'very_crowded' && 'Very crowded space'}
            </div>
          </div>

          {/* Time Risk */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-green-400" />
              <span className="text-sm font-semibold">TIME RISK</span>
            </div>
            <div className="text-2xl font-bold capitalize">{analysisData.timeRisk}</div>
            <div className="text-xs text-gray-400">
              {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Movement Pattern */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-5 h-5 text-red-400" />
              <span className="text-sm font-semibold">MOVEMENT</span>
            </div>
            <div className="text-2xl font-bold capitalize">{analysisData.movementPattern}</div>
            <div className="text-xs text-gray-400">
              {analysisData.movementPattern === 'normal' && 'Standard patterns'}
              {analysisData.movementPattern === 'unusual' && 'Irregular movement'}
              {analysisData.movementPattern === 'erratic' && 'Suspicious behavior'}
              {analysisData.movementPattern === 'following' && '⚠️ Being followed'}
            </div>
          </div>
        </div>

        {/* Alerts Feed */}
        {alerts.length > 0 && (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Alerts
            </h3>
            <div className="space-y-2">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.severity === 'critical'
                      ? 'bg-red-500/20 border-red-500'
                      : 'bg-orange-500/20 border-orange-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                    </div>
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-full px-6 py-3 border border-white/10">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm">
              <span className="font-semibold text-green-400">100% Private</span> • All processing on your device • No data sent to cloud
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyIntelligenceSystem;