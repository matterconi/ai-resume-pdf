export interface PdfConversionResult {
	imageUrl: string;
	file: File | null;
	error?: string;
  }

  export async function extractTextFromPdf(file: File | Blob): Promise<string> {
	const lib = await loadPdfJs();
	const arrayBuffer = await file.arrayBuffer();
	const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
	let text = "";
	for (let i = 1; i <= pdf.numPages; i++) {
	  const page = await pdf.getPage(i);
	  const content = await page.getTextContent();
	  text += content.items.map((item: any) => item.str).join(" ") + "\n";
	}
	return text;
  }
  
  let pdfjsLib: any = null;
  let isLoading = false;
  let loadPromise: Promise<any> | null = null;
  
  async function loadPdfJs(): Promise<any> {
	console.log('🔄 loadPdfJs called');
	
	if (pdfjsLib) {
	  console.log('✅ pdfjsLib already loaded, returning existing instance');
	  return pdfjsLib;
	}
	
	if (loadPromise) {
	  console.log('⏳ loadPromise exists, waiting for it');
	  return loadPromise;
	}
  
	console.log('📦 Starting to load PDF.js from CDN');
	isLoading = true;
	
	try {
	  loadPromise = new Promise(async (resolve, reject) => {
		try {
		  // Load PDF.js from CDN instead of npm package
		  const script = document.createElement('script');
		  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
		  
		  script.onload = () => {
			console.log('✅ PDF.js script loaded from CDN');
			
			// Access the global pdfjsLib
			const lib = (window as any).pdfjsLib;
			
			if (lib) {
			  console.log('✅ pdfjsLib found on window');
			  console.log('🔧 Setting worker source to matching CDN version');
			  
			  // Set worker from same CDN version
			  lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
			  
			  pdfjsLib = lib;
			  isLoading = false;
			  
			  console.log('✅ pdfjsLib configured and ready');
			  resolve(lib);
			} else {
			  reject(new Error('pdfjsLib not found on window after script load'));
			}
		  };
		  
		  script.onerror = (error) => {
			console.error('❌ Failed to load PDF.js script:', error);
			reject(new Error('Failed to load PDF.js script from CDN'));
		  };
		  
		  document.head.appendChild(script);
		} catch (error) {
		  reject(error);
		}
	  });
  
	  const result = await loadPromise;
	  console.log('✅ loadPdfJs completed successfully');
	  return result;
	} catch (error) {
	  console.error('❌ Error loading PDF.js:', error);
	  isLoading = false;
	  loadPromise = null;
	  throw error;
	}
  }
  
  export async function convertPdfToImage(
	file: File
  ): Promise<PdfConversionResult> {
	console.log('🚀 Starting PDF conversion');
	console.log('📄 File details:', {
	  name: file.name,
	  size: file.size,
	  type: file.type,
	  lastModified: file.lastModified
	});
  
	try {
	  // Step 1: Load PDF.js library
	  console.log('⏳ Loading PDF.js library...');
	  const lib = await loadPdfJs();
	  console.log('✅ PDF.js library loaded successfully');
  
	  // Step 2: Convert file to ArrayBuffer
	  console.log('⏳ Converting file to ArrayBuffer...');
	  const arrayBuffer = await file.arrayBuffer();
	  console.log('✅ ArrayBuffer created, size:', arrayBuffer.byteLength);
  
	  if (arrayBuffer.byteLength === 0) {
		throw new Error('File is empty or could not be read');
	  }
  
	  // Step 3: Load PDF document
	  console.log('⏳ Loading PDF document...');
	  const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
	  console.log('✅ PDF document loaded successfully');
	  console.log('📊 PDF info:', {
		numPages: pdf.numPages,
		fingerprints: pdf.fingerprints
	  });
  
	  // Step 4: Get first page
	  console.log('⏳ Getting first page...');
	  const page = await pdf.getPage(1);
	  console.log('✅ First page loaded successfully');
  
	  // Step 5: Create viewport
	  console.log('⏳ Creating viewport...');
	  const viewport = page.getViewport({ scale: 4 });
	  console.log('✅ Viewport created:', {
		width: viewport.width,
		height: viewport.height,
		scale: viewport.scale
	  });
  
	  // Step 6: Create canvas
	  console.log('⏳ Creating canvas...');
	  const canvas = document.createElement("canvas");
	  const context = canvas.getContext("2d");
  
	  if (!context) {
		throw new Error('Failed to get 2D context from canvas');
	  }
  
	  canvas.width = viewport.width;
	  canvas.height = viewport.height;
  
	  context.imageSmoothingEnabled = true;
	  context.imageSmoothingQuality = "high";
	  
	  console.log('✅ Canvas created and configured:', {
		width: canvas.width,
		height: canvas.height
	  });
  
	  // Step 7: Render page
	  console.log('⏳ Rendering page to canvas...');
	  await page.render({ canvasContext: context, viewport }).promise;
	  console.log('✅ Page rendered successfully');
  
	  // Step 8: Convert canvas to blob
	  console.log('⏳ Converting canvas to blob...');
	  return new Promise((resolve) => {
		canvas.toBlob(
		  (blob) => {
			if (blob) {
			  console.log('✅ Blob created successfully:', {
				size: blob.size,
				type: blob.type
			  });
  
			  // Create a File from the blob with the same name as the pdf
			  const originalName = file.name.replace(/\.pdf$/i, "");
			  const imageFile = new File([blob], `${originalName}.png`, {
				type: "image/png",
			  });
  
			  console.log('✅ Image file created:', {
				name: imageFile.name,
				size: imageFile.size,
				type: imageFile.type
			  });
  
			  const imageUrl = URL.createObjectURL(blob);
			  console.log('✅ Object URL created:', imageUrl);
  
			  console.log('🎉 PDF conversion completed successfully!');
			  resolve({
				imageUrl: imageUrl,
				file: imageFile,
			  });
			} else {
			  console.error('❌ Failed to create blob from canvas');
			  resolve({
				imageUrl: "",
				file: null,
				error: "Failed to create image blob",
			  });
			}
		  },
		  "image/png",
		  1.0
		);
	  });
	} catch (err) {
	  console.error('❌ PDF conversion failed with error:', err);
	  console.error('❌ Error stack:', (err as Error).stack);
	  console.error('❌ Error name:', (err as Error).name);
	  console.error('❌ Error message:', (err as Error).message);
	  
	  return {
		imageUrl: "",
		file: null,
		error: `Failed to convert PDF: ${(err as Error).message || err}`,
	  };
	}
  }