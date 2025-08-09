import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import ScoreCircle from './ScoreCircle'
import { usePuterStore } from '~/lib/puter'

const ResumeCard = ({ resume }: { resume: Resume }) => {
  const { id, companyName, jobTitle, feedback, resumePath } = resume;
  const imageFile = (resume as any).imageFile; // Usa imageFile invece di imagePath
  
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { fs } = usePuterStore();

  useEffect(() => {
    if (!imageFile) {
      setLoading(false);
      return;
    }

    const loadResume = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const blob = await fs.read(imageFile);
        
        if (!blob || blob.size === 0) {
          setError('Anteprima non disponibile');
          return;
        }

        const url = URL.createObjectURL(blob);
        setResumeUrl(url);
        
      } catch (err) {
        setError('Errore nel caricamento');
      } finally {
        setLoading(false);
      }
    };

    loadResume();

    return () => {
      if (resumeUrl) {
        URL.revokeObjectURL(resumeUrl);
      }
    };
  }, [fs, imageFile, id]);

  return (
    <Link to={`/resume/${id}`} className='resume-card animate-in fade-in duration-1000'>
      <div className='resume-card-header'>
        <div className='flex flex-col gap-2'>
          {companyName && <h2 className='!text-black font-bold break-words'>
            {companyName}
          </h2>}
          {jobTitle && <h3 className='text-lg break-words text-gray-500'>
            {jobTitle}
          </h3>}
          {!companyName && !jobTitle && <h2 className='!text-black font-bold'>
            Resume
          </h2>}
        </div>
        <div className='flex-shrink-0'>
          <ScoreCircle score={feedback?.overallScore || 0}/>
        </div>
      </div>
      
      {loading && (
        <div className='gradient-border animate-in fade-in duration-1000'>
          <div className='w-full h-[350px] max-sm:h-[200px] flex items-center justify-center bg-gray-100'>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      )}
      
      {(!imageFile || error) && !loading && (
        <div className='gradient-border animate-in fade-in duration-1000'>
          <div className='w-full h-[350px] max-sm:h-[200px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100'>
            <div className="text-center text-gray-500">
              <svg 
                className="w-16 h-16 mx-auto mb-4 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              <p className="text-sm font-medium">Anteprima documento</p>
              <p className="text-xs mt-1">
                {!imageFile ? 'Anteprima non disponibile' : error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {resumeUrl && !loading && !error && (
        <div className='gradient-border animate-in fade-in duration-1000'>
          <div className='w-full h-full'>
            <img  
              src={resumeUrl} 
              alt="resume preview" 
              className='w-full h-[350px] max-sm:h-[200px] object-cover object-top'
              onError={() => setError('Errore nel rendering')}
            />
          </div>
        </div>
      )}
    </Link>
  )
}

export default ResumeCard