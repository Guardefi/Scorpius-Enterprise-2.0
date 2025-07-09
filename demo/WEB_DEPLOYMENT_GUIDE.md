# SCORPIUS Enterprise 2.0 - Demo Deployment Guide

## Quick Start

Your demo is now integrated into your application and can be accessed in two ways:

### 1. Integrated Demo (Recommended)

**Access URL:** `http://your-domain.com/demo` or via the dock navigation

The demo is now integrated into your application with a "Live Demo" tab in the dock navigation. This provides:

- Seamless integration with your existing styling
- Uses your application's component library
- Consistent user experience
- Professional presentation

### 2. Standalone Demo

**File:** `demo-package/scorpius-demo.html`

A self-contained HTML file that can be deployed anywhere without dependencies.

## Deployment Options

### Option 1: Use Integrated Demo (In Your App)

✅ **Already Done!** The demo is integrated into your application.

**Access Methods:**

1. Navigate to `/demo` route in your browser
2. Click the "Live Demo" tab in the dock navigation (Play icon)

**Benefits:**

- Professional integration
- Consistent branding
- No additional deployment needed
- Access control (if authentication is enabled)

### Option 2: Deploy Standalone Demo

#### A. Local Testing

```bash
cd demo-package
python3 -m http.server 8080
# Visit: http://localhost:8080/scorpius-demo.html
```

#### B. Netlify (Instant Deployment)

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop `scorpius-demo.html`
3. Get instant live URL
4. **Pro tip:** Rename to `index.html` for cleaner URLs

#### C. Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Create new project directory with `scorpius-demo.html`
3. Run: `vercel --prod`
4. Follow prompts for instant deployment

#### D. GitHub Pages

1. Create new repository: `scorpius-demo`
2. Upload `scorpius-demo.html`
3. Rename to `index.html` (optional)
4. Enable GitHub Pages in Settings
5. Access: `https://yourusername.github.io/scorpius-demo`

#### E. AWS S3 Static Website

```bash
# Create S3 bucket
aws s3 mb s3://scorpius-demo-bucket

# Upload file
aws s3 cp scorpius-demo.html s3://scorpius-demo-bucket/index.html

# Enable static website hosting
aws s3 website s3://scorpius-demo-bucket --index-document index.html

# Set public read policy
aws s3api put-bucket-policy --bucket scorpius-demo-bucket --policy file://bucket-policy.json
```

## Customization

### Update Company Information

Edit the footer section:

```html
<div class="footer">
  <p>© 2025 Your Company - Scorpius Enterprise 2.0</p>
  <p>📞 Contact: your-email@company.com | 🌐 Demo: your-demo-url.com</p>
</div>
```

### Modify Metrics

Update initial values in the JavaScript section:

```javascript
let threatCount = 12847; // Threats detected
let assetsProtected = 2847000000; // Assets protected ($2.847B)

const metrics = {
  accuracy: 99.97, // Detection accuracy
  responseTime: 47, // Response time (ms)
  uptime: 99.99, // System uptime
};
```

### Add Custom Threats

Extend the threat types array:

```javascript
const threatTypes = [
  {
    type: "CUSTOM_THREAT_TYPE",
    severity: "HIGH",
    description: "Your custom threat description",
  },
  // ... existing threats
];
```

### Styling Adjustments

Key CSS variables for quick customization:

```css
/* Primary accent color */
#00ffff

/* Card backgrounds */
background: radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.05) 0%, transparent 70%);

/* Border colors */
border: 1px solid rgba(0, 255, 255, 0.2);
```

## Marketing Usage

### Sales Presentations

- **Integrated Demo:** Perfect for screen sharing during sales calls
- **Standalone Demo:** Can be embedded in presentation software
- **URL Sharing:** Send direct links to prospects

### Trade Shows

- **Kiosk Mode:** Run standalone demo on dedicated displays
- **Mobile Demo:** Responsive design works on tablets
- **Business Cards:** Include demo URL for follow-up

### Marketing Materials

- **Screenshots:** Use for marketing collateral
- **Videos:** Record demo for promotional content
- **Social Media:** Share demo GIFs and videos

## Technical Specifications

### React Component

- **Framework:** React 18 with TypeScript
- **Styling:** TailwindCSS with custom cyberpunk theme
- **Components:** Uses your existing UI component library
- **State:** React hooks for demo state management
- **Animations:** CSS animations and transitions

### Standalone HTML

- **Dependencies:** None (fully self-contained)
- **Size:** ~50KB (includes all CSS and JavaScript)
- **Compatibility:** All modern browsers (Chrome, Firefox, Safari, Edge)
- **Performance:** Lightweight, fast loading
- **Mobile:** Fully responsive design

## Monitoring and Analytics

### Adding Analytics

Insert tracking code before `</head>`:

```html
<!-- Google Analytics -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "GA_MEASUREMENT_ID");
</script>
```

### Event Tracking

Track demo interactions:

```javascript
// Add to button click handlers
function startDemo() {
  // Existing code...

  // Track demo start
  if (typeof gtag !== "undefined") {
    gtag("event", "demo_started", {
      event_category: "engagement",
      event_label: "scorpius_demo",
    });
  }
}
```

## Security Considerations

### Content Security Policy

For production deployment, add CSP header:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com;
```

### Rate Limiting

If using server deployment, consider rate limiting:

```nginx
# Nginx rate limiting
limit_req_zone $binary_remote_addr zone=demo:10m rate=10r/m;
server {
    location /demo {
        limit_req zone=demo burst=5 nodelay;
    }
}
```

## Troubleshooting

### Common Issues

1. **Demo not loading:** Check browser console for errors
2. **Styling issues:** Ensure fonts are loading from Google Fonts
3. **Animation problems:** Verify CSS animations are supported
4. **Mobile issues:** Test responsive breakpoints

### Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ Internet Explorer (not supported)

## Support

For technical support or customization requests:

- **Email:** development-team@yourcompany.com
- **Docs:** Link to your internal documentation
- **Slack:** #scorpius-support channel

## License

**Proprietary** - SCORPIUS Enterprise Security Platform

This demo is for marketing and sales purposes only. All rights reserved.
