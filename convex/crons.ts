import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Nettoyer sessions PIN expirées toutes les heures
crons.hourly(
  "cleanup expired PIN sessions",
  { minuteOfHour: 30 },
  internal.pinAuth.nettoyerSessions
);

export default crons;
