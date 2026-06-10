import type { ActionFunctionArgs } from "react-router";
import { auth } from "~/lib/auth";

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const body = await request.json();
  const { resumeText, jobTitle, jobDescription, companyName } = body;

  const prompt = `You are an expert in ATS (Applicant Tracking System) and resume analysis.
Please analyze and rate this resume and suggest how to improve it.
The rating can be low if the resume is bad.
Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
If available, use the job description for the job user is applying to to give more detailed feedback.
If provided, take the job description into consideration.
The job title is: ${jobTitle}
The job description is: ${jobDescription}
The company is: ${companyName}

Here is the resume text:
---
${resumeText}
---

Provide the feedback using the following format:
interface Feedback {
  overallScore: number; // max 100
  ATS: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; }[];
  };
  toneAndStyle: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string; }[];
  };
  content: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string; }[];
  };
  structure: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string; }[];
  };
  skills: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string; }[];
  };
}
Return the analysis as a JSON object, without any other text and without the backticks.
Do not include any other text or comments.`;

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are an expert ATS and resume analyzer." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return new Response(`DeepSeek error: ${err}`, { status: 502 });
  }

  const data = await response.json();
  const feedbackText = data.choices?.[0]?.message?.content;
  if (!feedbackText) {
    return new Response("No feedback from AI", { status: 502 });
  }

  return { feedback: feedbackText };
};
