# Video streaming app

### 1. Database

##### How to start ?

```
# Start only MongoDB
docker-compose up -d mongodb

# Start with MongoDB Express (admin UI)
docker-compose --profile admin up -d

# View logs to confirm initialization
docker-compose logs -f mongodb
```

##### Connect to MongoDB Shell

```
docker exec -it mongodb mongosh -u admin -p admin --authenticationDatabase admin
```

##### MongoDB Express

```
# Start with admin profile
docker-compose --profile admin up -d

# Open in browser
open http://localhost:8081

# Login credentials (from .env):
# Username: admin (MONGO_EXPRESS_USERNAME)
# Password: your_secure_express_password_here (MONGO_EXPRESS_PASSWORD)
```
