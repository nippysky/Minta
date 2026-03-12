import { Redirect } from "expo-router";

import { PATHS } from "@/src/constants/paths";

const isAuthenticated = false;

export default function Index() {
  return <Redirect href={isAuthenticated ? PATHS.home : PATHS.signIn} />;
}