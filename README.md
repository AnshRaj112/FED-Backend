# FED-Backend

FED-Backend is the backend service for the FED-Frontend project. This project is built using Node.js with Express framework and leverages MongoDB as its database through Prisma. It also includes a custom error handling mechanism.

## Table of Contents
- [Technology Stack](#technology-stack)
- [Acknowledgements](#acknowledgements)
- [Contact](#contact)

## Technology Stack
- **Node.js** with **Express** for building the server-side application.
- **MongoDB** with **Prisma** as the ORM to manage database operations.
- Custom error handling using `next(new ApiError(errorCode, 'message'))`.


## Custom error handling

We are using custom error for the project that is:
```javascript
app.get('/example', (req, res, next) => {
    try {
        // Your logic here
    } catch (error) {
        next(new ApiError(500, 'Internal Server Error'));
    }
});

### Acknowledgements

Acknowledgements and credits go here.

---

Feel free to reach out for any inquiries or assistance regarding Fed-Backend. Happy coding and entrepreneurship!