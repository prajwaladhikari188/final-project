export function getLoginErrorMessage(status, payload) {
  if (status === 404) {
    return "Sign-in service is not configured for this site. Start the API and configure the XAMPP proxy.";
  }

  if (status === 401) {
    return payload?.error || "Invalid email or password.";
  }

  if (status === 502) {
    return "Sign-in API is not running. Start MariaDB and run `npm run api`.";
  }

  if (status === 503) {
    return "Sign-in API cannot reach MariaDB. Check the database settings and start MariaDB.";
  }

  if (status >= 500) {
    return "Sign-in service failed. Check the API terminal and database configuration.";
  }

  return payload?.error || "Sign-in failed. Please try again.";
}

export function getLoginConnectionError(error) {
  if (error instanceof TypeError) {
    return "Cannot connect to the sign-in service. Start the API server and check the connection.";
  }

  return error?.message || "Sign-in failed. Please try again.";
}
