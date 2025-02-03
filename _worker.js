export default {
    async fetch(request, env, ctx) {
      return await handleRequest(request, env, ctx);
    }
  };