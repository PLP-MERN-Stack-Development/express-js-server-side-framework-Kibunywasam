// server.js - Completed Express server for Week 2 assignment

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Simulate environment variable for API key 
const API_KEY = process.env.API_KEY || 'mysecretapikey';

// Middleware setup
app.use(bodyParser.json());

// CUSTOM MIDDLEWARE

// 1. Logger Middleware
const logger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};

// 2. Authentication Middleware
const authenticate = (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
  }
  next();
};

// 3. Validation Middleware (for POST/PUT)
const validateProduct = (req, res, next) => {
  const { name, price, category } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
  }
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }
  if (!category || typeof category !== 'string' || category.trim() === '') {
    return res.status(400).json({ error: 'Category is required and must be a non-empty string' });
  }

  // fields validation
  if ('description' in req.body && typeof req.body.description !== 'string') {
    return res.status(400).json({ error: 'Description must be a string' });
  }
  if ('inStock' in req.body && typeof req.body.inStock !== 'boolean') {
    return res.status(400).json({ error: 'inStock must be a boolean' });
  }

  next();
};

// Apply logger globally
app.use(logger);

// END MIDDLEWARE

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// Helper function to find product by ID
const findProductIndex = (id) => products.findIndex(p => p.id === id);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// RESTful ROUTES

// GET /api/products - List all products (with filtering, search, pagination)
app.get('/api/products', (req, res) => {
  let result = [...products];

  // Filtering by category
  if (req.query.category) {
    result = result.filter(p => 
      p.category.toLowerCase() === req.query.category.toLowerCase()
    );
  }

  // Search by name
  if (req.query.search) {
    const term = req.query.search.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(term));
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100); // max 100 per page
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = result.slice(startIndex, endIndex);

  res.json({
    products: paginatedProducts,
    total: result.length,
    page,
    totalPages: Math.ceil(result.length / limit)
  });
});

// GET /api/products/stats - Product statistics
app.get('/api/products/stats', (req, res) => {
  const stats = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});
  res.json(stats);
});

// GET /api/products/:id - Get a specific product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// POST /api/products - Create a new product
app.post('/api/products', authenticate, validateProduct, (req, res) => {
  const newProduct = {
    id: uuidv4(),
    name: req.body.name.trim(),
    description: typeof req.body.description === 'string' ? req.body.description.trim() : '',
    price: req.body.price,
    category: req.body.category.trim().toLowerCase(),
    inStock: typeof req.body.inStock === 'boolean' ? req.body.inStock : true
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id - Update an existing product
app.put('/api/products/:id', authenticate, validateProduct, (req, res) => {
  const index = findProductIndex(req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updatedProduct = {
    ...products[index],
    name: req.body.name.trim(),
    description: typeof req.body.description === 'string' ? req.body.description.trim() : products[index].description,
    price: req.body.price,
    category: req.body.category.trim().toLowerCase(),
    inStock: typeof req.body.inStock === 'boolean' ? req.body.inStock : products[index].inStock
  };

  products[index] = updatedProduct;
  res.json(updatedProduct);
});

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', authenticate, (req, res) => {
  const index = findProductIndex(req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products.splice(index, 1);
  res.status(204).send(); // No content
});

// END ROUTES 

// GLOBAL ERROR HANDLING 
// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Generic error handler (for unexpected errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
//  END ERROR HANDLING

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Use API key in header: x-api-key: ${API_KEY}`);
});

// Export the app for testing purposes
module.exports = app;