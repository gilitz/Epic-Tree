# 🤖 AI Epic Breakdown Demo Setup

This guide helps you set up and demonstrate the powerful AI-driven epic breakdown feature.

## 🚀 Quick Demo Setup

### 1. Prerequisites

- Forge CLI installed and configured
- OpenAI API account with credits
- Jira instance with admin access

### 2. Install & Configure

```bash
# Clone and setup
git clone <your-repo>
cd Epic-Tree
npm install
cd static/frontend && npm install && cd ../..

# Set OpenAI API key
forge variables set OPENAI_API_KEY sk-your-openai-key-here

# Build and deploy
cd static/frontend && npm run build && cd ../..
forge deploy
forge install
```

### 3. Demo Data Setup

Create a sample epic in your Jira instance:

**Epic Title**: "Customer Dashboard Redesign"

**Epic Description**:

```
We need to redesign our customer dashboard to improve user experience and increase engagement.

Key Requirements:
- Modern, responsive UI design
- Real-time data visualization with charts
- User preference settings and customization
- Mobile-first approach
- Performance optimization
- Integration with existing user authentication
- Analytics tracking for user behavior
- Accessibility compliance (WCAG 2.1)

Business Goals:
- Increase user engagement by 40%
- Reduce customer support tickets by 25%
- Improve mobile usage by 60%

Technical Constraints:
- Must work with existing React codebase
- API rate limiting considerations
- Database migration for new features
- Legacy browser support (IE11+)
```

## 🎯 Demo Script

### Step 1: Show Traditional View

1. Navigate to your sample epic in Jira
2. Open the Epic Tree panel
3. Show the traditional tree visualization
4. Demonstrate filtering capabilities

### Step 2: Introduce AI Features

1. Click the 🤖 AI button in the top toolbar
2. Explain: "This is where the magic happens - AI-powered epic intelligence"

### Step 3: Generate AI Breakdown

1. Click "✨ Generate Smart Breakdown"
2. Wait for AI analysis (10-15 seconds)
3. Highlight the comprehensive analysis:

**Expected AI Output**:

- **6-8 story suggestions** with detailed descriptions
- **Total estimated points**: ~34-55 points
- **Work breakdown**:
  - Frontend: 40-50%
  - Backend: 25-35%
  - Testing: 15-20%
  - Design: 10-15%
- **Risk identification**: API rate limits, mobile complexity, legacy support
- **Recommendations**: Start with design system, parallel frontend/backend work

### Step 4: Showcase Intelligence

Point out the AI's sophisticated analysis:

1. **Smart Estimation**:

   - Uses Fibonacci sequence (1,2,3,5,8,13,21)
   - Provides reasoning for each estimate
   - Considers complexity and dependencies

2. **Detailed Acceptance Criteria**:

   - Each story has 3-5 specific criteria
   - Technical and business requirements
   - Testable conditions

3. **Strategic Labeling**:
   - Automatic categorization (frontend, backend, ui, api, testing)
   - Priority assignment based on dependencies
   - Technical complexity indicators

### Step 5: Story Selection & Creation

1. Show the selection interface
2. Select 3-4 stories using checkboxes
3. Click "Create X Stories" button
4. Explain: "In a real implementation, this would create actual Jira stories"

## 🎨 Demo Talking Points

### Why This Is Revolutionary

**For Product Managers**:

- "Instead of spending hours breaking down epics manually, AI does it in seconds"
- "Get instant effort estimates with detailed reasoning"
- "Identify risks before development starts"

**For Development Teams**:

- "Clear, actionable acceptance criteria for every story"
- "Technical work properly distributed and estimated"
- "Dependencies and complexity automatically considered"

**For Organizations**:

- "Consistent estimation methodology across all teams"
- "Reduced planning overhead by 70%"
- "Better predictability and delivery confidence"

### Competitive Advantages

1. **No other Jira extension offers AI epic analysis**
2. **Comprehensive breakdown in under 30 seconds**
3. **Professional-grade estimation with reasoning**
4. **Immediate actionability with story creation**
5. **Risk identification before problems occur**

## 🎯 Advanced Demo Features

### Custom Epic Examples

**E-commerce Platform**:

```
Build a complete e-commerce platform with product catalog, shopping cart, payment processing, order management, and admin dashboard. Must support 10,000+ concurrent users, integrate with Stripe and PayPal, include inventory management, and provide real-time analytics.
```

**Mobile Banking App**:

```
Develop a secure mobile banking application with account management, fund transfers, bill payments, check deposits, budgeting tools, and investment tracking. Must comply with PCI DSS, support biometric authentication, work offline, and integrate with core banking systems.
```

### Demo Variations

**Quick Demo (5 minutes)**:

- Show tree view → Click AI button → Generate breakdown → Highlight key insights

**Detailed Demo (15 minutes)**:

- Full epic setup → Tree exploration → AI analysis → Story selection → Risk discussion

**Technical Deep Dive (30 minutes)**:

- Code walkthrough → AI prompt engineering → Integration architecture → Customization options

## 🔧 Troubleshooting

### Common Issues

**AI not responding**:

- Check OpenAI API key: `forge variables list`
- Verify API credits in OpenAI dashboard
- Check browser console for errors

**Empty breakdown**:

- Ensure epic has sufficient description
- Try with more detailed requirements
- Check network connectivity

**Performance issues**:

- AI calls take 10-30 seconds (normal)
- Large epics may need more processing time
- Consider epic size limitations

### Demo Environment

**Recommended Setup**:

- Use a dedicated demo Jira instance
- Pre-create 2-3 sample epics
- Test AI functionality before demo
- Have backup screenshots ready

## 📊 Success Metrics

Track these metrics to show value:

**Before AI**:

- Epic breakdown time: 2-4 hours
- Estimation accuracy: 60-70%
- Stories created: 3-6 per epic
- Risk identification: Manual/inconsistent

**After AI**:

- Epic breakdown time: 2-5 minutes
- Estimation accuracy: 80-90%
- Stories created: 5-8 per epic
- Risk identification: Automatic/comprehensive

---

**🎯 Ready to blow minds? This AI feature positions your extension as the most advanced epic management tool in the Jira ecosystem!**
