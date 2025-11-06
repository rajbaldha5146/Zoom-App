let IS_PROD = false; // Set to true for production
const server = IS_PROD
  ? "https://zoom-app-nity.onrender.com"
  : "http://localhost:8000";

export default server;
