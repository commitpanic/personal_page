# Terminal-Style Personal Page

## Overview
A unique personal portfolio website designed to look and function like a command-line terminal interface. Users interact with the page by typing commands to navigate and discover information about you.

## Core Features

### 1. Terminal Interface
- **Visual Design**: Dark terminal aesthetic with monospace fonts
- **Command Input**: Interactive command line with blinking cursor
- **Command History**: Navigate through previous commands using arrow keys (↑/↓)
- **Auto-completion**: Tab key to suggest and complete commands
- **Clear Screen**: Command to clear the terminal output

### 2. Supported Commands

#### Navigation Commands
- `home` - Display welcome message and available commands
- `about` - Show information about you (bio, skills, experience)
- `contact` - Display contact information (email, social media, LinkedIn, GitHub)
- `help` - List all available commands with descriptions
- `clear` - Clear the terminal screen
- `version` - Show application version and tech stack

#### User Account Commands
- `login` - Authenticate existing users
- `create account` - Register new users
- `logout` - Sign out from current session
- `profile` - View user profile (when logged in)

#### Navigation
- `back` - Return to previous view/command output
- `exit` - Close current view (if applicable)

### 3. Content Management
- All command outputs stored in separate data files (JSON/Markdown)
- Easy to update content without touching core code
- Structured data format for maintainability

### 4. Header/Layout
- Minimal header with "Personal Page" logo
- Terminal window frame for authentic look
- Window controls (minimize, maximize, close) for decoration
- Optional: Display current path/directory simulation

### 5. User Authentication System
- User registration with email validation
- Secure login with session management
- Protected commands/content for authenticated users
- User profile management

---

## Additional Proposed Features

### 6. Enhanced Terminal Experience
- **Command Aliases**: Support shortcuts (e.g., `ls` for list, `?` for help)
- **Command Flags**: Add parameters to commands (e.g., `about --skills`, `contact --github`)
- **Error Messages**: Custom error messages for invalid commands
- **ASCII Art**: Display ASCII art logo/banner on startup
- **Color Coding**: Different colors for different command types (success=green, error=red, info=blue)
- **Sound Effects**: Optional typing sounds and command execution sounds

### 7. Content Commands
- `projects` - Display portfolio projects with descriptions and links
- `skills` - List technical skills with proficiency levels
- `experience` - Show work history in timeline format
- `education` - Display educational background
- `blog` - List blog posts or articles
- `achievements` - Show awards, certifications, or notable accomplishments
- `resume` - Download resume or display formatted CV

### 8. Interactive Features
- **Easter Eggs**: Hidden commands with fun surprises (e.g., `matrix`, `konami`)
- **Games**: Mini terminal games (e.g., `snake`, `guess`, `quiz`)
- **Themes**: Command to switch terminal color themes (`theme dark/green/blue/retro`)
- **File System Simulation**: Commands like `ls`, `cd`, `cat`, `pwd` to navigate virtual directories
- **Pipeline Commands**: Support for piping commands (e.g., `projects | grep react`)

### 9. Social Integration
- **Guest Book**: `guestbook` command to view/leave messages
- **Visitor Counter**: Track and display visitor statistics
- **Share Command**: `share` to generate shareable link with specific command pre-loaded
- **Social Links**: Quick commands like `github`, `linkedin`, `twitter` to open social profiles

### 10. Developer Features
- **API Integration**: Commands to fetch live data (GitHub stats, blog RSS)
- **Search**: `search <query>` to find content across all sections
- **Export**: `export` command to save terminal session
- **Print**: `print` to get printer-friendly version
- **Analytics**: Track most used commands (privacy-respecting)

### 11. Accessibility & UX
- **Mobile Support**: Touch-friendly command suggestions
- **Keyboard Shortcuts**: Ctrl+L to clear, Ctrl+C to cancel
- **Screen Reader Support**: ARIA labels for terminal elements
- **Tutorial Mode**: Interactive guide for first-time visitors (`tutorial` command)
- **Multi-language**: Support for different languages (`lang en/es/fr`)

### 12. Advanced Features
- **Command History Persistence**: Save history across sessions
- **Bookmarks**: Save favorite commands for quick access
- **Notifications**: System notifications for important updates
- **Dark/Light Mode**: Toggle between themes (though terminal is typically dark)
- **Custom Prompt**: Personalized command prompt with username
- **Sudo Mode**: Secret admin commands for special content

---

## Technical Stack
- **Frontend**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Font**: Geist Mono (monospace)
- **Authentication**: NextAuth.js or Clerk (recommended)
- **Database**: Supabase, MongoDB, or Firebase (for user data)
- **Deployment**: Vercel

---

## File Structure

```
personal_page/
├── app/
│   ├── layout.tsx          # Root layout with header
│   ├── page.tsx            # Main terminal page
│   ├── globals.css         # Global styles
│   └── api/                # API routes for auth & data
│       ├── auth/
│       └── commands/
├── components/
│   ├── Terminal.tsx        # Main terminal component
│   ├── CommandLine.tsx     # Input line component
│   ├── Output.tsx          # Command output display
│   ├── Header.tsx          # Page header with logo
│   └── CommandHistory.tsx  # History display
├── helpers/
│   ├── type_writer.ts      # Typewriter effect
│   ├── commandParser.ts    # Parse and execute commands
│   └── commandValidator.ts # Validate commands
├── data/
│   ├── commands.json       # Command definitions
│   ├── about.json          # About me content
│   ├── contact.json        # Contact information
│   ├── projects.json       # Projects data
│   ├── skills.json         # Skills data
│   └── help.json           # Help text
├── lib/
│   ├── auth.ts             # Authentication logic
│   └── db.ts               # Database connection
└── types/
    ├── command.ts          # Command type definitions
    └── user.ts             # User type definitions
```

---

## User Flow

1. **Landing**: User sees ASCII banner and welcome message
2. **Prompt**: Terminal prompt appears: `visitor@personal-page:~$`
3. **Type**: User types `help` to see available commands
4. **Explore**: User navigates through content using commands
5. **Interact**: User can create account, login, leave messages
6. **Return**: User can bookmark or save session for next visit

---

## Version History
- **v0.1.0** - Initial setup with basic structure
- **v0.2.0** - (Planned) Core terminal functionality
- **v0.3.0** - (Planned) Command system implementation
- **v0.4.0** - (Planned) User authentication
- **v1.0.0** - (Planned) Full feature release
