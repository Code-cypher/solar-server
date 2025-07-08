# Solar Blog Server

A Node.js/Express REST API server for the Solar Blog application.

## Features

- **Blog Management**: Create, read, update, delete blog posts
- **User Authentication**: JWT-based authentication system
- **Newsletter System**: Email subscription management
- **Category Filtering**: Organize posts by categories
- **Search Functionality**: Full-text search across blog content
- **Comment System**: User comments on blog posts
- **Admin Panel**: Admin controls for content management

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up MongoDB**:
   - Install MongoDB locally or use MongoDB Atlas
   - Update the `MONGODB_URI` in `.env` file

3. **Configure environment variables**:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/solar-blog
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Start the server**:
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Blog Posts
- `GET /api/blog` - Get all blog posts (with filtering and pagination)
- `GET /api/blog/:slug` - Get single blog post by slug
- `GET /api/blog/categories/list` - Get categories with post counts
- `POST /api/blog` - Create new blog post (auth required)
- `PUT /api/blog/:id` - Update blog post (auth required)
- `DELETE /api/blog/:id` - Delete blog post (admin only)
- `POST /api/blog/:id/like` - Like a blog post
- `POST /api/blog/:id/comments` - Add comment to blog post

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info (auth required)
- `PUT /api/auth/profile` - Update user profile (auth required)
- `PUT /api/auth/change-password` - Change password (auth required)

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe from newsletter
- `PUT /api/newsletter/preferences` - Update newsletter preferences
- `GET /api/newsletter/stats` - Get newsletter statistics (admin only)

### Utility
- `GET /api/health` - Health check endpoint

## Query Parameters

### Blog Posts (`GET /api/blog`)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 50)
- `category` - Filter by category
- `featured` - Filter featured posts (true/false)
- `search` - Full-text search

## Authentication

Include JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## User Roles

- **user** - Can comment on posts, manage own profile
- **author** - Can create and edit blog posts
- **admin** - Full access to all features

## Data Models

### BlogPost
- title, excerpt, content
- category, author, slug
- featured, published status
- views, likes, comments
- SEO metadata

### User
- username, email, password
- role, profile information
- preferences, activity tracking

### Newsletter
- email, subscription status
- preferences (frequency, categories)
- unsubscribe token

## Development

1. **Seed Data**: Sample blog posts are automatically created in development mode
2. **MongoDB**: Ensure MongoDB is running locally or configure Atlas connection
3. **Environment**: Use development environment variables
4. **Testing**: Use tools like Postman or Insomnia to test API endpoints

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure proper CORS origins
4. Set up MongoDB Atlas or production database
5. Use PM2 or similar process manager
6. Enable HTTPS
7. Set up proper logging and monitoring

## Security Features

- Helmet for security headers
- CORS configuration
- Rate limiting
- Input validation and sanitization
- Password hashing with bcrypt
- JWT token authentication
- Role-based access control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
