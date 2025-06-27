# Security Documentation

**Epic Tree - Security Controls and Measures**

## Overview

Epic Tree is built on Atlassian Forge, leveraging Atlassian's enterprise-grade security infrastructure. This document outlines our security approach and controls.

## Security Architecture

### Platform Security

- **Atlassian Forge Platform**: Built on AWS with enterprise-grade security
- **Serverless Architecture**: No server management or patching required
- **Isolation**: Each app runs in isolated containers
- **Automatic Updates**: Platform security updates handled by Atlassian

### Data Security

#### Technical Controls

- **Encryption in Transit**: All data transmitted using TLS 1.2+
- **Encryption at Rest**: Data encrypted using AES-256
- **Access Controls**: Role-based access through Jira permissions
- **Authentication**: Leverages Atlassian's authentication system
- **Authorization**: Minimal required permissions (read:jira-work, write:jira-work, read:jira-user)

#### Data Handling

- **No External Storage**: Data never leaves Atlassian's infrastructure
- **Memory-Only Processing**: No persistent data storage
- **Real-Time Access**: Direct API calls to Jira, no caching
- **Data Minimization**: Only accesses necessary data for functionality

## Security Controls

### Administrative Controls

- **Least Privilege Access**: App requests minimal necessary permissions
- **Separation of Duties**: Development and deployment processes separated
- **Incident Response**: Process in place for security incident handling
- **Regular Updates**: Code regularly updated for security patches

### Technical Controls

- **Input Validation**: All user inputs validated and sanitized
- **Output Encoding**: Data properly encoded to prevent XSS
- **CSRF Protection**: Built-in CSRF protection via Forge platform
- **Content Security Policy**: Strict CSP headers implemented

### Physical Controls

- **Infrastructure**: Leverages Atlassian/AWS physical security
- **No Physical Access**: Serverless architecture eliminates physical access concerns

## Compliance and Certifications

### Inherited from Atlassian

- **SOC 2 Type II**: Atlassian maintains SOC 2 compliance
- **ISO 27001**: Atlassian is ISO 27001 certified
- **GDPR Compliance**: Built on GDPR-compliant infrastructure
- **Privacy Shield**: Follows data protection frameworks

### App-Specific Compliance

- **Data Minimization**: Follows GDPR data minimization principles
- **Privacy by Design**: Built with privacy considerations from the start
- **Transparency**: Clear documentation of data handling practices

## Vulnerability Management

### Development Security

- **Secure Coding Practices**: Following OWASP guidelines
- **Dependency Management**: Regular updates of dependencies
- **Code Review**: All code changes reviewed before deployment
- **Static Analysis**: Automated security scanning of code

### Monitoring and Detection

- **Platform Monitoring**: Leverages Atlassian's monitoring systems
- **Error Tracking**: Application errors monitored and tracked
- **Access Logging**: All data access logged through Atlassian systems

## Incident Response

### Process

1. **Detection**: Issues identified through monitoring or user reports
2. **Assessment**: Impact and severity evaluation
3. **Containment**: Immediate steps to limit exposure
4. **Communication**: Notification to affected users if required
5. **Resolution**: Fix implementation and verification
6. **Documentation**: Post-incident review and documentation

### Contact

For security concerns or to report vulnerabilities:

- **Email**: gil.itzhaky@gmail.com
- **Subject**: [SECURITY] Epic Tree Security Issue
- **GitHub**: https://github.com/gilitz/Epic-Tree/issues (for non-sensitive issues)

## Data Processing Agreement (DPA)

Epic Tree operates under Atlassian's Data Processing Agreement:

- **Subprocessor**: Epic Tree acts as a subprocessor to Atlassian
- **Data Controller**: Your organization remains the data controller
- **Processing Purpose**: Limited to Epic Tree functionality only
- **Data Subject Rights**: Supported through established processes

## Regular Security Reviews

- **Monthly**: Dependency updates and security patches
- **Quarterly**: Security control effectiveness review
- **Annually**: Comprehensive security assessment

## Contact Information

For security-related questions or concerns:

- **Primary Contact**: gil.itzhaky@gmail.com
- **Website**: https://gilitz.com
- **GitHub Issues**: https://github.com/gilitz/Epic-Tree/issues

---

**Last Updated**: February 4, 2025
**Next Review**: May 4, 2025
