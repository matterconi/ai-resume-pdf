import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { formatFileSize } from '~/lib/formatFileSize';

interface FileUploaderProps {
	onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const onDrop = useCallback((acceptedFiles: File[]) => {
		const file = acceptedFiles[0] || null;
		setSelectedFile(file);
		onFileSelect?.(file);
	}, [onFileSelect])

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		multiple: false,
		accept: {
			'text/plain': ['.txt', '.csv'],
			'application/pdf': ['.pdf'],
			'image/*': []
		},
		maxFiles: 1,
		maxSize: 20 * 1024 * 1024 // 20 MB
	})

	const removeFile = useCallback((e: React.MouseEvent) => {
		console.log('remove file')
		e.stopPropagation();
		setSelectedFile(null);
		onFileSelect?.(null);
	}, [onFileSelect]);

	return (
		<div className='w-full gradient-border'>
			<div {...getRootProps()}>
				<input {...getInputProps()} />
				<div className='space-y-4 cursor-pointer'>
					{selectedFile ? (
						<div className='uploader-selected-file' onClick={(e) => e.stopPropagation()}>
							<img src="/images/pdf.png" alt="pdf" className='size-10'/>
							<div className='flex items-center space-x-3'>
								<div>
									<p className='text-sm font-medium text-gray-700 truncate max-w-xs'>
										{selectedFile.name}
									</p>
									<p className='text-sm text-gray-500'>
										{formatFileSize(selectedFile.size)}
									</p>
								</div>
							</div>
							<button
								onClick={removeFile}
								className='ml-auto p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer'
								title="Remove file"
								type='button'
							>
								<svg className='w-5 h-5 text-gray-500 hover:text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
								</svg>
							</button>
						</div>
					) : (
						<div>
							<div className='mx-auto w-16 h-16 flex items-center justify-center'>
								<img src="/icons/info.svg" alt="upload" className='size-20'/>
							</div>
							<p className='text-lg text-gray-500'>
								<span className='font-semibold'>Click to upload</span>
								, or drag and drop a file here
							</p>
							<p className='text-lg text-gray-500'>PDF (max 20 MB)</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default FileUploader