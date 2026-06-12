/* eslint-disable import/order */
"use server";

import { createClient } from "@supabase/supabase-js";
import { actionClient } from "./safe-action";
import { formSchema } from "@/lib/form-schema";

export const serverAction = actionClient
  .inputSchema(formSchema)
  .action(async ({ parsedInput }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from("contact_submissions").insert({
      name: parsedInput.name,
      email: parsedInput.email,
      company: parsedInput.company ?? null,
      goals: parsedInput.employees ?? null,
      message: parsedInput.message,
      pipeline_status: "new",
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return { success: false, message: "Failed to submit form. Please try again." };
    }

    return { success: true, message: "Form submitted successfully" };
  });
