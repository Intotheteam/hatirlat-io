# Hatirlat.io API Integration Troubleshooting Guide

## Common Issues and Solutions

### 1. CORS Errors

**Symptoms**: 
- Browser console shows "Blocked by CORS policy" errors
- API requests fail with no response
- Network tab shows OPTIONS requests failing

**Solutions**:
1. Check `application.properties` in backend for correct CORS configuration:
   ```properties
   cors.allowed-origins=http://localhost:3000
   ```

2. Verify that the backend SecurityConfig allows OPTIONS requests:
   ```java
   @Override
   public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
           throws IOException, ServletException {
       HttpServletResponse res = (HttpServletResponse) response;
       res.setHeader("Access-Control-Allow-Origin", "*");
       res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
       res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
       res.setHeader("Access-Control-Max-Age", "3600");
       
       if ("OPTIONS".equalsIgnoreCase(((HttpServletRequest) request).getMethod())) {
           res.setStatus(HttpServletResponse.SC_OK);
       } else {
           chain.doFilter(request, response);
       }
   }
   ```

3. Restart both frontend and backend servers after making changes

### 2. Authentication Failures

**Symptoms**: 
- Login requests return 401 Unauthorized
- API requests return 401/403 errors
- "Invalid credentials" error messages

**Solutions**:
1. Verify that the test user exists in the database:
   - Check if the database has been initialized with default users
   - If using H2 database, check the console at `http://localhost:8080/h2-console`

2. Check that passwords are properly hashed:
   - Ensure that the AuthService properly encodes passwords with BCrypt

3. Verify JWT token generation:
   - Check that the JwtService is correctly signing tokens
   - Ensure the secret key is properly configured

4. Check that the frontend is sending the Authorization header correctly:
   - Token should be sent as `Bearer <token>`
   - Verify that the token is being stored and retrieved correctly

### 3. API Connection Issues

**Symptoms**: 
- "Network Error" or "Failed to fetch" messages
- Requests timeout without response
- "ECONNREFUSED" errors

**Solutions**:
1. Verify that the backend server is running:
   - Check that the backend process is active
   - Verify the server is listening on the correct port (usually 8080)

2. Check the API base URL configuration:
   - In frontend, verify `NEXT_PUBLIC_API_URL` in `.env.local`
   - Ensure it matches the backend server address

3. Check firewall/network settings:
   - Ensure ports are not blocked by firewall
   - Verify network connectivity between frontend and backend

4. Check for port conflicts:
   - Ensure no other process is using the same port
   - Try changing the port in `application.properties`:
     ```properties
     server.port=8081
     ```

### 4. Data Not Persisting

**Symptoms**: 
- Created data disappears after page refresh
- Changes are not saved to database
- Same data appears after deletion

**Solutions**:
1. Verify database configuration:
   - Check that the database connection is properly configured
   - Ensure the database is running and accessible

2. Check entity mappings:
   - Verify that JPA entities are properly annotated
   - Ensure relationships are correctly mapped

3. Verify transaction management:
   - Check that service methods are properly annotated with `@Transactional`
   - Ensure repositories are correctly implemented

4. Check for dummy implementations:
   - Ensure that services are not using in-memory storage instead of database

### 5. Type Mismatches

**Symptoms**: 
- Unexpected data in frontend components
- Validation errors when submitting forms
- "Cannot read property of undefined" errors

**Solutions**:
1. Verify DTO mappings:
   - Ensure that backend DTOs match frontend types
   - Check that enum values are consistent between frontend and backend

2. Check serialization/deserialization:
   - Verify that dates are properly formatted (ISO 8601)
   - Ensure that JSON property names match between frontend and backend

3. Update type definitions:
   - If backend API changes, update frontend TypeScript interfaces
   - Run TypeScript compiler to catch type errors

### 6. Performance Issues

**Symptoms**: 
- Slow page loads
- API requests taking too long
- UI freezing during data operations

**Solutions**:
1. Implement pagination:
   - For large data sets, implement server-side pagination
   - Limit the amount of data transferred in each request

2. Add caching:
   - Implement Redis or in-memory caching for frequently accessed data
   - Use HTTP caching headers appropriately

3. Optimize database queries:
   - Add appropriate indexes to database tables
   - Use JOINs instead of multiple queries where appropriate
   - Implement lazy loading for large relationships

4. Implement loading states:
   - Show loading indicators during API requests
   - Use skeleton screens for better perceived performance

### 7. Environment Configuration Issues

**Symptoms**: 
- Different behavior between development and production
- Configuration values not being picked up
- "Variable not found" errors

**Solutions**:
1. Check environment variable files:
   - Verify `.env.local` in frontend contains correct values
   - Check `application.properties` in backend for correct configuration

2. Use consistent naming:
   - Follow naming conventions for environment variables
   - Document required environment variables

3. Restart servers after configuration changes:
   - Environment variables are often only read at startup
   - Restart both frontend and backend after changes

## Debugging Tools

### Backend Debugging
1. Enable debug logging:
   ```properties
   logging.level.com.hatirlat.backend=DEBUG
   ```

2. Use H2 Console for database inspection:
   ```properties
   spring.h2.console.enabled=true
   spring.h2.console.path=/h2-console
   ```

3. Add breakpoints in controllers/services for step-by-step debugging

### Frontend Debugging
1. Use browser developer tools:
   - Network tab to inspect API requests
   - Console tab to see JavaScript errors
   - React DevTools to inspect component state

2. Add console.log statements to trace data flow

3. Use Redux DevTools (if using Redux) to inspect state changes

## Testing Approaches

### Manual Testing
1. Use Postman or curl to test API endpoints directly
2. Test with different user roles and permissions
3. Test edge cases and error conditions

### Automated Testing
1. Run backend unit tests:
   ```bash
   cd backend
   mvn test
   ```

2. Run frontend tests:
   ```bash
   cd frontend
   npm test
   ```

3. Run end-to-end tests with Cypress:
   ```bash
   cd frontend
   npx cypress open
   ```

## Deployment Considerations

1. Ensure production environment variables are properly set
2. Configure SSL/TLS for secure communication
3. Set up proper monitoring and alerting
4. Implement backup strategies for data
5. Configure load balancing for high availability