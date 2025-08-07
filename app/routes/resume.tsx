import React, { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import ATS from '~/components/ATS'
import Details from '~/components/Details'
import Summary from '~/components/Summary'
import { usePuterStore } from '~/lib/puter'

export const meta = () => {
  return [
	{ title: 'Resume | Review' },
	{ name: 'description', content: 'View and analyze your resume with ATS score and improvement tips.' }
  ]
}

const resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams<{ id: string }>();
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<Feedback | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
		if (!isLoading && !auth.isAuthenticated) {
			// Redirect to home if already authenticated
			navigate(`/auth?next=/resume/${id}`);
		}
	}, [isLoading]);

  useEffect(() => {
		const loadResume = async () => {
			const resumeData = await kv.get(`resume:${id}`);

			if (!resumeData) {
				console.error('Resume data not found');
				return;
			}
			const parsedData = JSON.parse(resumeData);

			const resumeBlob = await fs.read(parsedData.resumePath);
			if (!resumeBlob) {
				console.error('Resume file not found');
				return;
			}
			const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
			const resumeUrl = URL.createObjectURL(pdfBlob);
			setResumeUrl(resumeUrl);

			const imageBlob = await fs.read(parsedData.imageFile);
			if (!imageBlob) {
				console.error('Image file not found');
				return;
			}
			const imageUrl = URL.createObjectURL(imageBlob);
			setImageUrl(imageUrl);

			setFeedback(parsedData.feedback || null);
		}

		loadResume();
	}, [id])

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
							<Details feedback={feedback.details} />
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