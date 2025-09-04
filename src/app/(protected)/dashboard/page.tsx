"use client";

import { api } from "~/trpc/react";

export default function DashboardPage() {
  const {
    data: connections,
    isLoading,
    error,
  } = api.connections.all.useQuery({});

  console.log(connections);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your protected dashboard</p>
        </div>
      </div>
    </div>
  );
}
