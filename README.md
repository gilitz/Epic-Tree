# Forge Epic Tree

This project contains a Forge app written in Javascript that displays an intelligent Epic Tree visualization in a Jira issue panel with **AI-Powered Epic Intelligence & Automation**.

## 🚀 Features

### 🌳 Epic Tree Visualization

- Interactive tree view of epics with all child issues and subtasks
- Real-time filtering by assignee, status, priority, labels, and blocking status
- Horizontal and vertical layout options
- Dark/light theme support
- Full-screen mode

### 🤖 AI-Powered Epic Intelligence (NEW!)

- **Smart Epic Breakdown**: AI analyzes epic descriptions and automatically suggests optimal story breakdown with estimated story points
- **Intelligent Estimation**: Uses Fibonacci sequence for story points with detailed reasoning
- **Work Distribution Analysis**: Visual breakdown of frontend, backend, testing, and design work
- **Risk Detection**: AI identifies potential blockers and scope issues
- **Actionable Recommendations**: Get strategic recommendations for epic execution
- **One-click Story Creation**: Select and create multiple stories directly from AI suggestions

See [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge) for documentation and tutorials explaining Forge.

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install
cd static/frontend
npm install
cd ../..
```

### 2. Configure AI Features (Optional)

To enable AI-powered epic breakdown:

1. Get an OpenAI API key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Set the environment variable:

```bash
forge variables set OPENAI_API_KEY your_api_key_here
```

**Note**: AI features are optional. The extension works perfectly without AI - you'll just see the tree visualization and filtering capabilities.

### 3. Build and Deploy

```bash
# Build the frontend
cd static/frontend
npm run build
cd ../..

# Deploy the app
forge deploy

# Install on your Jira site
forge install
```

## 🎯 Usage

1. **Navigate to any Epic** in your Jira instance
2. **Open the Epic Tree panel** on the right side
3. **View the tree visualization** of all child issues and subtasks
4. **Use filters** to focus on specific assignees, statuses, priorities, or labels
5. **Toggle the AI button (🤖)** to access Smart Epic Breakdown
6. **Generate AI suggestions** by clicking "✨ Generate Smart Breakdown"
7. **Review and select stories** you want to create
8. **Click "Create X Stories"** to implement the AI suggestions

## 🎨 Features in Detail

### Tree Visualization

- **Interactive nodes** with hover tooltips showing full issue details
- **Drag and drop** to change parent-child relationships
- **Real-time updates** when issues change in Jira
- **Responsive design** that adapts to panel size

### AI Epic Breakdown

- **Comprehensive analysis** of epic scope and complexity
- **Story suggestions** with titles, descriptions, and acceptance criteria
- **Smart estimation** using proven Fibonacci sequence
- **Work categorization** across frontend, backend, testing, and design
- **Risk assessment** with potential blockers identified
- **Strategic recommendations** for successful delivery

### Filtering & Views

- **Multi-select filters** for granular control
- **Blocking/blocked status** visualization
- **Priority and status** color coding
- **Label-based filtering** for team organization

## 🔧 Development

### Local Development

```bash
# Start frontend development server
cd static/frontend
npm start

# In another terminal, tunnel to your Forge app
forge tunnel
```

### Linting

```bash
# Lint all code
npm run lint:all

# Fix linting issues
npm run lint:fix:all
```

## 🚀 Deployment

### Notes

- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.

## 🤖 AI Configuration

The AI features use OpenAI's GPT-4 model for intelligent epic analysis. To configure:

1. **Set your API key**:

   ```bash
   forge variables set OPENAI_API_KEY sk-your-key-here
   ```

2. **Verify configuration**:

   ```bash
   forge variables list
   ```

3. **Test AI features**:
   - Open any epic in Jira
   - Click the 🤖 button in the Epic Tree panel
   - Click "✨ Generate Smart Breakdown"

## 📊 What Makes This Extension Amazing

### For Product Managers

- **Instant epic breakdown** with AI-powered story suggestions
- **Effort estimation** with detailed reasoning
- **Risk identification** before development starts
- **Visual progress tracking** with the tree view

### For Development Teams

- **Clear acceptance criteria** generated for each story
- **Technical work distribution** analysis
- **Dependency visualization** in the tree structure
- **Real-time status updates**

### For Stakeholders

- **Executive overview** with total story points and work breakdown
- **Progress visualization** with the interactive tree
- **Risk awareness** with AI-identified potential issues

## 🎯 Killer Features That Attract Users

1. **AI-Powered Intelligence**: No other Jira extension offers comprehensive AI epic analysis
2. **One-Click Story Creation**: Transform AI suggestions into actual Jira stories instantly
3. **Visual Tree Representation**: See the entire epic structure at a glance
4. **Smart Estimation**: AI provides Fibonacci-based estimates with reasoning
5. **Risk Detection**: Identify blockers before they become problems

## Support

See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.

---

**🚀 Ready to revolutionize your epic planning? Install Epic Tree and experience the future of agile project management!**
