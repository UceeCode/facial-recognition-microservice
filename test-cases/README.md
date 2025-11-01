# Face Recognition API Test & Validation Documentaion

This repository contains a containerized Node.js API service for face recognition (detection, encoding, and comparison) powered by TensorFlow and `face-api.js`, along with a comprehensive test suite to validate its accuracy and robustness.

## 🚀 Quick Start

To run the service and execute the entire test suite, follow these steps:

1. **Build and Start the API Service (Docker)**
        ```bash
        docker-compose up --build
        ```
        *(Wait for the `face-recognition-service` container to start and log the "Server running" message.)*

2. **Run Tests (Host Machine)**
        ```bash
        npm run test
        ```
        The tests will automatically run against the API at `http://localhost:3000` and display the results summary.
