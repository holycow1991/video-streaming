// MongoDB Initialization Script
// This script runs automatically when MongoDB container starts for the first time
// Place this file in the root directory of your project: ./mongo-init.js

// Get environment variables (set in docker-compose.yml)
const dbName = process.env.MONGO_DATABASE;
const appUsername = process.env.MONGO_APP_USERNAME;
const appPassword = process.env.MONGO_APP_PASSWORD;

// Validate that environment variables are set
if (!dbName || !appUsername || !appPassword) {
  print('❌ Error: Required environment variables not set');
  print('Required: MONGO_DATABASE, MONGO_APP_USERNAME, MONGO_APP_PASSWORD');
  quit(1);
}

print('🔧 Starting MongoDB initialization...');
print(`📦 Database: ${dbName}`);
print(`👤 Creating user: ${appUsername}`);

// Switch to the application database
db = db.getSiblingDB(dbName);

// Create application user with read/write permissions
try {
  db.createUser({
    user: appUsername,
    pwd: appPassword,
    roles: [
      {
        role: 'readWrite',
        db: dbName,
      },
      {
        role: 'dbAdmin',
        db: dbName,
      },
    ],
  });
  print(`✅ User '${appUsername}' created successfully`);
} catch (error) {
  print(`❌ Failed to create user: ${error.message}`);
}

// Create initial collections with validation schemas
print('📝 Creating collections...');

// Users collection
try {
  db.createCollection('users', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'email', 'password', 'createdAt'],
        properties: {
          name: {
            bsonType: 'string',
            description: 'User full name - required',
          },
          email: {
            bsonType: 'string',
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
            description: 'Valid email address - required',
          },
          password: {
            bsonType: 'string',
            description: 'Hashed password - required',
          },
          role: {
            enum: ['user', 'admin', 'moderator'],
            description: 'User role',
          },
          status: {
            enum: ['active', 'inactive', 'suspended'],
            description: 'Account status',
          },
          emailVerified: {
            bsonType: 'bool',
            description: 'Email verification status',
          },
          createdAt: {
            bsonType: 'date',
            description: 'Account creation date - required',
          },
          updatedAt: {
            bsonType: 'date',
            description: 'Last update date',
          },
        },
      },
    },
  });
  print('✅ Collection "users" created');
} catch (error) {
  print(`⚠️  Collection "users": ${error.message}`);
}

// Posts collection
try {
  db.createCollection('posts', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['title', 'content', 'authorId', 'createdAt'],
        properties: {
          title: {
            bsonType: 'string',
            minLength: 5,
            maxLength: 255,
            description: 'Post title - required',
          },
          content: {
            bsonType: 'string',
            description: 'Post content - required',
          },
          authorId: {
            bsonType: 'objectId',
            description: 'Reference to user - required',
          },
          status: {
            enum: ['draft', 'published', 'archived'],
            description: 'Post status',
          },
          tags: {
            bsonType: 'array',
            items: {
              bsonType: 'string',
            },
            description: 'Post tags',
          },
          views: {
            bsonType: 'int',
            minimum: 0,
            description: 'View count',
          },
          createdAt: {
            bsonType: 'date',
            description: 'Creation date - required',
          },
        },
      },
    },
  });
  print('✅ Collection "posts" created');
} catch (error) {
  print(`⚠️  Collection "posts": ${error.message}`);
}

// Sessions collection
try {
  db.createCollection('sessions');
  print('✅ Collection "sessions" created');
} catch (error) {
  print(`⚠️  Collection "sessions": ${error.message}`);
}

// Create indexes for performance and constraints
print('📊 Creating indexes...');

// Users indexes
try {
  db.users.createIndex(
    { email: 1 },
    { unique: true, name: 'idx_users_email_unique' },
  );
  db.users.createIndex({ createdAt: 1 }, { name: 'idx_users_created' });
  db.users.createIndex(
    { role: 1, status: 1 },
    { name: 'idx_users_role_status' },
  );
  db.users.createIndex(
    { name: 'text', email: 'text' },
    { name: 'idx_users_text_search' },
  );
  print('✅ Users indexes created');
} catch (error) {
  print(`⚠️  Users indexes: ${error.message}`);
}

// Posts indexes
try {
  db.posts.createIndex({ authorId: 1 }, { name: 'idx_posts_author' });
  db.posts.createIndex(
    { status: 1, createdAt: -1 },
    { name: 'idx_posts_status_created' },
  );
  db.posts.createIndex({ tags: 1 }, { name: 'idx_posts_tags' });
  db.posts.createIndex(
    { title: 'text', content: 'text' },
    { name: 'idx_posts_text_search' },
  );
  print('✅ Posts indexes created');
} catch (error) {
  print(`⚠️  Posts indexes: ${error.message}`);
}

// Sessions indexes with TTL (auto-expire)
try {
  db.sessions.createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0, name: 'idx_sessions_ttl' },
  );
  db.sessions.createIndex({ userId: 1 }, { name: 'idx_sessions_user' });
  print('✅ Sessions indexes created (with TTL)');
} catch (error) {
  print(`⚠️  Sessions indexes: ${error.message}`);
}

// Insert sample admin user (optional - for development)
// Remove or comment out in production
try {
  const adminExists = db.users.findOne({ email: 'admin@example.com' });

  if (!adminExists) {
    db.users.insertOne({
      name: 'Admin User',
      email: 'admin@example.com',
      // Password: "admin123" (hashed with bcrypt)
      // CHANGE THIS IN PRODUCTION!
      password: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'admin',
      status: 'active',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    print('✅ Sample admin user created');
    print('   Email: admin@example.com');
    print('   Password: admin123');
    print('   ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!');
  }
} catch (error) {
  print(`⚠️  Sample user: ${error.message}`);
}

// Create some sample posts (optional - for development)
try {
  const postsCount = db.posts.countDocuments();

  if (postsCount === 0) {
    const adminUser = db.users.findOne({ email: 'admin@example.com' });

    if (adminUser) {
      db.posts.insertMany([
        {
          title: 'Welcome to Our Blog',
          content:
            'This is the first post on our blog. Stay tuned for more content!',
          authorId: adminUser._id,
          status: 'published',
          tags: ['welcome', 'introduction'],
          views: NumberInt(0),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Getting Started with MongoDB',
          content:
            'MongoDB is a powerful NoSQL database that stores data in flexible, JSON-like documents.',
          authorId: adminUser._id,
          status: 'published',
          tags: ['mongodb', 'database', 'tutorial'],
          views: NumberInt(0),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      print('✅ Sample posts created');
    }
  }
} catch (error) {
  print(`⚠️  Sample posts: ${error.message}`);
}

// Print database statistics
print('\n📈 Database Statistics:');
try {
  const stats = db.stats();
  print(`   Database: ${stats.db}`);
  print(`   Collections: ${stats.collections}`);
  print(`   Indexes: ${stats.indexes}`);
  print(`   Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
} catch (error) {
  print(`⚠️  Could not get stats: ${error.message}`);
}

print('\n🎉 MongoDB initialization completed successfully!');
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
print(`✅ Database: ${dbName}`);
print(`✅ Application User: ${appUsername}`);
print('✅ Collections: users, posts, sessions');
print('✅ Indexes created for optimal performance');
print('✅ Ready for development!');
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
