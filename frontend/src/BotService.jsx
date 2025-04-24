// Additional functions to connect our React UI to the backend API

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export class BotService {
  constructor() {
    this.sessionId = null;
    this.statusCheckInterval = null;
  }

  // Initialize the bot
  async initializeBot(delay) {
    try {
      const response = await axios.post(`${API_BASE_URL}/bot/initialize`, { delay });
      
      if (response.data.success) {
        this.sessionId = response.data.sessionId;
        return { success: true, sessionId: this.sessionId };
      }
      
      return { success: false, error: response.data.error || 'Failed to initialize bot' };
    } catch (error) {
      console.error('Error initializing bot:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to connect to bot service' 
      };
    }
  }

  // Start monitoring a product
  async startMonitoring(productUrl, userDetails, webhookUrl, onStatusUpdate) {
    try {
      if (!this.sessionId) {
        return { success: false, error: 'Bot not initialized' };
      }
      
      const response = await axios.post(`${API_BASE_URL}/bot/monitor`, {
        sessionId: this.sessionId,
        productUrl,
        userDetails,
        webhookUrl
      });
      
      if (response.data.success) {
        // Start polling for status updates
        this.startStatusPolling(onStatusUpdate);
        return { success: true };
      }
      
      return { success: false, error: response.data.error || 'Failed to start monitoring' };
    } catch (error) {
      console.error('Error starting monitoring:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to start monitoring' 
      };
    }
  }

  // Stop monitoring
  async stopMonitoring() {
    try {
      if (!this.sessionId) {
        return { success: false, error: 'Bot not initialized' };
      }
      
      const response = await axios.post(`${API_BASE_URL}/bot/stop`, {
        sessionId: this.sessionId
      });
      
      // Stop status polling
      this.stopStatusPolling();
      
      return { success: true };
    } catch (error) {
      console.error('Error stopping monitoring:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to stop monitoring' 
      };
    }
  }

  // Poll for status updates
  startStatusPolling(onStatusUpdate) {
    // Clear any existing interval
    this.stopStatusPolling();
    
    // Poll every 2 seconds
    this.statusCheckInterval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/bot/status/${this.sessionId}`);
        
        if (response.data.success && onStatusUpdate) {
          onStatusUpdate(response.data);
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    }, 2000);
  }

  // Stop status polling
  stopStatusPolling() {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }
  }

  // Clean up bot resources
  async cleanup() {
    try {
      if (!this.sessionId) {
        return;
      }
      
      this.stopStatusPolling();
      
      await axios.post(`${API_BASE_URL}/bot/cleanup`, {
        sessionId: this.sessionId
      });
      
      this.sessionId = null;
    } catch (error) {
      console.error('Error cleaning up bot:', error);
    }
  }
}

// Example usage in the React component:
/*
import React, { useEffect, useState } from 'react';
import { BotService } from './BotService';

function CheckoutBotApp() {
  const [botService] = useState(new BotService());
  
  // Initialize bot when component mounts
  useEffect(() => {
    const initBot = async () => {
      await botService.initializeBot(300);
    };
    
    initBot();
    
    // Clean up when component unmounts
    return () => {
      botService.cleanup();
    };
  }, []);

  const handleStartMonitoring = async () => {
    const userDetails = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      address1: address1,
      address2: address2,
      city: city,
      postalCode: postalCode,
      cardNumber: cardNumber,
      cardOwner: cardOwner,
      expiryDate: expiryDate,
      cvv: cvv
    };
    
    const result = await botService.startMonitoring(
      productUrl,
      userDetails,
      webhookUrl,
      (statusUpdate) => {
        // Update your component state based on status updates
        console.log('Status update:', statusUpdate);
      }
    );
    
    if (!result.success) {
      // Handle error
      console.error(result.error);
    }
  };

  const handleStopMonitoring = async () => {
    await botService.stopMonitoring();
  };
  
  // Your component JSX here...
}
*/