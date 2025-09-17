export default {
  "client/**/*.{ts,tsx,js,jsx}": [
    "npm --prefix backend run lint"
  ],
  "src/**/*.spec.ts": [  // <- Agrega esta sección para tests
    "jest --bail --passWithNoTests"
  ]
};