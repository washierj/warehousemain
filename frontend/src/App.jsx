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
  

  // This would connect to your backend automation system
  
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
       addressLine &&
       cardNumber && cardOwner && expiryDate && cvv && webhookUrl;
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setStatus('idle');
    setStatusDetails('');
    setCheckCount(0);
  };

  // Simulation for UI demonstration - would be replaced with actual backend calls
  

  

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      stopMonitoring();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="text-red-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-900">TheWarehouse Auto Checkout Bot</h1>
          </div>
          <p className="text-gray-600">Fast, automatic checkout bot for TheWarehouse.co.nz</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Details */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Product & Bot Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product URL</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.thewarehouse.co.nz/product/..."
                    disabled={isMonitoring}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Delay (ms)</label>
                    <input
                      type="number"
                      value={delay}
                      onChange={(e) => setDelay(Number(e.target.value))}
                      min="100"
                      max="2000"
                      disabled={isMonitoring}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isMonitoring}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isMonitoring}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isMonitoring}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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
    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
  />
</div>

              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="XXXX XXXX XXXX XXXX"
                    disabled={isMonitoring}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Owner</label>
                    <input
                      type="text"
                      value={cardOwner}
                      onChange={(e) => setCardOwner(e.target.value)}
                      disabled={isMonitoring}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Status Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Bot Status</h2>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-700">Status:</span>
                    {status === 'idle' && <span className="text-gray-500">Idle</span>}
                    {status === 'monitoring' && (
                      <span className="flex items-center text-blue-600">
                        <RefreshCw size={16} className="mr-1 animate-spin" /> Monitoring
                      </span>
                    )}
                    {status === 'checkout' && (
                      <span className="flex items-center text-yellow-600">
                        <ShoppingCart size={16} className="mr-1" /> Checking Out
                      </span>
                    )}
                    {status === 'success' && (
                      <span className="flex items-center text-green-600">
                        <CheckCircle size={16} className="mr-1" /> Success
                      </span>
                    )}
                    {status === 'error' && (
                      <span className="flex items-center text-red-600">
                        <AlertCircle size={16} className="mr-1" /> Error
                      </span>
                    )}
                  </div>
                  
                  {statusDetails && (
                    <div className="text-sm text-gray-600 mt-1 border-l-2 border-gray-300 pl-2">
                      {statusDetails}
                    </div>
                  )}
                </div>
                
                {isMonitoring && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock size={14} />
                      <span>Last Check: {lastCheck ? lastCheck.toLocaleTimeString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <RefreshCw size={14} />
                      <span>Check Count: {checkCount}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <AlertTriangle size={14} />
                      <span>Refresh Rate: {delay}ms</span>
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  {!isMonitoring ? (
                    <button
                      onClick={startMonitoring}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      Start Monitoring & Checkout
                    </button>
                  ) : (
                    <button
                      onClick={stopMonitoring}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      Stop Bot
                    </button>
                  )}
                </div>
                
                {/* Activity Log - could be expanded in a real implementation */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Activity Log</h3>
                  <div className="bg-gray-50 rounded p-2 h-40 overflow-y-auto text-xs text-gray-600">
                    {lastCheck && (
                      <>
                        <div className="mb-1">{lastCheck.toLocaleTimeString()} - Bot started monitoring</div>
                        {checkCount > 1 && (
                          <div className="mb-1">{lastCheck.toLocaleTimeString()} - Checked product ({checkCount} times)</div>
                        )}
                        {status === 'checkout' && (
                          <div className="mb-1 text-yellow-600">{new Date().toLocaleTimeString()} - {statusDetails}</div>
                        )}
                        {status === 'success' && (
                          <div className="mb-1 text-green-600">{new Date().toLocaleTimeString()} - {statusDetails}</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-6 text-center text-gray-500 text-xs">
          <p>TheWarehouse Auto Checkout Bot | For personal use only</p>
        </footer>
      </div>
    </div>
  );
}