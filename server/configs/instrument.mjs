import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://52e4ea0726a6491e24b356c788092883@o4511071711199232.ingest.us.sentry.io/4511071717359616",
  sendDefaultPii: true,
});
