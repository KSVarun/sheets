export async function health(fastify) {
  fastify.get("/health", async () => {
    return { message: "Healthy sheets" };
  });
}
