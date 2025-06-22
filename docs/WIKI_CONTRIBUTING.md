# Contributing to Perfect Zenkai

## 🤝 **Welcome Contributors!**

Thank you for your interest in contributing to Perfect Zenkai! We welcome contributions from developers of all skill levels. This guide will help you get started.

---

## 🌟 **Ways to Contribute**

### **Code Contributions**
- **Bug fixes** - Help us squash bugs and improve stability
- **Feature development** - Implement new features from our roadmap
- **Performance improvements** - Optimize code and enhance user experience
- **Test coverage** - Add tests to improve code quality

### **Non-Code Contributions**
- **Documentation** - Improve guides, tutorials, and API docs
- **Bug reports** - Report issues with detailed reproduction steps
- **Feature requests** - Suggest new features and improvements
- **Design feedback** - UI/UX suggestions and improvements

---

## 🛠️ **Development Setup**

### **Prerequisites**
- **Node.js 22+** - We use the latest JavaScript features
- **Git** - For version control
- **Code Editor** - VS Code recommended with TypeScript support

### **Getting Started**

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/PerfectZenkai.git

# Navigate to the project
cd PerfectZenkai

# Add upstream remote
git remote add upstream https://github.com/Perfectz/PerfectZenkai.git

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Development Workflow**

```bash
# Create a new branch for your feature
git checkout -b feature/amazing-new-feature

# Make your changes
# ... code, code, code ...

# Run tests to ensure everything works
npm test

# Run linting to maintain code quality
npm run lint

# Commit your changes
git add .
git commit -m "feat: add amazing new feature"

# Push to your fork
git push origin feature/amazing-new-feature

# Create a Pull Request on GitHub
```

---

## 📋 **Development Standards**

### **Code Quality Requirements**
- **TypeScript Strict Mode** - All code must be fully typed
- **ESLint Compliance** - Code must pass all linting rules
- **Test Coverage** - New features require comprehensive tests
- **Documentation** - Public APIs must be documented

### **Architecture Principles**
- **Vertical Slice Architecture** - Each feature is a complete slice
- **Domain-Driven Design** - Code organized around business domains
- **Type Safety First** - Leverage TypeScript for reliability
- **Test-Driven Development** - Write tests before implementation

### **Commit Message Format**

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

Examples:
feat(weight): add goal setting functionality
fix(auth): resolve login timeout issue
docs(readme): update installation instructions
test(tasks): add unit tests for priority engine
```

**Types:**
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `test` - Adding or updating tests
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `chore` - Maintenance tasks

---

## 🧪 **Testing Guidelines**

### **Test Requirements**
- **Unit Tests** - Test individual functions and components
- **Integration Tests** - Test feature workflows
- **E2E Tests** - Test complete user journeys
- **Coverage Target** - Minimum 90% coverage for new code

### **Running Tests**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### **Writing Tests**

```typescript
// Example unit test
import { describe, it, expect } from 'vitest'
import { WeightAnalyticsEngine } from '../WeightAnalyticsEngine'

describe('WeightAnalyticsEngine', () => {
  it('should calculate trend correctly', () => {
    const engine = new WeightAnalyticsEngine()
    const weights = [
      { kg: 70, dateISO: '2024-01-01' },
      { kg: 69, dateISO: '2024-01-02' }
    ]
    
    const trend = engine.calculateTrend(weights)
    expect(trend.direction).toBe('decreasing')
  })
})
```

---

## 🏗️ **Architecture Guidelines**

### **Module Structure**
When adding new features, follow our vertical slice architecture:

```
src/modules/your-feature/
├── components/          # UI components
├── hooks/              # Business logic hooks
├── services/           # Data services & AI agents
├── stores/             # State management
├── types/              # TypeScript interfaces
├── pages/              # Route components
├── __tests__/          # Test files
└── index.ts            # Public API
```

### **AI Agent Development**
When creating AI agents:

```typescript
export class YourFeatureAgent {
  static async analyzeData(params: AnalysisParams): Promise<AnalysisResult> {
    // Implement your analysis logic
    return {
      insights: [],
      recommendations: [],
      confidence: 0.95
    }
  }
}
```

### **State Management**
Use Zustand for state management:

```typescript
interface YourFeatureStore {
  data: YourData[]
  isLoading: boolean
  error: string | null
  
  // Actions
  loadData: () => Promise<void>
  addItem: (item: YourData) => Promise<void>
}

export const useYourFeatureStore = create<YourFeatureStore>()(
  persist(
    (set, get) => ({
      data: [],
      isLoading: false,
      error: null,
      
      loadData: async () => {
        // Implementation
      }
    }),
    { name: 'your-feature-store' }
  )
)
```

---

## 🎯 **Feature Development Process**

### **1. Planning Phase**
- **Create an issue** describing the feature
- **Discuss approach** with maintainers
- **Break down** into smaller tasks
- **Design interfaces** and types first

### **2. Implementation Phase**
- **Write tests first** (TDD approach)
- **Implement in small commits**
- **Follow existing patterns**
- **Update documentation**

### **3. Review Phase**
- **Self-review** your changes
- **Run full test suite**
- **Update relevant documentation**
- **Create pull request**

---

## 🔍 **Pull Request Guidelines**

### **Before Submitting**
- [ ] Tests pass locally
- [ ] Linting passes
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main

### **PR Description Template**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots of UI changes

## Checklist
- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added and passing
```

---

## 🐛 **Reporting Issues**

### **Bug Reports**
Please include:
- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected behavior**
- **Actual behavior**
- **Environment details** (browser, OS, etc.)
- **Screenshots** if applicable

### **Feature Requests**
Please include:
- **Problem statement** - What problem does this solve?
- **Proposed solution** - How should it work?
- **Alternatives considered** - Other approaches you've thought of
- **Use cases** - Who would benefit from this feature?

---

## 🏆 **Recognition**

### **Contributors**
All contributors are recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page

### **Maintainer Path**
Active contributors may be invited to become maintainers with:
- **Commit access** to the repository
- **Review responsibilities** for pull requests
- **Roadmap input** on project direction

---

## 📞 **Getting Help**

### **Communication Channels**
- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Code Reviews** - Direct feedback on pull requests

### **Mentorship**
New contributors can:
- **Tag maintainers** in issues for guidance
- **Ask questions** in discussions
- **Request code reviews** for learning

---

## 📜 **Code of Conduct**

We are committed to providing a welcoming and inclusive environment. Please:

- **Be respectful** to all community members
- **Be constructive** in feedback and discussions
- **Be patient** with new contributors
- **Be collaborative** in problem-solving

---

**Thank you for contributing to Perfect Zenkai! Together, we're building the future of personal wellness and productivity.** 🌟 