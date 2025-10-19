# 🛒 Product Management API

A RESTful Express.js API for managing products with full CRUD operations, authentication, filtering, search, and pagination.

---

##  How to Run the Server

### Prerequisites
- Node.js v18 or higher
- npm (comes with Node.js)

### Setup Steps
1. **Clone or download** this repository
2. **Install dependencies**:
   ```bash
   npm install

### Set up your environment:
bash
cp .env.example .env

You may customize the API_KEY in .env if desired. The default key is mysecretapikey. 

### Start the server:
bash
node server.js

The API will be available at http://localhost:3000 .
   ## Example Requests
### Get all products (with pagination and filtering)
bash
curl "http://localhost:3000/api/products?category=electronics&search=laptop&page=1&limit=5"

### Create a new product
bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "x-api-key: mysecretapikey" \
  -d '{
    "name": "Wireless Mouse",
    "description": "Ergonomic design with long battery life",
    "price": 29.99,
    "category": "electronics",
    "inStock": true
  }'


### Get product statistics
bash
curl http://localhost:3000/api/products/stats

Sample Response:

json
{
  "electronics": 3,
  "kitchen": 1
}


 ### Product Schema
Each product object includes:

id (string, UUID) – unique identifier
name (string) – required
description (string) – optional
price (number) – required, must be > 0
category (string) – required
inStock (boolean) – optional (defaults to true)

 ### Authentication
All write operations (POST, PUT, DELETE) require the following header:

http
x-api-key: mysecretapikey
Requests without a valid key will receive a 401 Unauthorized response.

 ### Error Handling
The API returns appropriate HTTP status codes:

400 Bad Request – Invalid input data
401 Unauthorized – Missing or invalid API key
404 Not Found – Product or route not found
500 Internal Server Error – Unexpected server issue