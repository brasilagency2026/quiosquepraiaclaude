import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "cleanup expired PIN sessions",
  { hours: 1 },
  internal.pinAuth.nettoyerSessions
);

export default crons;