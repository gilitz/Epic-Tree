# Forge Epic Tree

This project contains a Forge app written in Javascript that displays an intelligent Epic Tree visualization in a Jira issue panel.

## 🚀 Features

### 🌳 Epic Tree Visualization

- Interactive tree view of epics with all child issues and subtasks
- Real-time filtering by assignee, status, priority, labels, and blocking status
- Horizontal and vertical layout options
- Dark/light theme support
- Full-screen mode

### 📊 Epic Management Tools

- **Epic Breakdown Interface**: Analyze epic descriptions and plan story breakdown
- **Estimation Tools**: Support for Fibonacci sequence story point estimation
- **Work Distribution Planning**: Categorize work across frontend, backend, testing, and design
- **Risk Planning**: Interface for identifying potential blockers and scope issues
- **Recommendations**: Framework for strategic epic execution planning
- **Story Creation**: Interface for creating multiple stories from planning sessions

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

### 2. Build and Deploy

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
5. **Toggle the breakdown button (📊)** to access Epic Breakdown tools
6. **Plan your breakdown** using the breakdown interface
7. **Review and plan stories** you want to create
8. **Use the planning tools** to organize your epic structure

## 🎨 Features in Detail

### Tree Visualization

- **Interactive nodes** with hover tooltips showing full issue details
- **Drag and drop** to change parent-child relationships
- **Real-time updates** when issues change in Jira
- **Responsive design** that adapts to panel size

### Epic Breakdown Tools

- **Comprehensive planning** interface for epic scope and complexity
- **Story planning** with titles, descriptions, and acceptance criteria
- **Estimation tools** using proven Fibonacci sequence
- **Work categorization** across frontend, backend, testing, and design
- **Risk planning** with potential blocker identification
- **Strategic planning** for successful delivery

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

## 📊 Epic Breakdown Configuration

The epic breakdown tools provide a comprehensive planning interface:

1. **Access the tools**:
   - Open any epic in Jira
   - Click the 📊 button in the Epic Tree panel
   - Use the breakdown planning interface

## 📊 What Makes This Extension Amazing

### For Product Managers

- **Epic breakdown planning** with story planning tools
- **Effort estimation** with detailed reasoning support
- **Risk identification** before development starts
- **Visual progress tracking** with the tree view

### For Development Teams

- **Clear acceptance criteria** planning for each story
- **Technical work distribution** planning
- **Dependency visualization** in the tree structure
- **Real-time status updates**

### For Stakeholders

- **Executive overview** with total story points and work breakdown
- **Progress visualization** with the interactive tree
- **Risk awareness** with planning tools for potential issues

## 🎯 Key Features That Attract Users

1. **Comprehensive Planning Tools**: Extensive epic breakdown and planning interface
2. **Story Planning Interface**: Transform planning sessions into actual Jira stories
3. **Visual Tree Representation**: See the entire epic structure at a glance
4. **Smart Estimation Tools**: Fibonacci-based estimation with reasoning support
5. **Risk Planning**: Identify blockers before they become problems

## Support

See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.

---

**🚀 Ready to enhance your epic planning? Install Epic Tree and experience comprehensive agile project management!**
