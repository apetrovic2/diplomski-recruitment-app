import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Recruitment App API",
      version: "1.0.0",
      description: "API dokumentacija za diplomski rad — platforma za prijavu na posao",
    },
    servers: [{ url: "http://localhost:5000" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/infrastructure/web/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);