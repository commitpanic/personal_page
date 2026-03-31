import commandsData from '@/data/commands.json';
import aboutData from '@/data/about.json';
import contactData from '@/data/contact.json';
import projectsData from '@/data/projects.json';
import type { Command } from '@/types/command';
import { authAPI, blogAPI, contactAPI, commentsAPI, reactionsAPI, qrzAPI, type Article } from '@/services/api';
import { 
  formatArticleList, 
  formatArticleDetail, 
  formatSearchResults, 
  formatTags, 
  formatComments,
  formatReactions,
  formatArticleCreated
} from './blogFormatter';

const commands: Command[] = commandsData.commands;

export const parseCommand = (input: string): { command: string; args: string[] } => {
  const trimmed = input.trim();
  
  // Parse command (first word, case insensitive)
  const commandMatch = trimmed.match(/^\S+/);
  const command = commandMatch ? commandMatch[0].toLowerCase() : '';
  
  // Parse arguments, respecting quoted strings
  const args: string[] = [];
  const argsString = trimmed.slice(command.length).trim();
  
  // Match quoted strings or individual words/flags
  const regex = /"([^"]*)"|'([^']*)'|(-\w+)|(\S+)/g;
  let match;
  
  while ((match = regex.exec(argsString)) !== null) {
    // match[1] = double quoted, match[2] = single quoted, match[3] = flag, match[4] = word
    const value = match[1] || match[2] || match[3] || match[4];
    args.push(value);
  }
  
  return { command, args };
};

export const executeCommand = (input: string, username: string = 'visitor'): { output: string; type: 'success' | 'error' | 'info'; isAsync?: boolean } => {
  const { command, args } = parseCommand(input);
  
  // Get user role for permission checks
  const user = authAPI.getUser();
  const userRole = user?.role;
  
  switch (command) {
    case 'help':
      return {
        output: formatHelp(userRole),
        type: 'success'
      };
    
    case 'home':
      return {
        output: formatHome(username),
        type: 'success'
      };
    
    case 'about':
      return {
        output: formatAbout(),
        type: 'success'
      };
    
    case 'contact':
      if (args.length === 0) {
        return {
          output: formatContact(),
          type: 'success'
        };
      }
      
      // Handle contact -email
      if (args[0] === '-email') {
        if (args[1] === '-copy') {
          return {
            output: '__COPY__' + contactData.email,
            type: 'success'
          };
        }
        return {
          output: `Email: ${contactData.email}\nTip: Use 'contact -email -copy' to copy to clipboard`,
          type: 'info'
        };
      }
      
      // Handle contact -linkedin
      if (args[0] === '-linkedin') {
        if (args[1] === '-copy') {
          return {
            output: '__COPY__' + contactData.social.linkedin,
            type: 'success'
          };
        } else if (args[1] === '-open') {
          return {
            output: '__OPEN__' + contactData.social.linkedin,
            type: 'success'
          };
        }
        return {
          output: `LinkedIn: ${contactData.social.linkedin}\nTip: Use 'contact -linkedin -copy' to copy or 'contact -linkedin -open' to open`,
          type: 'info'
        };
      }
      
      // Handle contact -github
      if (args[0] === '-github') {
        if (args[1] === '-copy') {
          return {
            output: '__COPY__' + contactData.social.github,
            type: 'success'
          };
        } else if (args[1] === '-open') {
          return {
            output: '__OPEN__' + contactData.social.github,
            type: 'success'
          };
        }
        return {
          output: `GitHub: ${contactData.social.github}\nTip: Use 'contact -github -copy' to copy or 'contact -github -open' to open`,
          type: 'info'
        };
      }
      
      // Handle contact -qrz
      if (args[0] === '-qrz') {
        if (args[1] === '-copy') {
          return {
            output: '__COPY__' + contactData.social.qrz,
            type: 'success'
          };
        } else if (args[1] === '-open') {
          return {
            output: '__OPEN__' + contactData.social.qrz,
            type: 'success'
          };
        }
        return {
          output: `QRZ: ${contactData.social.qrz}\nTip: Use 'contact -qrz -copy' to copy or 'contact -qrz -open' to open`,
          type: 'info'
        };
      }
      
      return {
        output: 'Usage: contact [-email -copy | -linkedin -copy/-open | -github -copy/-open | -qrz -copy/-open]\nExample: contact -qrz -open',
        type: 'error'
      };
    
    case 'projects':
      return {
        output: formatProjects(),
        type: 'success'
      };

    case 'qrz':
      if (args.length === 0 || args[0] === 'status') {
        return handleQrzStatus();
      }
      if (args[0] === 'sync') {
        return handleQrzSync();
      }
      if (args[0] === 'logs') {
        return handleQrzLogs();
      }
      if (args[0] === 'map') {
        return handleQrzMap();
      }
      if (args[0] === 'iframe') {
        return handleQrzIframe();
      }
      return {
        output: 'Usage: qrz [status | sync | logs | map | iframe]\nExample: qrz sync',
        type: 'error'
      };
    
    case 'version':
      return {
        output: formatVersion(),
        type: 'info'
      };
    
    case 'clear':
      return {
        output: '__CLEAR__',
        type: 'success'
      };
    
    case 'snake':
      return {
        output: '__SNAKE__',
        type: 'success'
      };
    
    case 'tetris':
      return {
        output: '__TETRIS__',
        type: 'success'
      };
    
    case '2048':
      return {
        output: '__2048__',
        type: 'success'
      };
    
    case 'minesweeper':
      return {
        output: '__MINESWEEPER__',
        type: 'success'
      };
    
    case 'invaders':
      return {
        output: '__INVADERS__',
        type: 'success'
      };
    
    case 'customize':
      if (args[0] === '-color') {
        const colorArg = args[1];
        if (colorArg === '-default') {
          return {
            output: '__COLOR__green',
            type: 'success'
          };
        } else if (colorArg === '-white') {
          return {
            output: '__COLOR__white',
            type: 'success'
          };
        } else if (colorArg === '-red') {
          return {
            output: '__COLOR__red',
            type: 'success'
          };
        } else if (colorArg === '-yellow') {
          return {
            output: '__COLOR__yellow',
            type: 'success'
          };
        } else {
          return {
            output: 'Usage: customize -color [-default | -white | -red | -yellow]\nExample: customize -color -yellow',
            type: 'error'
          };
        }
      }
      return {
        output: 'Usage: customize -color [-default | -white | -red | -yellow]\nExample: customize -color -red',
        type: 'error'
      };
    
    case 'login':
      if (args.length < 2) {
        return {
          output: 'Usage: login <username> <password>\nExample: login john mypassword123',
          type: 'error'
        };
      }
      return handleLogin(args[0], args.slice(1).join(' '));
    
    case 'register':
      if (args.length < 3) {
        return {
          output: 'Usage: register <username> <email> <password>\nExample: register john john@email.com mypassword123',
          type: 'error'
        };
      }
      // Check if -admin flag is present
      const isAdminReg = args.includes('-admin');
      const regArgs = args.filter(arg => arg !== '-admin');
      return handleRegister(regArgs[0], regArgs[1], regArgs.slice(2).join(' '), isAdminReg);
    
    case 'logout':
      return handleLogout();
    
    case 'whoami':
      return handleWhoami();
    
    case 'forgot-password':
      if (args.length < 1) {
        return {
          output: 'Usage: forgot-password <email>\nExample: forgot-password john@example.com\n\nGenerates password reset token and URL directly in terminal.',
          type: 'error'
        };
      }
      return handleForgotPassword(args[0]);
    
    case 'reset-password':
      if (args.length < 2) {
        return {
          output: 'Usage: reset-password <token> <new-password>\nExample: reset-password abc123token myNewPassword456\n\nUse the token generated by forgot-password command.',
          type: 'error'
        };
      }
      return handleResetPassword(args[0], args[1]);
    
    case 'admin':
      // Admin-only commands
      if (!userRole || userRole !== 'admin') {
        return {
          output: '❌ Access denied. Admin privileges required.',
          type: 'error'
        };
      }
      
      if (args.length === 0) {
        return {
          output: `Admin Commands:
  admin help                      - Show all admin commands
  admin comments pending          - View all pending comments
  admin comment approve <id>      - Approve a comment
  admin comment reject <id>       - Reject a comment
  admin messages                  - View all contact messages
  admin message read <id>         - Mark message as read
  admin message archive <id>      - Archive a message

Examples:
  admin help
  admin comments pending
  admin comment approve 5
  admin messages
  admin message read 1`,
          type: 'info'
        };
      }
      
      // Handle admin help
      if (args[0] === 'help') {
        return handleAdminHelp(userRole);
      }
      
      if (args[0] === 'comments' && args[1] === 'pending') {
        return handleAdminPendingComments();
      }
      
      if (args[0] === 'comment') {
        if (args[1] === 'approve' && args[2]) {
          return handleAdminModerateComment(parseInt(args[2]), 'approved');
        }
        if (args[1] === 'reject' && args[2]) {
          return handleAdminModerateComment(parseInt(args[2]), 'rejected');
        }
        return {
          output: 'Usage: admin comment [approve|reject] <comment-id>\nExample: admin comment approve 5',
          type: 'error'
        };
      }
      
      if (args[0] === 'messages') {
        const status = args[1] || 'unread'; // default to unread
        return handleAdminMessages(status);
      }
      
      if (args[0] === 'message') {
        if (args[1] === 'read' && args[2]) {
          return handleAdminMessageStatus(parseInt(args[2]), 'read');
        }
        if (args[1] === 'archive' && args[2]) {
          return handleAdminMessageStatus(parseInt(args[2]), 'archived');
        }
        return {
          output: 'Usage: admin message [read|archive] <message-id>\nExample: admin message read 1',
          type: 'error'
        };
      }
      
      return {
        output: 'Unknown admin command. Type "admin" to see available commands.',
        type: 'error'
      };
    
    case 'blog':
      if (args.length === 0) {
        return handleBlogList();
      }
      if (args[0] === 'list') {
        // Check for pagination: blog list -page 2
        const pageIndex = args.indexOf('-page');
        if (pageIndex !== -1 && args[pageIndex + 1]) {
          return handleBlogList(parseInt(args[pageIndex + 1]));
        }
        return handleBlogList();
      }
      if (args[0] === 'read' && args[1]) {
        return handleBlogRead(args[1]);
      }
      if (args[0] === 'search' && args[1]) {
        return handleBlogSearch(args.slice(1).join(' '));
      }
      if (args[0] === 'tags') {
        return handleBlogTags();
      }
      if (args[0] === 'filter' && args[1] === '-tag' && args[2]) {
        return handleBlogFilterByTag(args[2]);
      }
      if (args[0] === 'comments' && args[1]) {
        return handleBlogComments(parseInt(args[1]));
      }
      if (args[0] === 'comment' && args[1]) {
        // blog comment <articleId> "name" email "comment text"
        if (args.length < 5) {
          return {
            output: 'Usage: blog comment <articleId> "Your Name" your@email.com "Comment text"\nExample: blog comment 1 "John Doe" john@email.com "Great article!"',
            type: 'error'
          };
        }
        return handleBlogAddComment(parseInt(args[1]), args[2], args[3], args[4]);
      }
      if (args[0] === 'like' && args[1]) {
        return handleBlogLike(parseInt(args[1]));
      }
      if (args[0] === 'reactions' && args[1]) {
        return handleBlogReactions(parseInt(args[1]));
      }
      if (args[0] === 'create') {
        if (!authAPI.isAuthenticated()) {
          return {
            output: '❌ You must be logged in to create articles.\nUse: login <username> <password>',
            type: 'error'
          };
        }
        const user = authAPI.getUser();
        if (user?.role !== 'admin') {
          return {
            output: '❌ Admin access required.\nOnly admin users can create blog articles.\n\n💡 Contact the administrator if you need access.',
            type: 'error'
          };
        }
        return {
          output: 'Usage: blog create "Title" "Excerpt" "Content" [-tags tag1,tag2] [-publish]\nExample: blog create "My First Post" "A short intro" "Full article content here" -tags javascript,web -publish',
          type: 'info'
        };
      }
      if (args[0] === 'new') {
        if (!authAPI.isAuthenticated()) {
          return {
            output: '❌ You must be logged in to create articles.\nUse: login <username> <password>',
            type: 'error'
          };
        }
        const user = authAPI.getUser();
        if (user?.role !== 'admin') {
          return {
            output: '❌ Admin access required.\nOnly admin users can create blog articles.\n\n💡 Contact the administrator if you need access.',
            type: 'error'
          };
        }
        if (args.length < 4) {
          return {
            output: 'Usage: blog new "Title" "Excerpt" "Content" [-tags tag1,tag2] [-publish]\n\n⚠️  Requirements:\n  • Title: 3-200 characters\n  • Content: At least 100 characters\n  • Excerpt: Optional, max 500 characters\n\nExample: blog new "My Post" "Short intro" "This is a detailed blog post with at least 100 characters of content to meet the minimum requirement for article creation." -tags javascript,web -publish',
            type: 'error'
          };
        }
        const title = args[1];
        const excerpt = args[2];
        const content = args[3];
        
        // Validate content length
        if (content.length < 100) {
          return {
            output: `❌ Content is too short (${content.length} characters)\n\n⚠️  Content must be at least 100 characters.\n\n💡 Tip: Add more detail to your article content.`,
            type: 'error'
          };
        }
        
        const tagsIndex = args.indexOf('-tags');
        const tags = tagsIndex !== -1 && args[tagsIndex + 1] ? args[tagsIndex + 1].split(',') : [];
        const publish = args.includes('-publish');
        return handleBlogCreate(title, excerpt, content, tags, publish);
      }
      
      if (args[0] === 'edit') {
        if (!authAPI.isAuthenticated()) {
          return {
            output: '❌ You must be logged in to edit articles.\nUse: login <username> <password>',
            type: 'error'
          };
        }
        const user = authAPI.getUser();
        if (user?.role !== 'admin') {
          return {
            output: '❌ Admin access required.\nOnly admin users can edit blog articles.',
            type: 'error'
          };
        }
        if (args.length < 5) {
          return {
            output: 'Usage: blog edit <id> "Title" "Excerpt" "Content" [-tags tag1,tag2] [-publish]\n\nExample: blog edit 1 "Updated Title" "New excerpt" "Updated content with at least 100 characters for validation requirements." -tags javascript,tutorial -publish',
            type: 'error'
          };
        }
        const articleId = parseInt(args[1]);
        const title = args[2];
        const excerpt = args[3];
        const content = args[4];
        
        // Validate content length
        if (content.length < 100) {
          return {
            output: `❌ Content is too short (${content.length} characters)\n\n⚠️  Content must be at least 100 characters.`,
            type: 'error'
          };
        }
        
        const tagsIndex = args.indexOf('-tags');
        const tags = tagsIndex !== -1 && args[tagsIndex + 1] ? args[tagsIndex + 1].split(',') : [];
        const publish = args.includes('-publish');
        return handleBlogEdit(articleId, title, excerpt, content, tags, publish);
      }
      
      if (args[0] === 'delete') {
        if (!authAPI.isAuthenticated()) {
          return {
            output: '❌ You must be logged in to delete articles.\nUse: login <username> <password>',
            type: 'error'
          };
        }
        const user = authAPI.getUser();
        if (user?.role !== 'admin') {
          return {
            output: '❌ Admin access required.\nOnly admin users can delete blog articles.',
            type: 'error'
          };
        }
        if (args.length < 2) {
          return {
            output: 'Usage: blog delete <id>\nExample: blog delete 3\n\n⚠️  Warning: This action cannot be undone!',
            type: 'error'
          };
        }
        const articleId = parseInt(args[1]);
        return handleBlogDelete(articleId);
      }
      
      // Generate blog help based on user role
      let blogHelp = `Blog Commands:
  blog list [-page N]              - List all articles (with pagination)
  blog read <slug>                 - Read a specific article
  blog search <query>              - Search articles
  blog tags                        - View all tags
  blog filter -tag <tag>           - Filter articles by tag
  blog comments <articleId>        - View article comments
  blog comment <id> "name" email "text" - Add comment
  blog like <articleId>            - Toggle like on article
  blog reactions <articleId>       - View article reactions`;
      
      // Add admin-only commands if user is admin
      if (userRole === 'admin') {
        blogHelp += `
  blog new "title" "excerpt" "content" - Create article (admin only)
  blog edit <id> "title" "excerpt" "content" - Edit article (admin only)
  blog delete <id>                 - Delete article (admin only)`;
      }
      
      blogHelp += `

Examples:
  blog list -page 2
  blog read my-first-post
  blog search javascript
  blog filter -tag web-development
  blog comment 1 "John" john@email.com "Great post!"`;
      
      if (userRole === 'admin') {
        blogHelp += `
  blog new "My Post" "Intro" "Content here..." -tags tech,web -publish
  blog edit 1 "Updated Title" "New intro" "Updated content..." -tags tech
  blog delete 3`;
      }
      
      return {
        output: blogHelp,
        type: 'info'
      };
    
    case 'send':
      if (args.length < 3) {
        return {
          output: 'Usage: send <name> <email> <message>\nExample: send "John Doe" john@email.com "Hello, I would like to connect!"',
          type: 'error'
        };
      }
      return handleContactSubmit(args[0], args[1], args.slice(2).join(' '));
    
    case 'create':
      if (args[0] === 'account') {
        return {
          output: 'Use the "register" command instead.\nUsage: register <username> <email> <password>',
          type: 'info'
        };
      }
      return {
        output: `Command not found: ${input}\nType 'help' to see available commands.`,
        type: 'error'
      };
    
    case '':
      return {
        output: '',
        type: 'info'
      };
    
    default:
      return {
        output: `Command not found: ${command}\nType 'help' to see available commands.`,
        type: 'error'
      };
  }
};

const formatHelp = (userRole?: string): string => {
  let output = '\nAvailable Commands:\n\n';
  
  const categories = ['navigation', 'content', 'game', 'general', 'auth'];
  const categoryNames: Record<string, string> = {
    navigation: 'Navigation',
    content: 'Content',
    game: 'Games',
    general: 'General',
    auth: 'Authentication'
  };
  
  const isAdmin = userRole === 'admin';
  
  categories.forEach(category => {
    // Skip Authentication category - use 'admin help' instead
    if (category === 'auth') return;
    
    const categoryCommands = commands.filter(cmd => {
      if (cmd.category !== category) return false;
      // Filter out ALL admin-only commands from regular help
      const cmdData = cmd as Command & { requiresAuth?: boolean; requiresAdmin?: boolean };
      if (cmdData.requiresAdmin) return false;
      return true;
    });
    
    if (categoryCommands.length > 0) {
      output += `\n${categoryNames[category]}:\n`;
      categoryCommands.forEach(cmd => {
        output += `  ${cmd.name.padEnd(20)} - ${cmd.description}\n`;
      });
    }
  });
  
  // Add admin help hint for admin users
  if (isAdmin) {
    output += '\n\n╔════════════════════════════════════════════════════════════╗\n';
    output += '║  Type "admin help" to see all admin commands               ║\n';
    output += '╚════════════════════════════════════════════════════════════╝\n';
  }
  
  output += '\nTip: Use arrow keys (↑/↓) to navigate command history\n';
  return output;
};

const formatHome = (username: string): string => {
  return `
╔════════════════════════════════════════════════════════╗
║                                                        ║
║             Hello!! Welcome to my page                 ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

Hello, ${username}! 👋

This is an interactive terminal-style portfolio.
Type commands to navigate and learn more about me.

Quick Start:
  • Type 'help' to see all available commands
  • Type 'about' to learn about me
  • Type 'projects' to see my work
  • Type 'contact' to get in touch

Enjoy exploring! 🚀
`;
};

const formatAbout = (): string => {
  return `
About Me
${'='.repeat(60)}

Name:        ${aboutData.name}
Title:       ${aboutData.title}
Location:    ${aboutData.location}
Experience:  ${aboutData.yearsOfExperience}+ years

Bio:
${aboutData.bio}

Current Focus:
${aboutData.currentFocus}

Interests:
${aboutData.interests.map(i => `  • ${i}`).join('\n')}

Fun Fact:
${aboutData.funFact}
`;
};

const formatContact = (): string => {
  return `
Contact Information
${'='.repeat(60)}

Email:       ${contactData.email}

Social Links:
  GitHub:    ${contactData.social.github}
  LinkedIn:  ${contactData.social.linkedin}  
  QRZ:       ${contactData.social.qrz}  

Preferred Contact Method: ${contactData.preferredContact}

Feel free to reach out! I'd love to connect.
`;
};

const formatProjects = (): string => {
  let output = `
My Projects
${'='.repeat(60)}\n\n`;

  projectsData.projects.forEach((project, index) => {
    output += `${index + 1}. ${project.name} [${project.status}]\n`;
    output += `   ${project.description}\n`;
    output += `   Tech: ${project.technologies.join(', ')}\n`;
    output += `   Link: ${project.link}\n\n`;
  });

  return output;
};

const formatVersion = (): string => {
  return `
Terminal Personal Page v0.2.0

Built with:
  • Next.js 16.1.1
  • React 19.2.3
  • TypeScript 5
  • Tailwind CSS 4

Created with ❤️ by ${aboutData.name}
`;
};

export const getCommandSuggestions = (input: string): string[] => {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return [];
  
  return commands
    .map(cmd => cmd.name)
    .filter(name => name.startsWith(trimmed))
    .slice(0, 5);
};

// Authentication handlers
const handleLogin = (username: string, password: string): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: `__ASYNC__login:${username}:${password}`,
    type: 'info',
    isAsync: true
  };
};

const handleRegister = (username: string, email: string, password: string, isAdmin: boolean = false): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  const roleParam = isAdmin ? ':admin' : '';
  return {
    output: `__ASYNC__register:${username}:${email}:${password}${roleParam}`,
    type: 'info',
    isAsync: true
  };
};

const handleLogout = (): { output: string; type: 'success' | 'error' | 'info' } => {
  authAPI.logout();
  return {
    output: '✓ Successfully logged out',
    type: 'success'
  };
};

const handleWhoami = (): { output: string; type: 'success' | 'error' | 'info' } => {
  console.log('whoami called');
  const user = authAPI.getUser();
  console.log('whoami user:', user);
  console.log('localStorage auth_token:', typeof window !== 'undefined' ? localStorage.getItem('auth_token') : 'N/A');
  console.log('localStorage user:', typeof window !== 'undefined' ? localStorage.getItem('user') : 'N/A');
  if (user) {
    const roleDisplay = user.role === 'admin' ? ' [👑 Admin]' : '';
    return {
      output: `Logged in as: ${user.username} (${user.email})${roleDisplay}`,
      type: 'info'
    };
  }
  return {
    output: 'Not logged in. Use "login" to sign in.',
    type: 'info'
  };
};

const handleAdminHelp = (userRole: string | undefined): { output: string; type: 'success' | 'error' | 'info' } => {
  if (userRole !== 'admin') {
    return {
      output: 'Access denied. Admin privileges required.',
      type: 'error'
    };
  }

  let output = '\n╔════════════════════════════════════════════════════════════╗\n';
  output += '║                  ADMIN COMMANDS                            ║\n';
  output += '╚════════════════════════════════════════════════════════════╝\n';
  
  output += '\nAuthentication:\n';
  output += '  login                - Sign in to your account\n';
  output += '  register             - Register a new account\n';
  output += '  logout               - Sign out from your account\n';
  output += '  whoami               - Display current logged in user\n';
  output += '  forgot-password      - Generate password reset token\n';
  output += '  reset-password       - Reset password with generated token\n';
  
  output += '\nComment Moderation:\n';
  output += '  admin comments pending  - View all pending comments\n';
  output += '  admin comment approve <id> - Approve a comment\n';
  output += '  admin comment reject <id> - Reject a comment\n';
  
  output += '\nMessage Management:\n';
  output += '  admin messages          - View all unread contact messages\n';
  output += '  admin messages <status> - View messages by status (unread/read/archived)\n';
  output += '  admin message read <id> - Mark message as read\n';
  output += '  admin message archive <id> - Archive a message\n';
  
  output += '\nBlog Management:\n';
  output += '  blog new "title" "excerpt" "content" [-tags tag1,tag2] [-publish]\n';
  output += '                       - Create a new blog article\n';
  output += '  blog edit <id> "title" "excerpt" "content" [-tags] [-publish]\n';
  output += '                       - Edit existing article\n';
  output += '  blog delete <id>     - Delete article permanently\n';
  
  output += '\nTip: All admin commands require authentication and admin privileges.\n';
  
  return {
    output,
    type: 'info'
  };
};

const handleForgotPassword = (email: string): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: `__ASYNC__forgot-password:${email}`,
    type: 'info',
    isAsync: true
  };
};

const handleResetPassword = (token: string, newPassword: string): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: `__ASYNC__reset-password:${token}:${newPassword}`,
    type: 'info',
    isAsync: true
  };
};

const handleQrzStatus = (): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: '__ASYNC__qrz:status',
    type: 'info',
    isAsync: true
  };
};

const handleQrzSync = (): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: '__ASYNC__qrz:sync',
    type: 'info',
    isAsync: true
  };
};

const handleQrzLogs = (): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: '__ASYNC__qrz:logs',
    type: 'info',
    isAsync: true
  };
};

const handleQrzMap = (): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: '__ASYNC__qrz:map',
    type: 'info',
    isAsync: true
  };
};

const handleQrzIframe = (): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: '__ASYNC__qrz:iframe',
    type: 'info',
    isAsync: true
  };
};

// Blog handlers
const handleBlogList = (page: number = 1): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: `__ASYNC__blog:list:${page}`,
    type: 'info',
    isAsync: true
  };
};

const handleBlogRead = (slug: string): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: `__ASYNC__blog:read:${slug}`,
    type: 'info',
    isAsync: true
  };
};

const handleBlogSearch = (query: string): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: `__ASYNC__blog:search:${query}`,
    type: 'info',
    isAsync: true
  };
};

const handleBlogTags = (): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: '__ASYNC__blog:tags',
    type: 'info',
    isAsync: true
  };
};

const handleBlogFilterByTag = (tag: string): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: `__ASYNC__blog:filter:${tag}`,
    type: 'info',
    isAsync: true
  };
};

const handleBlogComments = (articleId: number): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: `__ASYNC__blog:comments:${articleId}`,
    type: 'info',
    isAsync: true
  };
};

const handleBlogAddComment = (articleId: number, name: string, email: string, comment: string): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  const data = JSON.stringify({ articleId, name, email, comment });
  const encoded = typeof window !== 'undefined' ? btoa(unescape(encodeURIComponent(data))) : Buffer.from(data).toString('base64');
  return {
    output: `__ASYNC__blog:addComment:${encoded}`,
    type: 'info',
    isAsync: true
  };
};

const handleBlogLike = (articleId: number): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: `__ASYNC__blog:like:${articleId}`,
    type: 'info',
    isAsync: true
  };
};

const handleBlogReactions = (articleId: number): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: `__ASYNC__blog:reactions:${articleId}`,
    type: 'info',
    isAsync: true
  };
};

const handleBlogCreate = (title: string, excerpt: string, content: string, tags: string[], publish: boolean): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  const data = JSON.stringify({ title, excerpt, content, tags, publish });
  // Use base64 encoding to avoid issues with special characters
  const encoded = typeof window !== 'undefined' ? btoa(unescape(encodeURIComponent(data))) : Buffer.from(data).toString('base64');
  return {
    output: `__ASYNC__blog:create:${encoded}`,
    type: 'info',
    isAsync: true
  };
};

const handleBlogEdit = (id: number, title: string, excerpt: string, content: string, tags: string[], publish: boolean): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  const data = JSON.stringify({ id, title, excerpt, content, tags, publish });
  const encoded = typeof window !== 'undefined' ? btoa(unescape(encodeURIComponent(data))) : Buffer.from(data).toString('base64');
  return {
    output: `__ASYNC__blog:edit:${encoded}`,
    type: 'info',
    isAsync: true
  };
};

const handleBlogDelete = (id: number): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: `__ASYNC__blog:delete:${id}`,
    type: 'info',
    isAsync: true
  };
};

// Admin handlers
const handleAdminPendingComments = (): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: `__ASYNC__admin:pendingComments`,
    type: 'info',
    isAsync: true
  };
};

const handleAdminModerateComment = (commentId: number, status: 'approved' | 'rejected'): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: `__ASYNC__admin:moderateComment:${commentId}:${status}`,
    type: 'info',
    isAsync: true
  };
};

const handleAdminMessages = (status: string = 'unread'): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: `__ASYNC__admin:messages:${status}`,
    type: 'info',
    isAsync: true
  };
};

const handleAdminMessageStatus = (messageId: number, status: 'read' | 'archived'): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: `__ASYNC__admin:messageStatus:${messageId}:${status}`,
    type: 'info',
    isAsync: true
  };
};

// Contact handler
const handleContactSubmit = (name: string, email: string, message: string): { output: string; type: 'success' | 'error' | 'info'; isAsync: boolean } => {
  return {
    output: `__ASYNC__contact:${name}:${email}:${message}`,
    type: 'info',
    isAsync: true
  };
};

// Async command executor (to be called from Terminal component)
export const executeAsyncCommand = async (asyncOutput: string): Promise<{ output: string; type: 'success' | 'error' | 'info' }> => {
  // Remove __ASYNC__ prefix and split by :
  const cleanOutput = asyncOutput.replace('__ASYNC__', '');
  const [action, ...params] = cleanOutput.split(':');
  
  console.log('Async Command:', { action, params, cleanOutput });
  
  try {
    if (action === 'login') {
      const [username, password] = params;
      console.log('Login attempt:', { username, password });
      const result = await authAPI.login(username, password);
      console.log('Login result:', result);
      const userName = result.user?.username || username;
      return {
        output: `✓ Welcome back, ${userName}!\nYou are now logged in.`,
        type: 'success'
      };
    }
    
    if (action === 'register') {
      const [username, email, password, role] = params;
      const userRole = role === 'admin' ? 'admin' : undefined;
      const result = await authAPI.register(username, password, email, userRole);
      const userName = result.user?.username || username;
      const roleDisplay = result.user?.role === 'admin' ? ' as an admin' : '';
      return {
        output: `✓ Account created successfully${roleDisplay}!\nWelcome, ${userName}! You are now logged in.`,
        type: 'success'
      };
    }
    
    if (action === 'forgot-password') {
      const [email] = params;
      const result = await authAPI.forgotPassword(email);
      const data = (result as any).data;
      return {
        output: `✅ Password reset token generated!\n\n📧 Email: ${email}\n🔑 Reset Token: ${data.resetToken}\n🔗 Reset URL: ${data.resetUrl}\n⏰ Expires: ${new Date(data.expiresAt).toLocaleString()}\n\nUse:\nreset-password ${data.resetToken} <new-password>`,
        type: 'success'
      };
    }
    
    if (action === 'reset-password') {
      const [token, newPassword] = params;
      await authAPI.resetPassword(token, newPassword);
      return {
        output: `✅ Password reset successful!\n\nYour password has been updated. You can now login with your new password.\n\nUse: login <username> <new-password>`,
        type: 'success'
      };
    }
    
    if (action === 'blog') {
      const subAction = params[0];
      
      if (subAction === 'list') {
        const page = params[1] ? parseInt(params[1]) : 1;
        const result = await blogAPI.getArticles();
        console.log('Blog list result:', result);
        
        if (!result || !result.articles) {
          console.error('Invalid result structure:', result);
          return { output: '❌ Failed to fetch articles. Please try again.', type: 'error' };
        }
        
        if (result.articles.length === 0) {
          return { output: 'No blog articles found.', type: 'info' };
        }
        
        const output = formatArticleList(result.articles, page, 10);
        return { output, type: 'success' };
      }
      
      if (subAction === 'read') {
        const slug = params[1];
        const result = await blogAPI.getArticleBySlug(slug);
        const output = formatArticleDetail(result.article);
        return { output, type: 'success' };
      }
      
      if (subAction === 'search') {
        const query = params.slice(1).join(':');
        const result = await blogAPI.searchArticles(query);
        const output = formatSearchResults(result.articles, query);
        return { output, type: 'success' };
      }
      
      if (subAction === 'tags') {
        const result = await blogAPI.getTags();
        const output = formatTags(result.tags);
        return { output, type: 'success' };
      }

      if (subAction === 'filter') {
        const tag = params[1];
        const result = await blogAPI.getArticles();
        const filtered = result.articles.filter((article: Article) => 
          article.tags.some(t => t.toLowerCase() === tag.toLowerCase())
        );
        if (filtered.length === 0) {
          return { 
            output: `\n🏷️  No articles found with tag "${tag}"\n\nUse 'blog tags' to see all available tags`, 
            type: 'info' 
          };
        }
        const output = formatArticleList(filtered, 1, 10);
        return { output, type: 'success' };
      }

      if (subAction === 'comments') {
        const articleId = parseInt(params[1]);
        const result = await commentsAPI.getComments(articleId);
        const output = formatComments(result.comments, articleId);
        return { output, type: 'success' };
      }

      if (subAction === 'addComment') {
        const decoded = decodeURIComponent(escape(atob(params[1])));
        const data = JSON.parse(decoded);
        
        await commentsAPI.createComment(data.articleId, data.name, data.email, data.comment);
        return { 
          output: `✅ Comment submitted successfully!\n\nYour comment is pending approval and will appear soon.\n\n💡 Use 'blog comments ${data.articleId}' to view all comments`, 
          type: 'success' 
        };
      }

      if (subAction === 'like') {
        const articleId = parseInt(params[1]);
        const result = await reactionsAPI.toggleReaction(articleId, 'like');
        return { 
          output: `❤️  ${result.message}\n\n💡 Use 'blog reactions ${articleId}' to see all reactions`, 
          type: 'success' 
        };
      }

      if (subAction === 'reactions') {
        const articleId = parseInt(params[1]);
        const result = await reactionsAPI.getReactions(articleId);
        const output = formatReactions(result.reactions, articleId);
        return { output, type: 'success' };
      }

      if (subAction === 'create') {
        // Decode base64 then parse JSON
        const decoded = decodeURIComponent(escape(atob(params[1])));
        const data = JSON.parse(decoded);
        
        const result = await blogAPI.createArticle({
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          tags: data.tags || [],
          published: data.publish
        });
        
        return { 
          output: `✅ Article created successfully!\n\n📝 Title: ${data.title}\n🔗 Slug: ${result.data.slug}\n📊 Status: ${data.publish ? 'Published' : 'Draft'}\n\n💡 Use 'blog read ${result.data.slug}' to view your article`,
          type: 'success' 
        };
      }
      
      if (subAction === 'edit') {
        const decoded = decodeURIComponent(escape(atob(params[1])));
        const data = JSON.parse(decoded);
        
        await blogAPI.updateArticle(data.id, {
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          tags: data.tags || [],
          published: data.publish
        });
        
        return { 
          output: `✅ Article updated successfully!\n\n📝 Article ID: ${data.id}\n📝 Title: ${data.title}\n📊 Status: ${data.publish ? 'Published' : 'Draft'}\n\n💡 Use 'blog list' to see your updated article`,
          type: 'success' 
        };
      }
      
      if (subAction === 'delete') {
        const articleId = parseInt(params[1]);
        
        await blogAPI.deleteArticle(articleId);
        
        return { 
          output: `✅ Article deleted successfully!\n\n🗑️  Article ID ${articleId} has been permanently removed.\n\n💡 Use 'blog list' to see remaining articles`,
          type: 'success' 
        };
      }
    }
    
    if (action === 'admin') {
      const subAction = params[0];
      
      if (subAction === 'pendingComments') {
        const result = await commentsAPI.getPendingComments();
        
        if (!result.comments || result.comments.length === 0) {
          return { 
            output: '✨ No pending comments at this time.', 
            type: 'info' 
          };
        }
        
        let output = '\n🔍 Pending Comments:\n';
        output += '═'.repeat(80) + '\n\n';
        
        result.comments.forEach((comment: any, index: number) => {
          output += `[${index + 1}] Comment ID: ${comment.id}\n`;
          output += '─'.repeat(80) + '\n';
          output += `📝 Article ID: ${comment.article_id}\n`;
          output += `👤 Author: ${comment.author_name} <${comment.author_email}>\n`;
          output += `💬 Content: ${comment.content}\n`;
          output += `📅 Posted: ${new Date(comment.created_at).toLocaleString()}\n`;
          output += `\n✅ To approve: admin comment approve ${comment.id}\n`;
          output += `❌ To reject: admin comment reject ${comment.id}\n`;
          output += '═'.repeat(80) + '\n\n';
        });
        
        output += `📊 Total pending: ${result.comments.length} comment(s)\n`;
        
        return { output, type: 'success' };
      }
      
      if (subAction === 'moderateComment') {
        const commentId = parseInt(params[1]);
        const status = params[2] as 'approved' | 'rejected';
        
        await commentsAPI.moderateComment(commentId, status);
        
        const statusIcon = status === 'approved' ? '✅' : '❌';
        const statusText = status === 'approved' ? 'approved' : 'rejected';
        
        return { 
          output: `${statusIcon} Comment #${commentId} has been ${statusText} successfully!\n\n💡 Use 'admin comments pending' to view remaining pending comments`, 
          type: 'success' 
        };
      }
      
      if (subAction === 'messages') {
        const status = params[1] || 'unread';
        const result = await contactAPI.getMessages(status);
        
        if (!result.messages || result.messages.length === 0) {
          return { 
            output: `✨ No ${status} messages at this time.`, 
            type: 'info' 
          };
        }
        
        let output = '\n📬 Contact Messages:\n';
        output += '═'.repeat(80) + '\n\n';
        
        result.messages.forEach((msg: any, index: number) => {
          output += `[${index + 1}] Message ID: ${msg.id} | Status: ${msg.status || 'unread'}\n`;
          output += '─'.repeat(80) + '\n';
          output += `👤 From: ${msg.name} <${msg.email}>\n`;
          output += `📅 Received: ${new Date(msg.created_at).toLocaleString()}\n`;
          output += `💬 Message:\n${msg.message}\n`;
          output += `\n📖 Mark as read: admin message read ${msg.id}\n`;
          output += `🗄️  Archive: admin message archive ${msg.id}\n`;
          output += '═'.repeat(80) + '\n\n';
        });
        
        output += `📊 Total ${status} messages: ${result.messages.length}\n`;
        
        return { output, type: 'success' };
      }
      
      if (subAction === 'messageStatus') {
        const messageId = parseInt(params[1]);
        const status = params[2] as 'read' | 'archived';
        
        await contactAPI.updateMessageStatus(messageId, status);
        
        const statusIcon = status === 'read' ? '📖' : '🗄️';
        const statusText = status === 'read' ? 'read' : 'archived';
        
        return { 
          output: `${statusIcon} Message #${messageId} has been marked as ${statusText}!\n\n💡 Use 'admin messages' to view all messages`, 
          type: 'success' 
        };
      }
    }
    
    if (action === 'contact') {
      const [name, email, message] = params;
      await contactAPI.submit(name, email, message);
      return {
        output: `✓ Message sent successfully!\nThank you ${name}, I'll get back to you soon.`,
        type: 'success'
      };
    }

    if (action === 'qrz') {
      const subAction = params[0] || 'status';

      if (subAction === 'status') {
        const status = await qrzAPI.getStatus();
        return {
          output: `QRZ Sync Status\n${'='.repeat(60)}\nLast Sync: ${status?.last_sync_at || 'never'}\nLast Status: ${status?.last_status || 'n/a'}\nLast Error: ${status?.last_error || 'none'}\n`,
          type: 'info'
        };
      }

      if (subAction === 'sync') {
        const result = await qrzAPI.syncNow();
        return {
          output: `✅ QRZ sync finished\n\nFetched: ${result.totalFetched}\nImported: ${result.imported}\nUpdated: ${result.updated}\nSkipped: ${result.skipped}\nSource: ${result.sourceUrl}\nAt: ${new Date(result.lastSyncAt).toLocaleString()}`,
          type: 'success'
        };
      }

      if (subAction === 'logs') {
        const result = await qrzAPI.getLogs();
        const preview = (result.logs || []).slice(0, 10);

        if (!preview.length) {
          return {
            output: 'No QRZ logs available yet. Run: qrz sync',
            type: 'info'
          };
        }

        const lines = preview.map((item: any, index: number) => {
          return `${index + 1}. ${item.callsign} | ${item.worked_at} | ${item.band || '-'} | ${item.mode || '-'} | ${item.country || '-'}`;
        });

        return {
          output: `QRZ Logs (showing ${preview.length} of ${result.count})\n${'='.repeat(60)}\n${lines.join('\n')}`,
          type: 'success'
        };
      }

      if (subAction === 'map') {
        return {
          output: `Map URL:\n${qrzAPI.getMapEmbedUrl()}\n\nOpen this URL in a browser or embed it using: qrz iframe`,
          type: 'info'
        };
      }

      if (subAction === 'iframe') {
        const iframe = await qrzAPI.getEmbedCode();
        return {
          output: `Embed snippet:\n\n${iframe}`,
          type: 'success'
        };
      }
    }
    
    return {
      output: 'Unknown async command',
      type: 'error'
    };
  } catch (error: any) {
    console.error('Async command execution error:', error);
    return {
      output: `✗ Error: ${error.message || 'Unknown error occurred'}`,
      type: 'error'
    };
  }
};

