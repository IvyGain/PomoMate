import honoApp from "@/backend/hono";

export const config = {
  runtime: 'edge',
};

export default honoApp.fetch;
