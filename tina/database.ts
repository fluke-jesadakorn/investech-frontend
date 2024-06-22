import { createDatabase, createLocalDatabase } from "@tinacms/datalayer";
import { GitHubProvider } from "tinacms-gitprovider-github";
import { MongodbLevel } from "mongodb-level";

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL || "true";

export default isLocal
  ? createLocalDatabase()
  : createDatabase({
      gitProvider: new GitHubProvider({
        branch,
        owner: process.env.GITHUB_OWNER as string,
        repo: process.env.GITHUB_REPO as string,
        token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN as string,
      }),
      databaseAdapter: new MongodbLevel({
        collectionName: "tinacms",
        dbName: "tinacms",
        mongoUri: process.env.MONGO_URI as string,
      }),
      namespace: branch,
    });
