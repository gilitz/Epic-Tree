# Epic Tree - Jira Extension

A powerful Atlassian Forge app that provides an intelligent, interactive Epic Tree visualization directly in your Jira issue panels. Transform how you visualize, manage, and plan your epics with advanced tree structures, real-time filtering, and AI-powered breakdown tools.

![Epic Tree Demo](https://img.shields.io/badge/Jira-Extension-0052CC?style=flat&logo=jira&logoColor=white)
![Forge](https://img.shields.io/badge/Atlassian-Forge-0052CC?style=flat&logo=atlassian&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)

## 🌟 Overview

Epic Tree transforms your Jira epics into beautiful, interactive tree visualizations that make it easy to understand complex project structures at a glance. Whether you're managing large-scale projects or planning sprint work, Epic Tree provides the visual clarity and powerful tools you need.

## ✨ Key Features

### 🌳 Interactive Tree Visualization

- **Multi-level hierarchy**: Visualize epics → stories → subtasks in a clear tree structure
- **Responsive design**: Adapts seamlessly to any screen size without breakpoints
- **Dual orientations**: Switch between horizontal and vertical layouts
- **Real-time updates**: Automatically reflects changes made in Jira
- **Smart node sizing**: Epic nodes are visually distinct from regular issues

### 🎯 Advanced Filtering & Search

- **Multi-dimensional filtering**: Filter by assignee, status, priority, labels, and blocking status
- **Real-time filter application**: See results instantly as you adjust filters
- **Context-aware filtering**: Parent nodes remain visible to maintain hierarchy context
- **Filter persistence**: Filters stay active as you navigate between epics

### 🎨 Rich Visual Experience

- **Dark/Light theme support**: Automatic theme switching with smooth transitions
- **Status-based color coding**: Instantly identify issue states (To Do, In Progress, Done)
- **Priority indicators**: Visual priority icons on high-importance issues
- **Blocking indicators**: Clear visual markers for blocked issues
- **Hover tooltips**: Comprehensive issue details on hover
- **Minimap navigation**: Bird's-eye view for large tree structures

### 🔧 Interactive Issue Management

- **Inline editing**: Edit issue fields directly from the tree view
- **Drag & drop**: Change parent-child relationships by dragging nodes
- **Story point management**: Visual story point indicators and editing
- **Assignee management**: Quick assignee changes with avatar displays
- **Label management**: Add/remove labels with visual tag interface

### 🤖 AI-Powered Epic Breakdown

- **Intelligent analysis**: AI analyzes epic descriptions and existing work
- **Story suggestions**: Get AI-generated story breakdown recommendations
- **Work distribution planning**: Categorize work across frontend, backend, testing, and design
- **Risk identification**: Identify potential blockers and scope issues
- **Estimation assistance**: Fibonacci sequence story point recommendations
- **Batch story creation**: Create multiple stories from AI suggestions

### 📊 Comprehensive Analytics

- **Progress tracking**: Visual progress indicators for epic completion
- **Work distribution**: See how work is distributed across team members
- **Status breakdown**: Understand current state across all issues
- **Blocking analysis**: Identify and track blocked work items
- **Timeline visualization**: Track creation and update dates

### 🚀 Performance & Usability

- **Full-screen mode**: Maximize your workspace for complex epics
- **Zoom controls**: Zoom in/out for detailed or overview perspectives
- **Smooth animations**: Polished interactions with smooth transitions
- **Loading states**: Clear feedback during data fetching
- **Error handling**: Graceful handling of network issues and errors
- **Responsive scrolling**: Smooth navigation through large tree structures

## 🛠 Technical Architecture

### Frontend Stack

- **React 18** with TypeScript for type-safe component development
- **Styled Components** for dynamic theming and responsive design
- **D3/Visx** for powerful tree visualization and data manipulation
- **Custom hooks** for data fetching and state management
- **Context providers** for global state (themes, filters, optimistic updates)

### Backend Integration

- **Atlassian Forge** platform for secure Jira integration
- **Jira REST API v3** for comprehensive issue data access
- **Custom resolvers** for optimized data fetching
- **Configurable field mappings** for different Jira instances
- **Error handling** with fallback data and retry mechanisms

## 📋 Requirements

- **Jira Cloud** instance with admin access
- **Node.js 18+** for development
- **Atlassian Forge CLI** for deployment
- **Custom field access** for story points and epic links

## ⚙️ Configuration

### Jira Custom Fields

Epic Tree supports configurable field mappings to work with different Jira instances:

| Environment Variable                | Default Value       | Description                                |
| ----------------------------------- | ------------------- | ------------------------------------------ |
| `JIRA_STORY_POINTS_FIELD`           | `customfield_10016` | Story Points custom field ID               |
| `JIRA_EPIC_LINK_FIELD`              | `customfield_10014` | Epic Link custom field ID                  |
| `JIRA_SPRINT_FIELD`                 | `customfield_10020` | Sprint custom field ID                     |
| `JIRA_MAX_RESULTS_EPIC_ISSUES`      | `100`               | Max results for epic issues API calls      |
| `JIRA_MAX_RESULTS_SUBTASKS`         | `200`               | Max results for subtasks API calls         |
| `JIRA_MAX_RESULTS_ASSIGNABLE_USERS` | `50`                | Max results for assignable users API calls |

### Finding Your Custom Field IDs

1. **Via Jira Admin Interface:**

   - Go to Settings → Issues → Custom fields
   - Find your field and note its ID (e.g., `customfield_10016`)

2. **Via Jira REST API:**

   ```bash
   curl -u email@example.com:token "https://your-domain.atlassian.net/rest/api/3/field"
   ```

3. **Via Browser Developer Tools:**
   - Open any Jira issue
   - Open Developer Tools → Network tab
   - Look at the JSON response for issue API calls

See `jira-config.example` for a complete configuration template.

## 🚀 Installation & Setup

### 1. Prerequisites

```bash
# Install Forge CLI
npm install -g @forge/cli

# Login to Atlassian
forge login
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd static/frontend
npm install
cd ../..
```

### 3. Configure Custom Fields (Optional)

```bash
# Copy the example configuration
cp jira-config.example .env

# Edit .env with your custom field IDs
nano .env
```

### 4. Build and Deploy

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

### 5. Development Mode (Optional)

```bash
# For development with hot reload
cd static/frontend
npm start
# In another terminal:
forge tunnel
```

## 📖 Usage Guide

### Getting Started

1. **Navigate to any Epic** in your Jira instance
2. **Look for the Epic Tree panel** on the right side of the issue view
3. **The tree will automatically load** showing all child issues and subtasks

### Tree Navigation

- **Hover over nodes** to see detailed issue information
- **Click the orientation toggle** (↕️/↔️) to switch between vertical and horizontal layouts
- **Use the minimap** (bottom-right) to navigate large trees quickly
- **Zoom in/out** using the zoom controls for better visibility

### Filtering Your View

- **Use the filter bar** at the top to filter by:
  - **Assignees**: Filter by specific team members
  - **Status**: Focus on specific workflow states
  - **Priority**: Highlight high-priority work
  - **Labels**: Filter by project labels
  - **Blocking Status**: Show only blocked/unblocked items

### Epic Breakdown Tools

1. **Click the breakdown button** (📊) to access AI-powered tools
2. **Review the epic analysis** including current progress and team distribution
3. **Generate AI suggestions** for breaking down the epic into stories
4. **Review and select** the stories you want to create
5. **Use the planning tools** to organize your epic structure

### Editing Issues

- **Click on any field** in the tooltip to edit it inline
- **Drag nodes** to change parent-child relationships
- **Update story points** directly from the tree view
- **Manage assignees** with the dropdown interface

## 🎨 Customization

### Themes

- **Automatic theme detection** based on Jira's theme
- **Manual theme toggle** using the theme button (☀️/🌙)
- **Smooth transitions** between light and dark modes

### Layout Options

- **Vertical layout**: Traditional top-down tree structure
- **Horizontal layout**: Left-to-right flow for wide screens
- **Responsive sizing**: Automatically adapts to container size

## 🔍 Troubleshooting

### Common Issues

**Epic Tree panel not showing:**

- Ensure you're viewing an Epic issue type
- Check that the app is installed and enabled
- Verify you have the necessary Jira permissions

**Custom fields not working:**

- Verify your custom field IDs in the configuration
- Check that the fields exist and are accessible
- Ensure proper permissions for field access

**Performance issues with large epics:**

- Use filters to reduce the number of visible items
- Consider breaking down very large epics
- Check your network connection for API call delays

**Data not updating:**

- Refresh the page to reload data
- Check if there are any Jira permissions issues
- Verify the Forge app has proper scopes configured

### Getting Help

- Check the browser console for error messages
- Review the Forge app logs for backend issues
- Ensure all dependencies are properly installed
- Verify your Jira instance supports the required API endpoints

## 🤝 Contributing

We welcome contributions! Please see our contribution guidelines for:

- Code style and standards
- Testing requirements
- Pull request process
- Issue reporting

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built on the powerful **Atlassian Forge** platform
- Visualization powered by **D3.js** and **Visx**
- UI components using **React** and **Styled Components**
- Icons and design inspired by **Atlassian Design System**

---

**Epic Tree** - Transform your Jira epics into beautiful, interactive visualizations that make project management a breeze. 🌳✨
