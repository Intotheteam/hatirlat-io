# Hatirlat.io Backend

This is the backend API for the Hatirlat.io reminder application, built with Spring Boot.

## Technologies Used

- Java 17
- Spring Boot 3.3.4
- Spring Security with JWT Authentication
- Spring Data JPA
- H2 Database (for development)
- PostgreSQL (for production)
- Maven for dependency management

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.8 or higher

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Build the project:
   ```bash
   mvn clean install
   ```
4. Run the application:
   ```bash
   mvn spring-boot:run
   ```

### Alternative: Running with JAR file

1. Build the JAR file:
   ```bash
   mvn clean package
   ```
2. Run the JAR file:
   ```bash
   java -jar target/backend-0.0.1-SNAPSHOT.jar
   ```

## API Endpoints

The backend API is documented using OpenAPI/Swagger. Once the application is running, you can access the documentation at:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user info

### Reminder Endpoints

- `GET /api/reminders` - Get all reminders
- `GET /api/reminders/{id}` - Get reminder by ID
- `POST /api/reminders` - Create new reminder
- `PUT /api/reminders/{id}` - Update reminder
- `PUT /api/reminders/{id}/status` - Update reminder status
- `DELETE /api/reminders/{id}` - Delete reminder

### Group Endpoints

- `GET /api/groups` - Get all groups
- `GET /api/groups/{id}` - Get group by ID
- `POST /api/groups` - Create new group
- `PUT /api/groups/{id}` - Update group
- `DELETE /api/groups/{id}` - Delete group

### Member Endpoints

- `GET /api/groups/{groupId}/members` - Get group members
- `POST /api/groups/{groupId}/members` - Add member to group
- `PUT /api/groups/{groupId}/members/{memberId}` - Update member
- `DELETE /api/groups/{groupId}/members/{memberId}` - Remove member from group

### Contact Endpoints

- `GET /api/contacts` - Get all contacts
- `GET /api/contacts/{id}` - Get contact by ID
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/{id}` - Update contact
- `DELETE /api/contacts/{id}` - Delete contact

## Configuration

The application can be configured using environment variables or by modifying `src/main/resources/application.properties`:

### Database Configuration

For development, the application uses an in-memory H2 database. For production, you can configure PostgreSQL:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hatirlat
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### JWT Configuration

```properties
application.security.jwt.secret-key=your_secret_key_here
application.security.jwt.expiration=86400000
```

### CORS Configuration

```properties
cors.allowed-origins=http://localhost:3000
```

## Testing

Run the tests with Maven:

```bash
mvn test
```

## Building for Production

To build a production-ready JAR file:

```bash
mvn clean package -DskipTests
```

The JAR file will be located in the `target` directory.

## API Documentation

Detailed API documentation can be found in [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.