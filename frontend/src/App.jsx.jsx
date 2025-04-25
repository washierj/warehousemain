import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, ShoppingCart, Clock, AlertTriangle } from 'lucide-react';
import { BotService } from './BotService';

export default function CheckoutBot() {
  const [url, setUrl] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardOwner, setCardOwner] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [delay, setDelay] = useState(300);
  const [webhookUrl, setWebhookUrl] = useState('');
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [status, setStatus] = useState('idle');
  const [statusDetails, setStatusDetails] = useState('');
  const [lastCheck, setLastCheck] = useState(null);
  const [checkCount, setCheckCount] = useState(0);

  const [botService] = useState(new BotService());
  
  const startMonitoring = async () => {
    if (!validateInputs()) {
      setStatus('error');
      setStatusDetails('Please fill in all required fields');
      return;
    }

    const initResult = await botService.initializeBot(delay);
    if (!initResult.success) {
      setStatus('error');
      setStatusDetails('Failed to initialize bot');
      return;
    }

    const userDetails = {
      firstName, lastName, email, phone, addressLine,
      cardNumber, cardOwner, expiryDate, cvv
    };
    
    setIsMonitoring(true);
    setStatus('monitoring');
    setStatusDetails('Monitoring product for stock...');
    setCheckCount(0);

    const result = await botService.startMonitoring(url, userDetails, webhookUrl, (statusUpdate) => {
      setLastCheck(new Date());
      setCheckCount(prev => prev + 1);
      setStatusDetails(statusUpdate.isMonitoring ? 'Monitoring product for stock...' : 'Bot stopped or completed');
      setStatus(statusUpdate.isMonitoring ? 'monitoring' : 'idle');
    });

    if (!result.success) {
      setStatus('error');
      setStatusDetails(result.error);
      setIsMonitoring(false);
    }
  };

  const validateInputs = () => {
    return url && firstName && lastName && email && phone &&
       addressLine && cardNumber && cardOwner && expiryDate && cvv && webhookUrl;
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setStatus('idle');
    setStatusDetails('');
    setCheckCount(0);
  };

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      stopMonitoring();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <div className="bg-red-600 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-3">
            {/* Logo representation */}
            <div className="bg-red-600 rounded-lg w-10 h-10 flex items-center justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-5 bg-white transform rotate-12"></div>
                <div className="w-2 h-5 bg-white transform rotate-12"></div>
              </div>
            </div>
            <h1 className="text-2xl font-bold">ReggieFNF Warehouse ACO</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <p className="text-gray-600">Fast, automatic checkout bot for TheWarehouse.co.nz</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Form Sections */}
          <div className="lg:col-span-8 space-y-6">
            {/* Product Details Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-red-600 flex items-center">
                <ShoppingCart size={20} className="mr-2" />
                Product & Bot Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product URL</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.thewarehouse.co.nz/product/..."
                    disabled={isMonitoring}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Delay (ms)</label>
                    <input
                      type="number"
                      value={delay}
                      onChange={(e) => setDelay(Number(e.target.value))}
                      min="100"
                      max="2000"
                      disabled={isMonitoring}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discord Webhook URL</label>
                    <input
                      type="text"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://discord.com/api/webhooks/..."
                      disabled={isMonitoring}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-red-600">Customer Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isMonitoring}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isMonitoring}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isMonitoring}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    disabled={isMonitoring}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line</label>
                  <input
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    disabled={isMonitoring}
                    placeholder="123 Queen Street, Auckland"
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Information Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-red-600">Payment Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="XXXX XXXX XXXX XXXX"
                    disabled={isMonitoring}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Owner</label>
                    <input
                      type="text"
                      value={cardOwner}
                      onChange={(e) => setCardOwner(e.target.value)}
                      disabled={isMonitoring}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="MM/YY"
                      disabled={isMonitoring}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      disabled={isMonitoring}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Status Panel */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
              <h2 className="text-xl font-semibold mb-6 text-red-600 text-center">Bot Status</h2>
              
              {/* Status Indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  {status === 'idle' && (
                    <div className="bg-gray-100 text-gray-600 py-3 px-6 rounded-full flex items-center justify-center w-full">
                      <span className="flex items-center">
                        <Clock size={18} className="mr-2" /> Idle
                      </span>
                    </div>
                  )}
                  {status === 'monitoring' && (
                    <div className="bg-blue-50 text-blue-600 py-3 px-6 rounded-full flex items-center justify-center w-full">
                      <span className="flex items-center">
                        <RefreshCw size={18} className="mr-2 animate-spin" /> Monitoring
                      </span>
                    </div>
                  )}
                  {status === 'checkout' && (
                    <div className="bg-yellow-50 text-yellow-600 py-3 px-6 rounded-full flex items-center justify-center w-full">
                      <span className="flex items-center">
                        <ShoppingCart size={18} className="mr-2" /> Checking Out
                      </span>
                    </div>
                  )}
                  {status === 'success' && (
                    <div className="bg-green-50 text-green-600 py-3 px-6 rounded-full flex items-center justify-center w-full">
                      <span className="flex items-center">
                        <CheckCircle size={18} className="mr-2" /> Success
                      </span>
                    </div>
                  )}
                  {status === 'error' && (
                    <div className="bg-red-50 text-red-600 py-3 px-6 rounded-full flex items-center justify-center w-full">
                      <span className="flex items-center">
                        <AlertCircle size={18} className="mr-2" /> Error
                      </span>
                    </div>
                  )}
                </div>
                
                {statusDetails && (
                  <div className="text-sm text-center text-gray-600 p-3 bg-gray-50 rounded-lg">
                    {statusDetails}
                  </div>
                )}
              </div>
              
              {/* Stats */}
              {isMonitoring && (
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} className="text-red-500" />
                      <span>Last Check:</span>
                    </div>
                    <span className="font-medium">{lastCheck ? lastCheck.toLocaleTimeString() : 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <RefreshCw size={16} className="text-red-500" />
                      <span>Check Count:</span>
                    </div>
                    <span className="font-medium">{checkCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <AlertTriangle size={16} className="text-red-500" />
                      <span>Refresh Rate:</span>
                    </div>
                    <span className="font-medium">{delay}ms</span>
                  </div>
                </div>
              )}
              
              {/* Action Button */}
              <div className="mt-4">
                {!isMonitoring ? (
                  <button
                    onClick={startMonitoring}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <ShoppingCart size={18} className="mr-2" />
                    Start Monitoring & Checkout
                  </button>
                ) : (
                  <button
                    onClick={stopMonitoring}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <AlertCircle size={18} className="mr-2" />
                    Stop Bot
                  </button>
                )}
              </div>
              
              {/* Activity Log */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Clock size={14} className="mr-1" /> Activity Log
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 h-48 overflow-y-auto text-xs text-gray-600 border border-gray-100">
                  {lastCheck && (
                    <>
                      <div className="p-2 mb-1 border-l-2 border-blue-400">
                        <span className="text-blue-500 font-medium">{lastCheck.toLocaleTimeString()}</span> - Bot started monitoring
                      </div>
                      {checkCount > 1 && (
                        <div className="p-2 mb-1 border-l-2 border-gray-400">
                          <span className="text-gray-500 font-medium">{lastCheck.toLocaleTimeString()}</span> - Checked product ({checkCount} times)
                        </div>
                      )}
                      {status === 'checkout' && (
                        <div className="p-2 mb-1 border-l-2 border-yellow-400 bg-yellow-50">
                          <span className="text-yellow-600 font-medium">{new Date().toLocaleTimeString()}</span> - {statusDetails}
                        </div>
                      )}
                      {status === 'success' && (
                        <div className="p-2 mb-1 border-l-2 border-green-400 bg-green-50">
                          <span className="text-green-600 font-medium">{new Date().toLocaleTimeString()}</span> - {statusDetails}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-10 text-center text-gray-500 text-sm py-4 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2">
            <div className="bg-red-600 rounded w-5 h-5 flex items-center justify-center">
              <div className="flex space-x-px">
                <div className="w-1 h-3 bg-white transform rotate-12"></div>
                <div className="w-1 h-3 bg-white transform rotate-12"></div>
              </div>
            </div>
            <p>ReggieFNF Warehouse ACO | For grommets only</p>
          </div>
        </footer>
      </div>
    </div>
  );
}