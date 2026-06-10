import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "~/lib/use-auth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart Feedback for your dream job!" },
  ];
}

export default function Home() {
  const { isLoading: puterLoading } = usePuterStore();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth?next=/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchResumes = async () => {
      setLoadingResumes(true);
      
      try {
        const res = await fetch('/api/resumes', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch resumes');
        const resumesData = await res.json();
        const parsedResumes = resumesData?.map((resume: any) => ({
          ...resume,
          feedback: resume.feedback ? JSON.parse(resume.feedback) : null,
        })) as Resume[];
        setResumes(parsedResumes || []);
      } catch (error) {
        console.error("Errore nel caricamento dei resume:", error);
        setResumes([]);
      } finally {
        setLoadingResumes(false);
      }
    };

    if (isAuthenticated) {
      fetchResumes();
    }
  }, [puterLoading, isAuthenticated]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover bg-center bg-no-repeat min-h-screen">
      <Navbar />
      
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          {!loadingResumes && resumes.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback</h2>
          )}
        </div>

        {loadingResumes && (
          <div>
            <img src="/images/resume-scan-2.gif" alt="Loading..." className="w-[200px]"/>
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume: Resume) => (
              <ResumeCard key={resume.id} resume={resume}/>
            ))}
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && resumes.length < 3 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link to="/upload" className="btn primary-button w-fit text-xl font-semibold">
              Upload New Resume
            </Link>
          </div>
        )}

        {!loadingResumes && resumes.length >= 3 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <p className="text-amber-600 font-semibold text-lg">
              You have reached the limit of 3 reviews.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
