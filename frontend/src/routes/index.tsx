import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return <h1>Početna stranica — lista oglasa dolazi ovdje</h1>;
}