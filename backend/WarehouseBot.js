const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// ✅ Get executablePath from plain puppeteer (not puppeteer-extra)
const puppeteerCore = require('puppeteer');
const { executablePath } = puppeteerCore;

// Add stealth plugin
puppeteer.use(StealthPlugin());


const bypassCloudflare = async (targetUrl) => {
  try {
    const response = await axios.post('http://localhost:3001/api/solve', {

      url: targetUrl
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.result && response.data.result.cookies && response.data.result.userAgent) {
      return {
        cookies: response.data.result.cookies,
        userAgent: response.data.result.userAgent
      };
    } else {
      throw new Error('Invalid flare-bypasser response');
    }
  } catch (err) {
    console.error('Cloudflare bypass failed:', err.message);
    return null;
  }
};



class WarehouseBot {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.sessionId = uuidv4();
    
    // Default configuration
    this.config = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
      viewPort: { width: 1920, height: 1080 },
      proxyServer: null, // e.g. 'http://username:password@proxy.example.com:8080'
      refreshDelay: 3500,
      typingDelay: { min: 10, max: 25 },
      mouseMovementEnabled: true
    };
  }

  // Initialize the bot with user configuration
  async initialize(userConfig = {}) {
    try {
      this.config = { ...this.config, ...userConfig };
      
      // Launch browser with stealth mode
      const launchOptions = {
        headless: false, // Set to true for production, false for debugging
        executablePath: executablePath(),
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-dev-shm-usage',
          '--window-size=1920,1080',
          '--disable-blink-features=AutomationControlled'
        ]
      };
      
      // Add proxy if configured
      if (this.config.proxyServer) {
        launchOptions.args.push(`--proxy-server=${this.config.proxyServer}`);
      }
      
      this.browser = await puppeteer.launch(launchOptions);
      this.page = await this.browser.newPage();
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
await this.page.setViewport({ width: 1280, height: 800 });
await this.page.setExtraHTTPHeaders({
  'Accept-Language': 'en-US,en;q=0.9'
});


      
      
      // Set viewport
      await this.page.setViewport(this.config.viewPort);
      
      // Enable human-like behavior
      if (this.config.mouseMovementEnabled) {
        await this.enableHumanBehavior();
      }
      
      // Handle Cloudflare challenges automatically
      await this.setupCloudflareBypasser();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize bot:', error);
      return false;
    }
  }

  // Setup Cloudflare bypass mechanisms
  async setupCloudflareBypasser() {
    // Listen for Cloudflare challenges
    this.page.on('response', async (response) => {
      const url = response.url();
      const status = response.status();
      
      // If we get a Cloudflare challenge page
      if (status === 403 || status === 503) {
        if (url.includes('cdn-cgi/challenge-platform')) {
          console.log('Cloudflare challenge detected, waiting to solve...');
          // Wait longer for challenge to be solved
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    });
  }

  // Simulate human-like behavior
  async enableHumanBehavior() {
    // Override the navigator permissions
    await this.page.evaluateOnNewDocument(() => {
      // Overwrite the navigator permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
      
      // Overwrite plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      // Overwrite languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
      
      // Hide webdriver flag
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
  }

  // Type text with random delays between keystrokes
  async typeWithDelay(selector, text) {
    await this.page.waitForSelector(selector);
    
    // Clear existing text
    await this.page.evaluate((sel) => {
      document.querySelector(sel).value = '';
    }, selector);
    
    // Type with random delays
    for (const char of text) {
      await this.page.type(selector, char, {
        delay: Math.floor(Math.random() * 
          (this.config.typingDelay.max - this.config.typingDelay.min) + 
          this.config.typingDelay.min)
      });
    }
  }

  // Send webhook notification to Discord
  async sendWebhook(webhookUrl, message, color = 0x00AAFF, title = null) {
    try {
      if (!webhookUrl) return;
      
      const data = {
        username: 'TheWarehouse Bot',
        embeds: [{
          title: title || 'Bot Status Update',
          description: message,
          color: color,
          timestamp: new Date().toISOString()
        }]
      };
      
      await axios.post(webhookUrl, data);
    } catch (error) {
      console.error('Failed to send webhook:', error);
    }
  }

  // Start monitoring a product
  async startMonitoring(productUrl, userDetails, webhookUrl) {
    if (this.isMonitoring) return;
  
    this.isMonitoring = true;
    let checkCount = 0;
  
    // Send initial webhook
    await this.sendWebhook(
      webhookUrl, 
      `🔍 Started monitoring: ${productUrl}`,
      0x5865F2, 
      'Monitoring Started'
    );
  
    while (this.isMonitoring) {
      try {
        checkCount++;
        console.log(`Check #${checkCount}: Checking product availability...`);
  
        if (this.page && !this.page.isClosed()) {
          try {
            const bypassData = await bypassCloudflare(productUrl);

            if (bypassData) {
              await this.page.setUserAgent(bypassData.userAgent);
              await this.page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
            
              // Go to blank page to cleanly set cookies
              await this.page.goto('about:blank');
            
              // Set cookies
              await this.page.setCookie(...bypassData.cookies);
            
              // Short delay
              await new Promise(resolve => setTimeout(resolve, 500));
            
              // Now visit the actual product URL
              await this.page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            } else {
              // If bypass failed, fallback to direct navigation
              await this.page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));

            try {
              await this.page.waitForSelector('#cf-spinner-please-wait', { timeout: 2500 });
              console.log('⏳ Cloudflare challenge detected, waiting...');
              await this.page.waitForTimeout(8000);  // Or longer if needed
            } catch (e) {
              // No Cloudflare challenge, continue
            }
            
  
            await this.page.waitForSelector('button.btn.btn-container.btn-block', { timeout: 2000 });
            const addToCartButton = await this.page.$('button.btn.btn-container.btn-block');
  
            if (addToCartButton) {
              console.log('Product is in stock! Starting checkout process...');
              this.isMonitoring = false;
              await this.sendWebhook(webhookUrl, '🚨 Product in stock! Starting checkout process...', 0xFEE75C, 'Checkout Started');
              await this.performCheckout(userDetails, webhookUrl);
              break;
            } else {
              console.log('Product out of stock or button not found, continuing to monitor...');
            }
          } catch (err) {
            console.error(`🛑 Page navigation failed (${productUrl}):`, err.message);
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        } else {
          console.error('Page is closed or not available');
          break;
        }
      } catch (error) {
        console.error('Error during monitoring:', error.message);
      }
  
      // Wait before next loop
      await new Promise(resolve => setTimeout(resolve, this.config.refreshDelay));
    }
  }
  
  

  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.isMonitoring = false;
      console.log('Monitoring stopped');
    }
  }

  // Perform the complete checkout process
  async performCheckout(userDetails, webhookUrl) {
    try {
      // Step 1: Click "Add to Cart"
      await this.sendWebhook(webhookUrl, '1️⃣ Adding item to cart...', 0xFEE75C);
      
      // Use XPath to find the button with more reliable text matching
      if (!this.page || typeof this.page.$x !== 'function') {
        throw new Error('this.page is not a valid Puppeteer page or $x is missing');
      }
      
      const addButton = await this.page.$('button.btn.btn-container.btn-block');
      if (addButton) {
        await addButton.click();
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        throw new Error("Add to Cart button not found.");
      }
      
      // Wait for modal to appear and click "Go to Cart"
      await this.page.waitForSelector('a.btn.btn-container[href="https://www.thewarehouse.co.nz/cart"]', { timeout: 10000 });
      await this.page.click('a.btn.btn-container[href="https://www.thewarehouse.co.nz/cart"]');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 2: On cart page, ensure "Standard Delivery" is selected
      await this.sendWebhook(webhookUrl, '2️⃣ In cart, selecting delivery options...', 0xFEE75C);
      await this.page.waitForSelector('label.form-check-label[for="delivery"]', { timeout: 10000 });
      await this.page.click('label.form-check-label[for="delivery"]');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Click "Proceed to checkout"
      await this.page.waitForSelector('a.btn.btn-container.btn-block.checkout-btn[href="https://www.thewarehouse.co.nz/checkout"]', { timeout: 10000 });
      await this.page.click('a.btn.btn-container.btn-block.checkout-btn[href="https://www.thewarehouse.co.nz/checkout"]');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Enter guest email and agree to terms
      await this.sendWebhook(webhookUrl, '3️⃣ Entering guest email...', 0xFEE75C);
      await this.page.waitForSelector('#guest-form-email', { timeout: 10000 });
      await this.typeWithDelay('#guest-form-email', userDetails.email);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Click T&C checkbox
      await this.page.waitForSelector('label[for="guest-form-terms-and-conditions"]', { timeout: 10000 });
      await this.page.click('label[for="guest-form-terms-and-conditions"]');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Click "Checkout as Guest"
      await this.page.waitForSelector('button.btn.btn-block.btn-outline-primary.checkout-as-guest', { timeout: 10000 });
      await this.page.click('button.btn.btn-block.btn-outline-primary.checkout-as-guest');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 4: Fill in shipping information
      await this.sendWebhook(webhookUrl, '4️⃣ Filling in shipping details...', 0xFEE75C);
      
      // Fill name and phone
      await this.page.waitForSelector('#shippingFirstNamedefault', { timeout: 10000 });
      await this.typeWithDelay('#shippingFirstNamedefault', userDetails.firstName);
      await this.typeWithDelay('#shippingLastNamedefault', userDetails.lastName);
      await this.typeWithDelay('#shippingPhoneNumberdefault', userDetails.phone);
      await new Promise(resolve => setTimeout(resolve, 300
      ));
      
      // Use address finder bypass
      // First type something to trigger the address finder
    // Use single addressLine input + dropdown suggestion
// Focus and type address slowly
const addressInputSelector = 'input[placeholder*="Start typing your address"]';
const dropdownLinkSelector = 'a.js-full-address-selector';

await this.page.waitForSelector(addressInputSelector, { timeout: 10000 });
await this.page.type(addressInputSelector, userDetails.addressLine); // fast typing
await this.page.focus(addressInputSelector); // keep focus for dropdown to appear

// Wait for dropdown to appear
await this.page.waitForSelector(dropdownLinkSelector, { timeout: 7000 });
await this.page.waitForTimeout(1500); // Let suggestions settle

// Click dropdown using evaluate to avoid detaching issues
await this.page.evaluate((selector) => {
  const link = document.querySelector(selector);
  if (link) link.click();
}, dropdownLinkSelector);

// Wait before continuing
await this.page.waitForTimeout(500);

// Proceed to next step
await this.page.waitForSelector('button.submit-shipping', { timeout: 10000 });
await this.page.click('button.submit-shipping');
await this.page.waitForTimeout(500);


      
      // Click "Deliver to this address"
// ✅ Wait a bit to ensure address selection updates form state
await this.page.waitForTimeout(2000);

// ✅ Scroll to the button to ensure it's in view
await this.page.evaluate(() => {
  const btn = document.querySelector('button.submit-shipping');
  if (btn) {
    btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

// ✅ Click the button using evaluate to avoid blocked clicks
await this.page.evaluate(() => {
  const btn = document.querySelector('button.submit-shipping');
  if (btn) btn.click();
});

await this.page.waitForTimeout(1000);

      
      
      // Step 5: Fill payment details
      await this.sendWebhook(webhookUrl, '5️⃣ Entering payment information...', 0xFEE75C);
      
      // Wait for payment form to load
      await this.page.waitForSelector('#creditCardNumber', { timeout: 15000 });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Fill card details
      await this.typeWithDelay('#creditCardNumber', userDetails.cardNumber);
      await this.typeWithDelay('#creditCardOwner', userDetails.cardOwner);
      await this.typeWithDelay('#expirationDate', userDetails.expiryDate);
      await this.typeWithDelay('#creditSecurityCode', userDetails.cvv);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Submit payment
      await this.sendWebhook(webhookUrl, '6️⃣ Confirming payment...', 0xFEE75C);
      await this.page.waitForSelector('button.btn.btn-container.submit-payment[type="submit"][name="submit"][value="submit-payment"]', { timeout: 10000 });
      await this.page.click('button.btn.btn-container.submit-payment[type="submit"][name="submit"][value="submit-payment"]');
      
      // Wait for order confirmation
      try {
        // Look for any element that indicates successful order placement
        await this.page.waitForSelector('.order-thank-you-msg', { timeout: 30000 });
        
        // Send success webhook
        await this.sendWebhook(
          webhookUrl,
          '✅ Checkout successful! Order has been placed.',
          0x57F287,
          'Checkout Successful'
        );
        
        // Take screenshot of confirmation
        const screenshot = await this.page.screenshot();
        
        // Could send the screenshot in a follow-up webhook or save it locally
        console.log('Order placed successfully!');
        
        return true;
      } catch (error) {
        // If timeout or other error, we assume checkout failed
        await this.sendWebhook(
          webhookUrl,
          '❌ Checkout process timed out or failed at final step.',
          0xED4245,
          'Checkout Failed'
        );
        console.error('Failed at final checkout step:', error);
        return false;
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      await this.sendWebhook(
        webhookUrl,
        `❌ Error during checkout: ${error.message}`,
        0xED4245,
        'Checkout Error'
      );
      return false;
    }
  }

  // Clean up resources
  async close() {
    this.stopMonitoring();
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Export the bot class
module.exports = WarehouseBot;