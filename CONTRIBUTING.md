# Contributing to AetherWeb3

Thank you for your interest in contributing to AetherWeb3! This document provides guidelines and information for contributors.

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and follow our code of conduct:

- Be respectful and inclusive
- Use welcoming and inclusive language
- Be collaborative and constructive
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use the issue template** when available
3. **Provide clear, detailed information** including:
   - Steps to reproduce the issue
   - Expected vs actual behavior
   - Environment details (Node.js version, OS, etc.)
   - Error messages or logs

### Suggesting Features

We welcome feature suggestions! Please:

1. **Check existing feature requests** first
2. **Explain the use case** and why it would be valuable
3. **Provide detailed specifications** when possible
4. **Consider backward compatibility** implications

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/aetherweb3-website.git
   cd aetherweb3-website
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Making Changes

#### Code Style

- Follow existing code patterns and conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure proper error handling
- Maintain consistent indentation (2 spaces)

#### Testing

- Add tests for new functionality
- Ensure all existing tests pass
- Aim for good test coverage
- Test edge cases and error conditions

```bash
# Run tests
npm test

# Run specific test file
npm test -- tests/api.test.js

# Run tests with coverage
npm test -- --coverage
```

#### Linting

We use ESLint to maintain code quality:

```bash
# Check linting
npm run lint

# Auto-fix linting issues
npm run lint -- --fix
```

### Commit Guidelines

We follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(api): add support for Polygon network
fix(auth): resolve JWT token validation issue
docs(readme): update installation instructions
```

### Pull Request Process

1. **Update documentation** if needed
2. **Add or update tests** for your changes
3. **Ensure all tests pass** and code is linted
4. **Update the changelog** if applicable
5. **Create a pull request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots for UI changes
   - Testing instructions

#### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Tests pass
- [ ] New tests added
- [ ] Manual testing completed

## Related Issues
Fixes #123
```

### Review Process

1. **Automated checks** must pass (tests, linting)
2. **Code review** by maintainers
3. **Approval required** before merging
4. **Squash and merge** for clean history

## Architecture Guidelines

### Project Structure

```
aetherweb3-website/
├── gateway/                 # Main gateway application
├── lib/                    # Shared libraries
├── middleware/             # Express middleware
├── routes/                 # API routes
├── tests/                  # Test files
├── docs/                   # Documentation
└── scripts/                # Build and deployment scripts
```

### Key Principles

- **Security First**: All changes must maintain security standards
- **Performance**: Consider performance implications
- **Scalability**: Design for scale from the start
- **Maintainability**: Write clean, readable code
- **Documentation**: Keep docs up to date

### API Design

- Follow RESTful principles
- Use standard HTTP status codes
- Provide clear error messages
- Implement proper validation
- Support JSON-RPC 2.0 format

## Security Considerations

### Security Reviews

All security-related changes require additional review:

- Authentication and authorization changes
- Input validation modifications
- Cryptographic implementations
- External API integrations

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities. Instead:

1. Email security@nibertinvestments.com
2. Include detailed description and steps to reproduce
3. Allow time for proper fix and disclosure

## Documentation

### Code Documentation

- Use JSDoc for function documentation
- Include parameter types and descriptions
- Document complex algorithms
- Provide usage examples

### User Documentation

- Keep README.md updated
- Update API documentation
- Include migration guides for breaking changes
- Provide clear examples

## Community

### Getting Help

- **GitHub Issues**: Technical questions and bug reports
- **Email**: support@nibertinvestments.com for complex issues
- **Documentation**: Check existing docs first

### Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes for significant contributions
- Annual contributor acknowledgments

## License

By contributing to AetherWeb3, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to AetherWeb3! 🚀