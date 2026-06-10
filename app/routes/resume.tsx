import React, { useEffect } from 'react'
import { Link, useNavigate, useParams, useLoaderData, redirect } from 'react-router'
import Details from '~/components/feedback/Details'
import Summary from '~/components/feedback/Summary'
import ATS from '~/components/feedback/ATS'
import { usePuterStore } from '~/lib/puter'
import { useAuth } from '~/lib/use-auth';
import { auth } from '~/lib/auth';
import type { LoaderFunctionArgs } from 'react-router';
import { db } from '~/lib/db';
import { resumes } from '~/lib/schema';
import { eq } from 'drizzle-orm';

export const meta = () => {
  return [
	{ title: 'Resume | Review' },
	{ name: 'description', content: 'View and analyze your resume with ATS score and improvement tips.' }
  ]
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return redirect(`/auth?next=/resume/${params.id || ''}`);

  if (!params.id) {
    return new Response('Not Found', { status: 404 });
  }

  const resumeData = await db
    .select()
    .from(resumes)
    .where(eq(resumes.id, params.id))
    .limit(1);

  if (!resumeData.length || resumeData[0].userId !== session.user.id) {
    return new Response('Not Found', { status: 404 });
  }

  const data = resumeData[0];
  if (data.feedback) {
    data.feedback = JSON.parse(data.feedback);
  }

  return data;
};

  const resume = () => {
  const { isLoading: puterLoading, fs } = usePuterStore();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const loaderData = useLoaderData<typeof loader>() as any;
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<Feedback | null>(loaderData.feedback || null);
  const navigate = useNavigate();

  useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			navigate(`/auth?next=/resume/${id}`);
		}
	}, [authLoading, isAuthenticated, id, navigate]);

  useEffect(() => {
		const loadFiles = async () => {
			const resumeBlob = await fs.read(loaderData.resumeFileId);
			if (!resumeBlob) {
				console.error('Resume file not found');
				return;
			}
			const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
			const resumeUrl = URL.createObjectURL(pdfBlob);
			setResumeUrl(resumeUrl);

			const imageBlob = await fs.read(loaderData.imageFileId);
			if (!imageBlob) {
				console.error('Image file not found');
				return;
			}
			const imageUrl = URL.createObjectURL(imageBlob);
			setImageUrl(imageUrl);
		}

		if (isAuthenticated) {
			loadFiles();
		}
	}, [id, isAuthenticated, fs, loaderData])

  return (
	<main className='!pt-0'>
		<nav className='resume-nav'>
			<Link to="/" className='back-button'>
				<img src="/images/back.svg" alt="Back" className='size-2.5' />
				<span className='text-gray-800 text-sm font-semibold'>Back to Homepage</span>
			</Link>
		</nav>
		<div className='flex flex-row w-full max-lg:flex-col-reverse'>
			<section className='feedback-section bg-[url("/images/bg-small.svg")] bg-cover h-[100vh] sticky top-0 items-center justify-center'>
				
					{imageUrl && resumeUrl && (
						<div className='animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-w-xl:hfit w-fit'>
							<a href={resumeUrl} target="_blank" rel="noopener noreferrer" className='w-full h-full flex items-center justify-center'>
								<img src={imageUrl} alt="Resume Preview" className='w-full h-full object-contain rounded-2xl' 
								title='resume'
								/>
							</a>
						</div>
					)}
			</section>
			<section className='feedback-section'>
				<h2 className='text-4xl !text-black font-bold'>Resume Review</h2>
				{feedback ? (
						<div className='flex flex-col gap-8 animate-in fade-in duration-1000'>
							<Summary feedback={feedback}/>
							<ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips} />
							<Details feedback={feedback} />
						</div>
					) : (
						<img src='/images/resume-scan-2.gif' className='w-full'/>
					)
				}
			</section>
		</div>
	</main>
  )
}

export default resume
