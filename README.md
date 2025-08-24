# AetherWeb3 Website

🚀 **Professional multi-EVM gateway website with Infura.io-inspired design**

## 🌟 Features

### 🎨 Modern Design
- **Infura.io-inspired** professional interface
- **White/Black/Red** color scheme with corporate branding
- **Responsive design** that works on all devices
- **Smooth animations** and hover effects
- **Corporate images** integrated from cloud storage

### 🔐 Complete Authentication System
- **User registration** with email/password
- **Secure login** functionality
- **Session persistence** with localStorage
- **Dashboard** with API key management
- **User profile** management

### 💳 Stripe Payment Integration
- **Credit card collection** for paid plans
- **Secure payment processing** with Stripe Elements
- **Plan selection** (Free vs Starter)
- **Payment method validation**
- **Subscription management**

### 📊 User Dashboard
- **API usage tracking** and analytics
- **Real-time statistics** display
- **API key generation** and management
- **Quick start** code examples
- **Usage monitoring** and limits

### 🚀 Pricing Structure
- **Free Tier:** $0/month, 120K calls/day, 20 calls/min
- **Starter Tier:** $9.99/month + $0.001/call, 60 calls/min
- **Transparent pricing** with clear feature comparison
- **Scalable billing** model

## 🛠️ Technology Stack

- **Frontend:** Pure HTML5, CSS3, JavaScript (ES6+)
- **Styling:** Custom CSS with gradients, animations, and responsive design
- **Payment:** Stripe Elements for secure card processing
- **Icons:** Font Awesome 6.0
- **Storage:** localStorage for session management
- **Images:** Google Cloud Storage integration

## 🎯 Multi-EVM Gateway Features

### 🌐 Network Support
- **Ethereum** mainnet access
- **Base** network integration
- **Arbitrum** One support
- **Unified API** endpoint for all networks

### ⚡ Performance
- **Sub-100ms** response times
- **HTTP/2** and WebSocket support
- **99.9% uptime** guarantee
- **Enterprise-grade** infrastructure
- **600 calls/minute** sustained capacity

### 🔒 Security Features
- **API key authentication**
- **Rate limiting** protection
- **DDoS protection**
- **Secure HTTPS** endpoints
- **Request validation**

## 🚀 Quick Start

### For Users
1. Visit the website
2. Click "Get Started" to create an account
3. Choose your plan (Free or Starter)
4. Get your API key from the dashboard
5. Start making API calls

### Example API Call
```bash
curl -X POST https://aetherweb3.com/api/rpc \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "network": "ethereum",
    "method": "eth_getBalance",
    "params": ["0x...", "latest"]
  }'
```

## 🎨 Design Elements

### Color Scheme
- **Primary:** #ff0000 (Red)
- **Background:** Linear gradients from #000000 to #1a1a1a
- **Text:** #ffffff (White)
- **Secondary:** #cccccc (Light Gray)
- **Cards:** #1a1a1a to #222222 gradients

### Typography
- **Font Family:** 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Headings:** Bold weights with gradient text effects
- **Body:** Clean, readable font sizes with proper line spacing

### Components
- **Navigation:** Fixed header with blur effect
- **Hero Section:** Large typography with statistics
- **Feature Cards:** Hover effects with red accent borders
- **Pricing Cards:** Featured plan highlighting
- **Forms:** Modern input styling with focus states

## 🌍 Deployment

This website is designed for easy deployment:

1. **GitHub Pages** (Recommended)
   - Free HTTPS hosting
   - Automatic deployments
   - Custom domain support

2. **Netlify/Vercel**
   - Advanced features
   - Form handling
   - Continuous deployment

3. **Traditional Web Hosting**
   - Upload files to any web server
   - No server-side requirements

## 🔧 Configuration

### Required Updates
1. **Stripe Public Key:** Replace `pk_test_your_stripe_public_key_here` with your actual Stripe key
2. **API Endpoint:** Update API URLs to point to your backend
3. **Authentication:** Connect forms to your authentication system
4. **Analytics:** Add Google Analytics or other tracking

### Optional Customizations
- Update corporate images in cloud storage
- Modify color scheme variables
- Add additional features or sections
- Integrate with backend APIs

## 📱 Mobile Responsiveness

- **Responsive grid** layouts
- **Mobile-optimized** navigation
- **Touch-friendly** buttons and forms
- **Optimized images** and animations
- **Viewport meta tag** for proper scaling

## 🎉 Demo Features

The website includes demo functionality:
- **Mock authentication** (accepts any email/password)
- **Simulated payments** (Stripe test mode)
- **Sample API keys** generation
- **Random usage statistics**
- **Interactive dashboard**

## 📝 License

This project is created for AetherWeb3 and contains proprietary design elements and corporate branding.

## 🚀 Live Demo

Visit: [https://nibertinvestments.github.io/aetherweb3-website/](https://nibertinvestments.github.io/aetherweb3-website/)

---

**Built with ❤️ for the Web3 developer community**