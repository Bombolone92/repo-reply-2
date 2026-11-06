# Troubleshooting Guide

## 🎯 Overview

This troubleshooting guide covers common issues you might encounter while using ALwrity and provides step-by-step solutions to get you back on track quickly.

## 🚨 Common Issues and Solutions

### Setup and Installation Issues

#### Issue: "Python not found" or "Node.js not found"
**Symptoms**: Error messages about missing Python or Node.js when trying to start ALwrity

**Solutions**:
1. **Check Installation**:
   ```bash
   python --version  # Should show Python 3.8+
   node --version    # Should show Node.js 18+
   ```

2. **Install Missing Components**:
   - **Python**: Download from [python.org](https://python.org)
   - **Node.js**: Download from [nodejs.org](https://nodejs.org)

3. **Restart Terminal**: Close and reopen your terminal after installation

#### Issue: "API key not configured" errors
**Symptoms**: Content generation fails with authentication errors

**Solutions**:
1. **Check Environment Variables**:
   ```bash
   # In backend directory
   cat .env | grep API_KEY
   ```

2. **Set Up API Keys**:
   - Copy `env_template.txt` to `.env`
   - Add your API keys for Gemini, OpenAI, or other services
   - Restart the backend server

3. **Verify API Keys**:
   - Test keys with simple requests
   - Check API quotas and billing

#### Issue: "Port already in use" errors
**Symptoms**: Backend or frontend won't start due to port conflicts

**Solutions**:
1. **Find Process Using Port**:
   ```bash
   # For port 8000 (backend)
   netstat -ano | findstr :8000
   
   # For port 3000 (frontend)
   netstat -ano | findstr :3000
   ```

2. **Kill Conflicting Process**:
   ```bash
   taskkill /PID <process_id> /F
   ```

3. **Use Different Ports**:
   - Change ports in configuration files
   - Update frontend API endpoints if needed

### Content Generation Issues

#### Issue: "No content generated" or empty responses
**Symptoms**: Content generation returns empty or minimal content

**Solutions**:
1. **Check Input Quality**:
   - Provide more detailed prompts
   - Include specific requirements and context
   - Use clear, descriptive language

2. **Verify API Configuration**:
   - Check API key validity
   - Monitor API quota usage
   - Test with simple prompts first

3. **Try Different Approaches**:
   - Use shorter, more focused prompts
   - Break complex requests into smaller parts
   - Try different content types (blog vs. social media)

#### Issue: "Content quality is poor" or irrelevant
**Symptoms**: Generated content doesn't match your requirements or is low quality

**Solutions**:
1. **Improve Prompt Quality**:
   - Be more specific about tone and style
   - Include examples of desired content
   - Specify target audience and goals

2. **Use Persona System**:
   - Create or update your persona settings
   - Ensure persona reflects your brand voice
   - Test with different persona configurations

3. **Adjust Content Settings**:
   - Modify content length requirements
   - Change content type or format
   - Enable research integration for better accuracy

#### Issue: "Research integration not working"
**Symptoms**: Content lacks research-backed information or sources

**Solutions**:
1. **Enable Research Mode**:
   - Toggle "Research Integration" in content settings
   - Ensure research services are configured
   - Check API keys for search services

2. **Improve Research Queries**:
   - Use more specific search terms
   - Include industry or topic context
   - Try different keyword combinations

3. **Verify Research Services**:
   - Check search engine API configurations
   - Monitor research service quotas
   - Test research functionality separately

### Performance and Speed Issues

#### Issue: "Content generation is slow"
**Symptoms**: Long delays when generating content

**Solutions**:
1. **Check System Resources**:
   - Monitor CPU and memory usage
   - Close unnecessary applications
   - Ensure stable internet connection

2. **Optimize Content Requests**:
   - Reduce content length requirements
   - Use simpler prompts
   - Disable unnecessary features

3. **Check API Response Times**:
   - Monitor API service status
   - Try different AI service providers
   - Use faster content types (shorter posts vs. long articles)

#### Issue: "App crashes or freezes"
**Symptoms**: ALwrity becomes unresponsive or crashes

**Solutions**:
1. **Check System Resources**:
   - Monitor memory usage
   - Close other applications
   - Restart the application

2. **Clear Cache and Data**:
   ```bash
   # Clear browser cache
   Ctrl + Shift + Delete
   
   # Clear application cache
   rm -rf node_modules/.cache
   ```

3. **Restart Services**:
   ```bash
   # Stop all services
   Ctrl + C
   
   # Restart backend
   cd backend && python app.py
   
   # Restart frontend
   cd frontend && npm start
   ```

### Database and Data Issues

#### Issue: "Database connection failed"
**Symptoms**: Error messages about database connectivity

**Solutions**:
1. **Check Database File**:
   - Ensure database files exist in backend directory
   - Check file permissions
   - Verify database isn't corrupted

2. **Reset Database**:
   ```bash
   # Backup existing data
   cp alwrity.db alwrity.db.backup
   
   # Remove and recreate database
   rm alwrity.db
   python -c "from models.database import init_db; init_db()"
   ```

3. **Check Database Dependencies**:
   - Ensure SQLite is properly installed
   - Update database models if needed
   - Run database migrations

#### Issue: "Data not saving" or "Settings not persisting"
**Symptoms**: Changes don't save between sessions

**Solutions**:
1. **Check File Permissions**:
   - Ensure write permissions on data directories
   - Check disk space availability
   - Verify file system integrity

2. **Clear Application Cache**:
   - Clear browser local storage
   - Reset application settings
   - Restart all services

3. **Check Database Integrity**:
   - Verify database file isn't corrupted
   - Check for database locking issues
   - Run database integrity checks

### SEO and Analytics Issues

#### Issue: "Google Search Console not connecting"
**Symptoms**: Can't authenticate or import GSC data

**Solutions**:
1. **Check Authentication**:
   - Verify Google account permissions
   - Re-authenticate GSC connection
   - Check API quotas and limits

2. **Verify Website Ownership**:
   - Ensure GSC property is verified
   - Check domain/property configuration
   - Verify website is properly indexed

3. **Test Connection**:
   - Try manual data import
   - Check API endpoint accessibility
   - Monitor for error messages

#### Issue: "SEO data not updating"
**Symptoms**: SEO dashboard shows outdated information

**Solutions**:
1. **Force Data Refresh**:
   - Click "Refresh Data" in SEO dashboard
   - Check data update intervals
   - Verify API connection status

2. **Check Data Sources**:
   - Ensure GSC connection is active
   - Verify website tracking is working
   - Check for data processing delays

3. **Monitor API Limits**:
   - Check GSC API quota usage
   - Implement data caching if needed
   - Optimize data request frequency

### Browser and Frontend Issues

#### Issue: "Page not loading" or "White screen"
**Symptoms**: Frontend doesn't load or shows blank page

**Solutions**:
1. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for JavaScript errors
   - Check network request failures

2. **Clear Browser Data**:
   - Clear cache and cookies
   - Disable browser extensions
   - Try incognito/private mode

3. **Check Frontend Build**:
   ```bash
   cd frontend
   npm install
   npm run build
   npm start
   ```

#### Issue: "Features not working" in browser
**Symptoms**: Buttons don't respond or features are disabled

**Solutions**:
1. **Check JavaScript Errors**:
   - Open Developer Tools console
   - Look for error messages
   - Check for missing dependencies

2. **Verify API Connection**:
   - Check if backend is running
   - Test API endpoints directly
   - Verify CORS configuration

3. **Update Dependencies**:
   ```bash
   cd frontend
   npm update
   npm install
   ```

## 🔧 Advanced Troubleshooting

### Log Analysis

#### Backend Logs
```bash
# Check backend logs
tail -f backend/logs/alwrity.log

# Check specific error types
grep -i error backend/logs/alwrity.log
grep -i exception backend/logs/alwrity.log
```

#### Frontend Logs
```bash
# Check browser console
# Open Developer Tools (F12) and check Console tab

# Check network requests
# Open Developer Tools > Network tab
```

### System Diagnostics

#### Check System Resources
```bash
# Check memory usage
free -h  # Linux/Mac
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /format:table  # Windows

# Check disk space
df -h  # Linux/Mac
dir C:\  # Windows
```

#### Network Diagnostics
```bash
# Test internet connectivity
ping google.com

# Check DNS resolution
nslookup google.com

# Test API endpoints
curl -I https://api.example.com/health
```

### Configuration Verification

#### Environment Variables
```bash
# Check all environment variables
env | grep ALWRITY

# Verify specific configurations
echo $API_KEY
echo $DATABASE_URL
```

#### Service Status
```bash
# Check if services are running
ps aux | grep python  # Backend
ps aux | grep node    # Frontend

# Check port usage
netstat -tulpn | grep :8000  # Backend port
netstat -tulpn | grep :3000  # Frontend port
```

## 🆘 Getting Additional Help

### Self-Help Resources
1. **Documentation**: Check the main documentation for detailed guides
2. **GitHub Issues**: Search existing issues for similar problems
3. **Community Forums**: Ask questions in the community discussions
4. **Video Tutorials**: Watch step-by-step setup and usage guides

### Reporting Issues
When reporting issues, please include:
1. **Error Messages**: Exact error text and screenshots
2. **Steps to Reproduce**: Detailed steps that led to the issue
3. **System Information**: OS, browser, Python/Node versions
4. **Log Files**: Relevant log entries and error traces
5. **Expected vs. Actual Behavior**: What you expected vs. what happened

### Contact Support
- **GitHub Issues**: Create detailed issue reports
- **Community Discord**: Join for real-time help
- **Email Support**: For urgent or complex issues
- **Documentation**: Check for updates and new guides

## 📋 Prevention Tips

### Regular Maintenance
1. **Keep Software Updated**: Regularly update Python, Node.js, and dependencies
2. **Monitor System Resources**: Ensure adequate memory and disk space
3. **Backup Data**: Regularly backup your database and configuration files
4. **Check Logs**: Periodically review logs for potential issues

### Best Practices
1. **Use Stable Internet**: Ensure reliable internet connection for API calls
2. **Monitor API Quotas**: Keep track of API usage and limits
3. **Test Changes**: Test new features in development before production
4. **Document Configuration**: Keep notes of your setup and customizations

---

*Still having issues? Check our [GitHub Issues](https://github.com/AJaySi/ALwrity/issues) or join our [Community Discussions](https://github.com/AJaySi/ALwrity/discussions) for additional support!*
