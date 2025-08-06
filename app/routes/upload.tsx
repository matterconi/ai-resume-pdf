import React, { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router';
import FileUploader from '~/components/FileUploader';
import Navbar from '~/components/Navbar'
import { convertPdfToImage } from '~/lib/pdf2img';
import { usePuterStore } from '~/lib/puter';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions, AIResponseFormat } from '../../constants';

const upload = () => {
	const [isProcessing, setIsProcessing] = useState(false);
	const [statusMessage, setStatusMessage] = useState('');
	const [file, setFile] = useState<File | null>(null);
	const navigate = useNavigate();
	const { auth, isLoading, fs, ai, kv } = usePuterStore()

	const handleFileSelect = (file: File | null) => {
		setFile(file);
	}

	const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: {
		companyName: string, jobTitle:  string, jobDescription: string, file: File
	}) => {
		console.log(file)
		setIsProcessing(true);
		setStatusMessage('Uploading the file...');
		const uploadedFile = await fs.upload([file])
		if (!uploadedFile) return setStatusMessage('Error: failed to upload the file');

		console.log('Uploaded file:', uploadedFile);
		setStatusMessage('Converting to image...');
		const imageFile = await convertPdfToImage(file);
		if (!imageFile.file) return setStatusMessage('Error: Failed to convert PDF to image')

		setStatusMessage('Uploading the image...');
		const uploadedImage = await fs.upload([imageFile.file]);
		if (!uploadedImage) return setStatusMessage('Error: Failed to upload image');

		setStatusMessage('Preparing data...');
		const uuid = generateUUID();
		const data = {
			id: uuid,
			resumePath: uploadedFile.path,
			imageFile: uploadedImage.path,
			companyName,  jobTitle, jobDescription,
			feedback: ''
		}
		await kv.set(`resume:${uuid}`, JSON.stringify(data));

		setStatusMessage('Analyzing...');
		const feedback = await ai.feedback(
			uploadedFile.path,
			prepareInstructions({
				jobTitle,
				jobDescription,
				AIResponseFormat
			})
		);

		if (!feedback) {
			setIsProcessing(false);
			return setStatusMessage('Error: Failed to analyze the resume');
		}

		const feedbackText = typeof feedback.message.content === 'string' ? feedback.message.content : feedback.message.content[0].text;

		console.log('Feedback received:', feedbackText);
		if (!feedbackText) {
			setIsProcessing(false);
			return setStatusMessage('Error: No feedback received');
		}
		setStatusMessage('Saving feedback...');

		data.feedback = JSON.parse(feedbackText);
		await kv.set(`resume:${uuid}`, JSON.stringify(data));
		setStatusMessage('Analysis complete!');
		setIsProcessing(false);
		
		console.log('Feedback data:', data);
	}

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget.closest('form');
		if (!form) return;
		const formData = new FormData(form);

		const companyName = formData.get('company-name') as string;
		const jobTitle = formData.get('job-title') as string;
		const jobDescription = formData.get('job-description') as string;
		const resumeFile = file;

		if (!resumeFile) {
			return;
		}

		handleAnalyze({ companyName, jobTitle, jobDescription, file })
	}
  return (
	<main className="bg-[url('/images/bg-main.svg')] bg-cover">

      <Navbar />      
      <section className="main-section">
		<div className='page-heading py-16'>
			<h1>Smart feedback for your dream job</h1>
			{isProcessing ? (
				<>
					<h2 className='animate-pulse'>{statusMessage}</h2>
					<img src="/images/resume-scan.gif" alt="Loading..." className='w-full' />
				</>
			) : (
				<h2>Drop your resume for an ATS score and improvement tips</h2>
			)}
			{!isProcessing && (
				<form id="upload-form" onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>
					<div className='form-div'>
						<label htmlFor="company-name">Company Name</label>
						<input type="text" id="company-name" name="company-name" placeholder='Company Name' required />
					</div>
					<div className='form-div'>
						<label htmlFor="job-title">Job Title</label>
						<input type="text" id="job-title" name="job-title" placeholder='Job Title' required />
					</div>
					<div className='form-div'>
						<label htmlFor="job-description">Job Description</label>
						<textarea id="job-description" name="job-description" placeholder='Job Description' required rows={5}></textarea>
					</div>
					<div className='form-div'>
						<label htmlFor="uploader">Upload Resume</label>
						<FileUploader onFileSelect={handleFileSelect}/>
					</div>

					<button className='primary-button' type="submit">
						Analyze Resume
					</button>
				</form>
			)}
		</div>
	  </section>
	</main>
  )
}

export default upload