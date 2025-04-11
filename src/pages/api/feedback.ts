

export const prerender = false; // Not needed in 'server' mode
import type { APIRoute } from "astro";
import { db } from "../../db/db.js";


export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const name = data.get("name");
  const email = data.get("email");
  const message = data.get("message");
  // Validate the data - you'll probably want to do more than this
  if (!name || !email || !message) {
    return new Response(
      JSON.stringify({
        message: "Missing required fields",
      }),
      { status: 400 }
    );
  }
  // Do something with the data, then return a success response

  let time = new Date().toISOString();

  await db.hset("antiguo", { name, time });

  console.log(name, email, message);
  return new Response(
    JSON.stringify({
      message: "Success!"
    }),
    { status: 200 }
  );
};
    JSON.stringify({
      message: "Success!"
    }),
    { status: 200 }
  );
};