import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import { resumes } from "../../constants";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart Feedback for your dream job!" },
  ];
}

export default function Home() {

  const { isLoading, auth } = usePuterStore();

  const navigate = useNavigate();

  useEffect(() => {
		if (!auth.isAuthenticated) {
			// Redirect to home if already authenticated
      navigate("/auth?next=/");
		}
	}, [auth.isAuthenticated]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover bg-center bg-no-repeat min-h-screen">

      <Navbar />      
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          <h2>Review your submissions and check AI-powered feedback</h2>
        </div>

        {resumes.length > 0 && (
          resumes.map((resume: Resume) => (
            <div className="resumes-section">
              <ResumeCard key={resume.id} resume={resume}/>
            </div>
          ))
        )}

      </section>
    </main>
  );
}
